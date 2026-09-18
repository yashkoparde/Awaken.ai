<?php
require_once __DIR__ . '/db.php';

$pdo = getDb();

// 1. Create or update demo user
$demoEmail = 'demo@awaken.ai';
$demoPass = 'AwakenDemo2026!';
$demoName = 'Alex Chen';
$demoUserId = 'usr_demo_alex_chen_2026';
$token = bin2hex(random_bytes(32));
$passwordHash = password_hash($demoPass, PASSWORD_BCRYPT);

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$demoEmail]);
$existing = $stmt->fetch();

if ($existing) {
    $demoUserId = $existing['id'];
    $uStmt = $pdo->prepare("UPDATE users SET password_hash = ?, display_name = ?, token = ? WHERE id = ?");
    $uStmt->execute([$passwordHash, $demoName, $token, $demoUserId]);
} else {
    $iStmt = $pdo->prepare("INSERT INTO users (id, email, password_hash, display_name, token) VALUES (?, ?, ?, ?, ?)");
    $iStmt->execute([$demoUserId, $demoEmail, $passwordHash, $demoName, $token]);
}

// 2. Insert or update candidate profile
$pStmt = $pdo->prepare("
    INSERT INTO profiles (user_id, full_name, phone, role, experience, domain, target_job, github, leetcode, linkedin, portfolio, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
        full_name = excluded.full_name,
        phone = excluded.phone,
        role = excluded.role,
        experience = excluded.experience,
        domain = excluded.domain,
        target_job = excluded.target_job,
        github = excluded.github,
        leetcode = excluded.leetcode,
        linkedin = excluded.linkedin,
        portfolio = excluded.portfolio,
        updated_at = CURRENT_TIMESTAMP
");

$pStmt->execute([
    $demoUserId,
    $demoName,
    '+1 (555) 438-9201',
    'Full Stack Software Engineer',
    'Mid-Senior (3-5 Yrs)',
    'Distributed Systems & Cloud Architecture',
    'Senior Full Stack Engineer at Top Tech',
    'https://github.com/alexchen-dev',
    'https://leetcode.com/alexchen_code',
    'https://linkedin.com/in/alexchen-tech',
    'https://alexchen.portfolio.dev'
]);

// 3. Clear old demo scans & test scores, then seed fresh ones
$pdo->prepare("DELETE FROM resume_scans WHERE user_id = ?")->execute([$demoUserId]);
$pdo->prepare("DELETE FROM test_scores WHERE user_id = ?")->execute([$demoUserId]);

// Seed Real ATS Resume Scan
$scanId = 'scn_demo_' . bin2hex(random_bytes(8));
$atsScore = 88;
$scanAnalysis = [
    'jobRole' => 'Full Stack Software Engineer',
    'atsScore' => 88,
    'keywordMatchRate' => '91%',
    'matchedKeywords' => ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'System Design', 'CI/CD', 'REST APIs'],
    'missingKeywords' => ['Kafka', 'Kubernetes Helm', 'GraphQL Subscriptions'],
    'contentAnalysis' => 'High-impact resume with strong quantitative STAR achievement metrics and excellent structural alignment with modern ATS parsers.'
];

$sStmt = $pdo->prepare("INSERT INTO resume_scans (id, user_id, type, ats_score, analysis_json) VALUES (?, ?, ?, ?, ?)");
$sStmt->execute([$scanId, $demoUserId, 'ats_scan', $atsScore, json_encode($scanAnalysis)]);

// Seed Real Assessments & Test Scores
$assessments = [
    ['topic' => 'Data Structures & Algorithms (Written)', 'score' => 88],
    ['topic' => 'Quantitative & Logical Aptitude', 'score' => 85],
    ['topic' => 'System Design & Database Architecture', 'score' => 92],
    ['topic' => 'AI Mock Interview Simulator (Technical Round)', 'score' => 89]
];

$tStmt = $pdo->prepare("INSERT INTO test_scores (id, user_id, topic, score) VALUES (?, ?, ?, ?)");
foreach ($assessments as $idx => $t) {
    $tId = 'tst_demo_' . ($idx + 1) . '_' . bin2hex(random_bytes(4));
    $tStmt->execute([$tId, $demoUserId, $t['topic'], $t['score']]);
}

// 4. Output Summary
echo json_encode([
    'success' => true,
    'message' => 'Demo user account seeded successfully in database.',
    'credentials' => [
        'email' => $demoEmail,
        'password' => $demoPass,
        'name' => $demoName,
        'role' => 'Full Stack Software Engineer',
        'userId' => $demoUserId,
        'atsScore' => $atsScore,
        'assessmentsCount' => count($assessments)
    ]
], JSON_PRETTY_PRINT);

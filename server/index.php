<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

// Helper to parse JSON input
function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

// Authenticate helper via Bearer token
function getAuthUser(PDO $pdo): ?array {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
        $stmt = $pdo->prepare("SELECT id, email, display_name, created_at FROM users WHERE token = ? LIMIT 1");
        $stmt->execute([$token]);
        return $stmt->fetch() ?: null;
    }
    return null;
}

$pdo = getDb();
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize route to work when hosted in root, /server, or subfolders
$route = trim(preg_replace('#^/(server/|api/|index\.php/?)?#', '', $requestUri), '/');
// Prepend 'api/' if it was stripped or keep clean routing
if (!str_starts_with($route, 'api/') && $route !== 'admin' && $route !== 'dashboard' && !empty($route)) {
    $route = 'api/' . $route;
}
$method = $_SERVER['REQUEST_METHOD'];

// Visual Admin Dashboard to inspect Users, Profiles, Scans, and Generated Resumes in the browser
if ($route === 'admin' || $route === 'dashboard' || $route === 'api/admin' || empty($route)) {
    header("Content-Type: text/html; charset=UTF-8");
    $users = $pdo->query("SELECT u.id, u.email, u.display_name, u.created_at, p.role, p.domain, p.experience, p.target_job, p.phone FROM users u LEFT JOIN profiles p ON u.id = p.user_id ORDER BY u.created_at DESC")->fetchAll();
    $scans = $pdo->query("SELECT s.id, s.user_id, s.type, s.ats_score, s.created_at, s.analysis_json, u.email, u.display_name FROM resume_scans s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC LIMIT 50")->fetchAll();
    $tests = $pdo->query("SELECT t.id, t.user_id, t.topic, t.score, t.created_at, u.email, u.display_name FROM test_scores t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC LIMIT 50")->fetchAll();
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Awaken.ai - PHP Database & Users Explorer</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 text-slate-100 font-sans p-8">
      <div class="max-w-6xl mx-auto space-y-8">
        <div class="flex justify-between items-center border-b border-white/10 pb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span class="text-xs font-mono uppercase tracking-widest text-emerald-400">Database Online (<?= htmlspecialchars(DB_TYPE) ?>)</span>
            </div>
            <h1 class="text-3xl font-extrabold text-white">PHP Server & Database Explorer</h1>
            <p class="text-slate-400 text-sm mt-1">Live inspection panel for registered accounts, candidate inputs, generated resumes, and test scores.</p>
          </div>
          <?php
            // If running on hosted infinityfree, custom domain, or cloudflare, route to FRONTEND_URL
            $hostHeader = strtolower($_SERVER['HTTP_HOST'] ?? '');
            $isLocal = ($hostHeader === 'localhost' || $hostHeader === '127.0.0.1' || str_starts_with($hostHeader, 'localhost:') || str_starts_with($hostHeader, '127.0.0.1:'));
            $frontendUrl = $isLocal ? 'http://localhost:3000' : FRONTEND_URL;
          ?>
          <a href="<?= htmlspecialchars($frontendUrl) ?>" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all shadow-lg flex items-center gap-2">
            <span>Open Hosted App</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          </a>
        </div>

        <!-- Demo Account Banner for Judges & Evaluators -->
        <div class="p-6 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-blue-500 text-[10px] font-bold uppercase tracking-wider text-white">Pre-Configured Demo Account</span>
              <span class="text-xs text-slate-400 font-mono">Real Assessment & ATS Data Attached</span>
            </div>
            <p class="text-sm font-semibold text-white">Alex Chen (<span class="text-blue-400">Full Stack Software Engineer</span>)</p>
            <p class="text-xs text-slate-300 font-mono">Email: <span class="text-emerald-400 font-bold">demo@awaken.ai</span> &nbsp;|&nbsp; Password: <span class="text-emerald-400 font-bold">AwakenDemo2026!</span></p>
          </div>
          <a href="<?= htmlspecialchars($frontendUrl) ?>" target="_blank" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md">
            Sign In with Demo
          </a>
        </div>

        <!-- Metric Counter Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-6 bg-slate-900 border border-white/5 rounded-2xl">
            <p class="text-xs uppercase tracking-widest font-mono text-slate-500">Registered Users</p>
            <p class="text-4xl font-extrabold text-white mt-2"><?= count($users) ?></p>
          </div>
          <div class="p-6 bg-slate-900 border border-white/5 rounded-2xl">
            <p class="text-xs uppercase tracking-widest font-mono text-slate-500">Resumes & ATS Scans</p>
            <p class="text-4xl font-extrabold text-blue-400 mt-2"><?= count($scans) ?></p>
          </div>
          <div class="p-6 bg-slate-900 border border-white/5 rounded-2xl">
            <p class="text-xs uppercase tracking-widest font-mono text-slate-500">Assessments Completed</p>
            <p class="text-4xl font-extrabold text-emerald-400 mt-2"><?= count($tests) ?></p>
          </div>
        </div>

        <!-- Section 1: Users & Profile Details -->
        <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 class="text-lg font-bold text-white">Registered Users & Candidate Profiles</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-slate-400">
                  <th class="py-3 px-4">User ID</th>
                  <th class="py-3 px-4">Name</th>
                  <th class="py-3 px-4">Email</th>
                  <th class="py-3 px-4">Target Role</th>
                  <th class="py-3 px-4">Experience</th>
                  <th class="py-3 px-4">Domain</th>
                  <th class="py-3 px-4">Created At</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-slate-300">
                <?php if (empty($users)): ?>
                  <tr><td colspan="7" class="py-4 px-4 text-center text-slate-500">No users registered yet.</td></tr>
                <?php else: foreach ($users as $u): ?>
                  <tr>
                    <td class="py-3 px-4 font-mono text-slate-400"><?= htmlspecialchars($u['id']) ?></td>
                    <td class="py-3 px-4 font-bold text-white"><?= htmlspecialchars($u['display_name']) ?></td>
                    <td class="py-3 px-4 text-blue-400"><?= htmlspecialchars($u['email']) ?></td>
                    <td class="py-3 px-4"><?= htmlspecialchars($u['role'] ?: 'Not set') ?></td>
                    <td class="py-3 px-4"><?= htmlspecialchars($u['experience'] ?: 'Entry Level') ?></td>
                    <td class="py-3 px-4"><?= htmlspecialchars($u['domain'] ?: 'Tech') ?></td>
                    <td class="py-3 px-4 text-slate-500 font-mono"><?= htmlspecialchars($u['created_at']) ?></td>
                  </tr>
                <?php endforeach; endif; ?>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 2: Resumes & ATS Scans -->
        <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 class="text-lg font-bold text-white">Generated Resumes & ATS Scans</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-slate-400">
                  <th class="py-3 px-4">Scan ID</th>
                  <th class="py-3 px-4">User</th>
                  <th class="py-3 px-4">Type</th>
                  <th class="py-3 px-4">ATS Match Score</th>
                  <th class="py-3 px-4">Created At</th>
                  <th class="py-3 px-4">Content / Output</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-slate-300">
                <?php if (empty($scans)): ?>
                  <tr><td colspan="6" class="py-4 px-4 text-center text-slate-500">No resumes generated or scanned yet.</td></tr>
                <?php else: foreach ($scans as $s): ?>
                  <tr>
                    <td class="py-3 px-4 font-mono text-slate-400"><?= htmlspecialchars($s['id']) ?></td>
                    <td class="py-3 px-4"><?= htmlspecialchars($s['display_name'] ?: $s['email'] ?: $s['user_id']) ?></td>
                    <td class="py-3 px-4"><span class="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-mono text-[9px]"><?= htmlspecialchars($s['type']) ?></span></td>
                    <td class="py-3 px-4 font-bold font-mono text-emerald-400"><?= htmlspecialchars($s['ats_score']) ?>%</td>
                    <td class="py-3 px-4 text-slate-500 font-mono"><?= htmlspecialchars($s['created_at']) ?></td>
                    <td class="py-3 px-4">
                      <details class="cursor-pointer">
                        <summary class="text-blue-400 hover:underline">View Generated Details</summary>
                        <pre class="mt-2 p-3 bg-slate-950 rounded-lg text-[10px] text-slate-400 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono"><?= htmlspecialchars($s['analysis_json']) ?></pre>
                      </details>
                    </td>
                  </tr>
                <?php endforeach; endif; ?>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: Assessment & Interview Scores -->
        <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 class="text-lg font-bold text-white">Assessments & Mock Interview History</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-slate-400">
                  <th class="py-3 px-4">Test ID</th>
                  <th class="py-3 px-4">User</th>
                  <th class="py-3 px-4">Topic</th>
                  <th class="py-3 px-4">Score</th>
                  <th class="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-slate-300">
                <?php if (empty($tests)): ?>
                  <tr><td colspan="5" class="py-4 px-4 text-center text-slate-500">No assessment scores recorded yet.</td></tr>
                <?php else: foreach ($tests as $t): ?>
                  <tr>
                    <td class="py-3 px-4 font-mono text-slate-400"><?= htmlspecialchars($t['id']) ?></td>
                    <td class="py-3 px-4"><?= htmlspecialchars($t['display_name'] ?: $t['email'] ?: $t['user_id']) ?></td>
                    <td class="py-3 px-4 font-medium"><?= htmlspecialchars($t['topic']) ?></td>
                    <td class="py-3 px-4 font-bold font-mono text-emerald-400"><?= htmlspecialchars($t['score']) ?>%</td>
                    <td class="py-3 px-4 text-slate-500 font-mono"><?= htmlspecialchars($t['created_at']) ?></td>
                  </tr>
                <?php endforeach; endif; ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </body>
    </html>
    <?php
    exit;
}

// Route dispatcher
if ($route === 'api/health' || $route === 'health' || $route === '') {
    echo json_encode([
        'status' => 'online',
        'server' => 'Awaken.ai PHP Backend',
        'database' => DB_TYPE,
        'timestamp' => date('c')
    ]);
    exit;
}


// Auth routes
if ($route === 'api/auth/register' && $method === 'POST') {
    $input = getJsonInput();
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';
    $displayName = trim($input['name'] ?? $input['displayName'] ?? explode('@', $email)[0]);

    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        exit;
    }

    // Check duplicate
    $check = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $check->execute([$email]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'An account with this email already exists']);
        exit;
    }

    $userId = 'usr_' . bin2hex(random_bytes(16));
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    $token = bin2hex(random_bytes(32));

    $stmt = $pdo->prepare("INSERT INTO users (id, email, password_hash, display_name, token) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $email, $passwordHash, $displayName, $token]);

    // Create blank profile
    $pStmt = $pdo->prepare("INSERT INTO profiles (user_id, full_name) VALUES (?, ?)");
    $pStmt->execute([$userId, $displayName]);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'uid' => $userId,
            'id' => $userId,
            'email' => $email,
            'displayName' => $displayName
        ]
    ]);
    exit;
}

if ($route === 'api/auth/login' && $method === 'POST') {
    $input = getJsonInput();
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        exit;
    }

    // Refresh token
    $token = bin2hex(random_bytes(32));
    $up = $pdo->prepare("UPDATE users SET token = ? WHERE id = ?");
    $up->execute([$token, $user['id']]);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'uid' => $user['id'],
            'id' => $user['id'],
            'email' => $user['email'],
            'displayName' => $user['display_name']
        ]
    ]);
    exit;
}

if ($route === 'api/auth/me' && $method === 'GET') {
    $user = getAuthUser($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    echo json_encode([
        'user' => [
            'uid' => $user['id'],
            'id' => $user['id'],
            'email' => $user['email'],
            'displayName' => $user['display_name']
        ]
    ]);
    exit;
}

// Profile routes
if ($route === 'api/profile') {
    $user = getAuthUser($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ? LIMIT 1");
        $stmt->execute([$user['id']]);
        $profile = $stmt->fetch();
        echo json_encode(['profile' => $profile ?: []]);
        exit;
    }

    if ($method === 'POST') {
        $data = getJsonInput();
        $stmt = $pdo->prepare("
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
        $stmt->execute([
            $user['id'],
            $data['name'] ?? $data['full_name'] ?? $user['display_name'],
            $data['phone'] ?? '',
            $data['role'] ?? '',
            $data['experience'] ?? '',
            $data['domain'] ?? '',
            $data['targetJob'] ?? $data['target_job'] ?? '',
            $data['github'] ?? '',
            $data['leetcode'] ?? '',
            $data['linkedin'] ?? '',
            $data['portfolio'] ?? ''
        ]);

        echo json_encode(['success' => true, 'message' => 'Profile updated']);
        exit;
    }
}

// Resumes & Scans routes
if ($route === 'api/resumes') {
    $user = getAuthUser($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM resume_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
        $stmt->execute([$user['id']]);
        $scans = $stmt->fetchAll();
        echo json_encode(['scans' => $scans]);
        exit;
    }

    if ($method === 'POST') {
        $data = getJsonInput();
        $scanId = 'scn_' . bin2hex(random_bytes(16));
        $score = intval($data['atsScore'] ?? $data['ats_score'] ?? 0);
        $jsonPayload = json_encode($data['analysis'] ?? $data);

        $stmt = $pdo->prepare("INSERT INTO resume_scans (id, user_id, type, ats_score, analysis_json) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$scanId, $user['id'], 'ats_scan', $score, $jsonPayload]);

        echo json_encode(['success' => true, 'scanId' => $scanId]);
        exit;
    }
}

// Tests & Assessments routes
if ($route === 'api/tests') {
    $user = getAuthUser($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT topic, score, created_at FROM test_scores WHERE user_id = ? ORDER BY created_at ASC");
        $stmt->execute([$user['id']]);
        $tests = $stmt->fetchAll();
        echo json_encode(['tests' => $tests]);
        exit;
    }

    if ($method === 'POST') {
        $data = getJsonInput();
        $testId = 'tst_' . bin2hex(random_bytes(16));
        $topic = trim($data['topic'] ?? 'General Assessment');
        $score = intval($data['score'] ?? 0);

        $stmt = $pdo->prepare("INSERT INTO test_scores (id, user_id, topic, score) VALUES (?, ?, ?, ?)");
        $stmt->execute([$testId, $user['id'], $topic, $score]);

        echo json_encode(['success' => true, 'testId' => $testId]);
        exit;
    }
}

// Fallback 404
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found', 'route' => $route]);


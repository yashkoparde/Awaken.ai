export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const QUESTION_BANK: Record<string, Record<'easy' | 'medium' | 'hard', AssessmentQuestion[]>> = {
  coding: {
    easy: [
      {
        question: "Which data structure operates on a First-In, First-Out (FIFO) principle?",
        options: ["Queue", "Stack", "Binary Search Tree", "Max Heap"],
        correctAnswer: "Queue",
        explanation: "A Queue processes elements in the exact order they arrive: first-in, first-out.",
        difficulty: "easy"
      },
      {
        question: "What is the time complexity of searching an element in an unsorted array of size N?",
        options: ["O(N)", "O(1)", "O(log N)", "O(N log N)"],
        correctAnswer: "O(N)",
        explanation: "In an unsorted array, linear search must check each element one by one in worst case O(N).",
        difficulty: "easy"
      },
      {
        question: "Which operator in JavaScript checks both value and type equality without implicit coercion?",
        options: ["===", "==", "=", "!="],
        correctAnswer: "===",
        explanation: "The strict equality operator (===) verifies that both type and value match.",
        difficulty: "easy"
      },
      {
        question: "What is the return value of Array.prototype.push() in JavaScript?",
        options: ["The new length of the array", "The modified array itself", "The pushed element", "undefined"],
        correctAnswer: "The new length of the array",
        explanation: "push() appends elements to the end of an array and returns its new integer length.",
        difficulty: "easy"
      },
      {
        question: "Which data structure uses LIFO (Last In, First Out) ordering?",
        options: ["Stack", "Queue", "Priority Queue", "Linked List"],
        correctAnswer: "Stack",
        explanation: "Stacks insert and remove from the top, obeying Last In, First Out semantics.",
        difficulty: "easy"
      }
    ],
    medium: [
      {
        question: "Which data structure provides average O(1) time complexity for insert, search, and delete operations?",
        options: ["Hash Table", "Binary Search Tree", "Balanced AVL Tree", "Sorted Array"],
        correctAnswer: "Hash Table",
        explanation: "Hash tables compute an index via a hashing function, allowing constant-time average access for search, insertion, and deletion.",
        difficulty: "medium"
      },
      {
        question: "What is the worst-case time complexity of the standard QuickSort algorithm when picking the first or last element as pivot?",
        options: ["O(N^2)", "O(N log N)", "O(N)", "O(log N)"],
        correctAnswer: "O(N^2)",
        explanation: "If the pivot consistently divides the array into subproblems of size 0 and N-1 (e.g., when already sorted), QuickSort degenerates to O(N^2).",
        difficulty: "medium"
      },
      {
        question: "In graph theory, which algorithm guarantees finding the shortest path in a weighted graph with non-negative edge weights?",
        options: ["Dijkstra's Algorithm", "Breadth-First Search (BFS)", "Floyd-Warshall (all-pairs only)", "Depth-First Search (DFS)"],
        correctAnswer: "Dijkstra's Algorithm",
        explanation: "Dijkstra's greedy algorithm computes single-source shortest paths on graphs with non-negative edge weights in O((V + E) log V) using a min-heap.",
        difficulty: "medium"
      },
      {
        question: "Which of the following techniques is most effective for solving the 'Longest Common Subsequence' (LCS) problem?",
        options: ["Dynamic Programming (Tabulation/Memoization)", "Greedy Choice Strategy", "Divide and Conquer without state caching", "Linear Binary Search"],
        correctAnswer: "Dynamic Programming (Tabulation/Memoization)",
        explanation: "LCS exhibits optimal substructure and overlapping subproblems, which Dynamic Programming solves in O(M*N) time.",
        difficulty: "medium"
      },
      {
        question: "What is the primary difference between a process and a thread in modern operating systems?",
        options: [
          "Threads share the parent process's memory address space, while processes possess isolated address spaces.",
          "Processes share execution contexts while threads execute in completely isolated memory blocks.",
          "Threads cannot be scheduled independently by the operating system kernel.",
          "A process can only ever spawn one single thread throughout its lifecycle."
        ],
        correctAnswer: "Threads share the parent process's memory address space, while processes possess isolated address spaces.",
        explanation: "Threads of the same process share code, data, and OS resources like open files, but maintain their own program counters and call stacks.",
        difficulty: "medium"
      }
    ],
    hard: [
      {
        question: "What is the amortized time complexity of union and find operations in a Disjoint Set Union (DSU) with rank and path compression?",
        options: ["O(α(N)) - Inverse Ackermann", "O(log N)", "O(1) strictly", "O(N)"],
        correctAnswer: "O(α(N)) - Inverse Ackermann",
        explanation: "Combining path compression with union by rank guarantees near-constant amortized time bounded by the inverse Ackermann function α(N) < 5 for all practical N.",
        difficulty: "hard"
      },
      {
        question: "In Aho-Corasick string matching, what is the preprocessing time complexity to construct the trie and failure links for a set of patterns of total length L?",
        options: ["O(L * Σ)", "O(L^2)", "O(N * M)", "O(2^L)"],
        correctAnswer: "O(L * Σ)",
        explanation: "Building the keyword trie and setting suffix failure transitions using BFS takes linear time with respect to total pattern length multiplied by alphabet size Σ.",
        difficulty: "hard"
      },
      {
        question: "Which concurrency control anomaly can occur under 'Repeatable Read' isolation that is completely prevented under 'Serializable' isolation?",
        options: ["Phantom Read", "Dirty Read", "Non-Repeatable Read", "Dirty Write"],
        correctAnswer: "Phantom Read",
        explanation: "Repeatable Read locks rows read, but new rows inserted by concurrent transactions matching the range predicate (phantoms) can appear on subsequent reads unless predicate locking (Serializable) is enforced.",
        difficulty: "hard"
      },
      {
        question: "What is the tightest upper bound on maximum flow in a network with V vertices and E edges using Dinic's Algorithm with unit network capacities?",
        options: ["O(E * min(V^(2/3), E^(1/2)))", "O(V^2 * E)", "O(V * E^2)", "O(E * log V)"],
        correctAnswer: "O(E * min(V^(2/3), E^(1/2)))",
        explanation: "On networks with unit capacities (or bipartite matching networks), Dinic's blocking flow approach converges in O(E * min(V^(2/3), E^(1/2))) or O(E * sqrt(V)).",
        difficulty: "hard"
      },
      {
        question: "In lock-free multi-threaded programming, which CPU primitive is fundamental for atomic Read-Modify-Write without mutex acquisition?",
        options: ["Compare-And-Swap (CAS)", "Spinlock yield", "Condition variable wait", "Volatile read without memory barrier"],
        correctAnswer: "Compare-And-Swap (CAS)",
        explanation: "CAS atomically updates a memory location only if it equals an expected old value, serving as the mathematical backbone for lock-free data structures.",
        difficulty: "hard"
      }
    ]
  },
  mcq: {
    easy: [
      {
        question: "What does HTML stand for?",
        options: ["HyperText Markup Language", "HyperTransfer Machine Language", "HighText Multi Language", "Hyperlink Text Management Log"],
        correctAnswer: "HyperText Markup Language",
        explanation: "HTML is the standard markup language used to structure web documents.",
        difficulty: "easy"
      },
      {
        question: "Which port does default unencrypted HTTP traffic use?",
        options: ["80", "443", "8080", "22"],
        correctAnswer: "80",
        explanation: "Standard HTTP communicates over TCP port 80, while encrypted HTTPS uses port 443.",
        difficulty: "easy"
      },
      {
        question: "Which of the following is a NoSQL document database?",
        options: ["MongoDB", "PostgreSQL", "SQLite", "Oracle DB"],
        correctAnswer: "MongoDB",
        explanation: "MongoDB stores data in JSON-like BSON documents, classifying it as a document NoSQL store.",
        difficulty: "easy"
      },
      {
        question: "What command in Git stages all modified and new files for commit?",
        options: ["git add .", "git commit -a", "git push", "git init"],
        correctAnswer: "git add .",
        explanation: "git add . adds all current directory changes into the Git staging area.",
        difficulty: "easy"
      },
      {
        question: "What does CSS stand for in web development?",
        options: ["Cascading Style Sheets", "Computer Style System", "Creative Styling Standard", "Coded Sheet Syntax"],
        correctAnswer: "Cascading Style Sheets",
        explanation: "CSS styles the presentation and layout of HTML documents.",
        difficulty: "easy"
      }
    ],
    medium: [
      {
        question: "In distributed systems, what does the CAP theorem state regarding network partitions?",
        options: [
          "A distributed data store can simultaneously provide at most two of Consistency, Availability, and Partition Tolerance.",
          "Every distributed database must sacrifice Partition Tolerance to achieve sub-millisecond latency.",
          "Systems can achieve 100% Consistency and Availability simultaneously across an asynchronous partitioned network.",
          "Consistency is impossible in any multi-node architecture."
        ],
        correctAnswer: "A distributed data store can simultaneously provide at most two of Consistency, Availability, and Partition Tolerance.",
        explanation: "Eric Brewer's CAP theorem proves that in the presence of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A).",
        difficulty: "medium"
      },
      {
        question: "In modern web protocols, what key optimization does HTTP/2 introduce over HTTP/1.1?",
        options: [
          "Multiplexed bidirectional streams over a single TCP connection, eliminating head-of-line blocking at the application layer.",
          "Mandatory UDP transmission replacing TCP across all network handshakes.",
          "Deprecation of TLS encryption in favor of unencrypted raw text frames.",
          "Removal of client-side caching headers."
        ],
        correctAnswer: "Multiplexed bidirectional streams over a single TCP connection, eliminating head-of-line blocking at the application layer.",
        explanation: "HTTP/2 introduces a binary framing layer allowing interleaved requests and responses over a single TCP socket with header compression (HPACK).",
        difficulty: "medium"
      },
      {
        question: "What is the purpose of an index in a relational database management system (RDBMS)?",
        options: [
          "To speed up record retrieval at the cost of additional storage and write latency.",
          "To compress tabular data and prevent data mutation.",
          "To encrypt sensitive columns in compliance with security guidelines.",
          "To automatically normalize tables into Boyce-Codd Normal Form (BCNF)."
        ],
        correctAnswer: "To speed up record retrieval at the cost of additional storage and write latency.",
        explanation: "B-Tree or Hash indexes enable fast point and range queries without scanning every row, though inserts/updates require index maintenance.",
        difficulty: "medium"
      },
      {
        question: "Which garbage collection mechanism in high-level runtimes (like V8 or JVM) organizes memory into Young and Old generations?",
        options: [
          "Generational Garbage Collection",
          "Reference Counting without cycle detection",
          "Manual Free List Allocator",
          "Deterministic Stack Unwinding"
        ],
        correctAnswer: "Generational Garbage Collection",
        explanation: "Generational hypothesis posits most objects die young; separating Young (Eden/Survivor) and Tenured generations minimizes full GC pauses.",
        difficulty: "medium"
      },
      {
        question: "What HTTP response status code should be returned when a client attempts to access a protected resource without valid credentials?",
        options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "400 Bad Request"],
        correctAnswer: "401 Unauthorized",
        explanation: "RFC 9110 specifies 401 Unauthorized when authentication credentials are required and missing or invalid. (403 is used when authenticated but permissions are denied).",
        difficulty: "medium"
      }
    ],
    hard: [
      {
        question: "In the Raft distributed consensus protocol, what happens when a Follower node times out without receiving heartbeats from a Leader?",
        options: [
          "It increments its currentTerm, transitions to Candidate, votes for itself, and broadcasts RequestVote RPCs.",
          "It immediately assumes the Leader role and issues AppendEntries heartbeats.",
          "It disconnects from the cluster and rejoins as a learner.",
          "It initiates a TCP RST packet to force node reboot."
        ],
        correctAnswer: "It increments its currentTerm, transitions to Candidate, votes for itself, and broadcasts RequestVote RPCs.",
        explanation: "Raft leader election specifies that an election timeout transitions a follower to candidate status, advancing term counter and requesting quorum votes.",
        difficulty: "hard"
      },
      {
        question: "What problem does the Byzantine Generals Problem model in distributed fault tolerance?",
        options: [
          "Consensus in networks where actors may fail arbitrarily, fail to transmit, or actively send conflicting/malicious messages.",
          "Deadlock detection in distributed two-phase commit transactions.",
          "Preventing DDoS attacks on edge reverse proxies.",
          "Optimal routing in packet-switched mesh topologies."
        ],
        correctAnswer: "Consensus in networks where actors may fail arbitrarily, fail to transmit, or actively send conflicting/malicious messages.",
        explanation: "BFT models arbitrary malicious/faulty behaviors where nodes can collude or equivocate, requiring > 3f + 1 total nodes to tolerate f faulty nodes.",
        difficulty: "hard"
      },
      {
        question: "In LSM-tree based storage engines (e.g. RocksDB, Cassandra), what role does the Bloom Filter play in read path optimization?",
        options: [
          "Quickly determines if a given key definitely does NOT exist in an SSTable to prevent unnecessary random disk I/O.",
          "Maintains lexicographical sorting of SSTable block indexes.",
          "Encrypts written disk blocks during compaction.",
          "Coordinates garbage collection of tombstoned records."
        ],
        correctAnswer: "Quickly determines if a given key definitely does NOT exist in an SSTable to prevent unnecessary random disk I/O.",
        explanation: "Bloom filters test set membership with zero false negatives: if it says absent, the engine skips searching that on-disk SSTable completely.",
        difficulty: "hard"
      },
      {
        question: "Under the PACELC theorem, what tradeoff does a distributed system make when there is NO network partition?",
        options: [
          "Tradeoff between Latency (L) and Consistency (C).",
          "Tradeoff between Partition tolerance (P) and Durability (D).",
          "Tradeoff between Availability (A) and Elasticity (E).",
          "Tradeoff between Throughput (T) and Encryption (E)."
        ],
        correctAnswer: "Tradeoff between Latency (L) and Consistency (C).",
        explanation: "PACELC states: if Partition (P), choose Availability (A) or Consistency (C); Else (E), choose Latency (L) or Consistency (C).",
        difficulty: "hard"
      },
      {
        question: "What is the primary vulnerability prevented by implementing Proof-of-Key-for-Code-Exchange (PKCE) in OAuth 2.0 authorization code flow?",
        options: [
          "Authorization code interception attack on public clients lacking client secrets.",
          "Cross-Site Scripting (XSS) in local storage token cache.",
          "SQL injection in authentication endpoints.",
          "DNS spoofing during certificate renewal."
        ],
        correctAnswer: "Authorization code interception attack on public clients lacking client secrets.",
        explanation: "PKCE binds authorization code requests to token exchange via code_verifier and code_challenge, preventing intercepted codes from being redeemed by rogue apps.",
        difficulty: "hard"
      }
    ]
  },
  sql: {
    easy: [
      {
        question: "Which SQL keyword is used to retrieve data from a database table?",
        options: ["SELECT", "GET", "EXTRACT", "PULL"],
        correctAnswer: "SELECT",
        explanation: "The SELECT statement is used to query and extract records from database tables.",
        difficulty: "easy"
      },
      {
        question: "Which clause filters rows in an SQL query?",
        options: ["WHERE", "FILTER", "LIMIT", "MATCH"],
        correctAnswer: "WHERE",
        explanation: "WHERE specifies conditions that records must satisfy to be selected or updated.",
        difficulty: "easy"
      },
      {
        question: "How do you count the total number of rows in an 'employees' table?",
        options: ["SELECT COUNT(*) FROM employees;", "SELECT TOTAL() FROM employees;", "SELECT ROWS(*) FROM employees;", "SELECT SUM(rows) FROM employees;"],
        correctAnswer: "SELECT COUNT(*) FROM employees;",
        explanation: "COUNT(*) returns the total count of rows matching the query criteria.",
        difficulty: "easy"
      },
      {
        question: "Which SQL constraint prevents duplicate values in a column?",
        options: ["UNIQUE", "NOT NULL", "CHECK", "DEFAULT"],
        correctAnswer: "UNIQUE",
        explanation: "The UNIQUE constraint ensures all values in a column are distinct from one another.",
        difficulty: "easy"
      },
      {
        question: "Which command removes all rows from a table while keeping its structure intact?",
        options: ["TRUNCATE TABLE", "DROP TABLE", "REMOVE TABLE", "DISCARD TABLE"],
        correctAnswer: "TRUNCATE TABLE",
        explanation: "TRUNCATE TABLE quickly removes all data rows without deleting the table schema itself.",
        difficulty: "easy"
      }
    ],
    medium: [
      {
        question: "Which SQL clause is used to filter aggregated group records produced by a GROUP BY clause?",
        options: ["HAVING", "WHERE", "ORDER BY", "QUALIFY"],
        correctAnswer: "HAVING",
        explanation: "WHERE filters individual rows prior to grouping, while HAVING filters aggregated metric buckets after GROUP BY execution.",
        difficulty: "medium"
      },
      {
        question: "What is the key functional difference between RANK() and DENSE_RANK() window functions in SQL?",
        options: [
          "RANK() skips ranks when ties occur (e.g., 1, 2, 2, 4), while DENSE_RANK() produces contiguous ranks (e.g., 1, 2, 2, 3).",
          "DENSE_RANK() can only be used on string columns, while RANK() applies to numeric columns.",
          "RANK() ignores ties and assigns arbitrary consecutive integers.",
          "DENSE_RANK() does not support the OVER (ORDER BY ...) clause."
        ],
        correctAnswer: "RANK() skips ranks when ties occur (e.g., 1, 2, 2, 4), while DENSE_RANK() produces contiguous ranks (e.g., 1, 2, 2, 3).",
        explanation: "When equal values are encountered, RANK() leaves gaps corresponding to the number of ties, whereas DENSE_RANK() maintains sequential integers without gaps.",
        difficulty: "medium"
      },
      {
        question: "Which type of SQL JOIN returns all rows from the left table and only matching rows from the right table?",
        options: ["LEFT OUTER JOIN", "INNER JOIN", "CROSS JOIN", "RIGHT OUTER JOIN"],
        correctAnswer: "LEFT OUTER JOIN",
        explanation: "LEFT JOIN retains every record from the left table and populates NULL for right-table columns when no predicate match is satisfied.",
        difficulty: "medium"
      },
      {
        question: "What does the ACID property 'Atomicity' guarantee in database transaction management?",
        options: [
          "All operations within the transaction succeed completely, or none of them are committed (all-or-nothing).",
          "Transactions execute concurrently without interfering with one another.",
          "Data remains consistent with all integrity constraints after the transaction completes.",
          "Committed transactions survive hardware power failures."
        ],
        correctAnswer: "All operations within the transaction succeed completely, or none of them are committed (all-or-nothing).",
        explanation: "Atomicity ensures transactional boundaries are indivisible: if any statement fails, the entire transaction is rolled back.",
        difficulty: "medium"
      },
      {
        question: "Which database index structure is predominantly utilized by relational database engines (PostgreSQL, MySQL InnoDB) for range queries?",
        options: ["B+ Tree", "Hash Table", "Skip List", "Bloom Filter"],
        correctAnswer: "B+ Tree",
        explanation: "B+ Trees store all data pointers in linked leaf nodes, making sequential range scans (BETWEEN, >, <) highly cache-efficient.",
        difficulty: "medium"
      }
    ],
    hard: [
      {
        question: "In PostgreSQL or MySQL, what is an 'Index-Only Scan' (Covering Index)?",
        options: [
          "A query execution where all requested columns reside in the index itself, avoiding table heap/data page lookup entirely.",
          "An index created solely on foreign keys.",
          "A scan that disables index usage to force a sequential table scan.",
          "An index that cannot be updated once created."
        ],
        correctAnswer: "A query execution where all requested columns reside in the index itself, avoiding table heap/data page lookup entirely.",
        explanation: "When an index contains every column needed by the SELECT, WHERE, and JOIN clauses, the engine reads data directly from the index tree without fetching heap pages.",
        difficulty: "hard"
      },
      {
        question: "What is the primary risk of using 'SELECT FOR UPDATE' across multiple interrelated tables without consistent locking order?",
        options: ["Deadlock between concurrent transactions", "Immediate loss of table constraints", "Silent data corruption", "Index fragmentation"],
        correctAnswer: "Deadlock between concurrent transactions",
        explanation: "If Transaction A locks Row 1 then requests Row 2, while Transaction B locks Row 2 then requests Row 1, a cyclic wait deadlock is triggered.",
        difficulty: "hard"
      },
      {
        question: "What does the QUALIFY clause do in modern SQL dialects (e.g. Snowflake, BigQuery, Databricks)?",
        options: [
          "Filters results produced by window functions without requiring an outer wrapper subquery or CTE.",
          "Validates data types against schema constraints.",
          "Enforces row-level security masking policies.",
          "Determines user query execution quota."
        ],
        correctAnswer: "Filters results produced by window functions without requiring an outer wrapper subquery or CTE.",
        explanation: "QUALIFY acts like HAVING but operates directly on the output of window functions (e.g. QUALIFY ROW_NUMBER() OVER (...) = 1).",
        difficulty: "hard"
      },
      {
        question: "In high-throughput databases, what is 'Write Amplification' in write-ahead-logging and B-Trees?",
        options: [
          "The ratio of bytes written to persistent storage versus the number of logical bytes requested by the application.",
          "Automatic duplication of data across read replicas.",
          "Exponential memory consumption in the query parser.",
          "Amplification of network bandwidth during full backups."
        ],
        correctAnswer: "The ratio of bytes written to persistent storage versus the number of logical bytes requested by the application.",
        explanation: "Updating a small 50-byte record often requires writing an entire 8KB/16KB page to disk, plus WAL logs, creating write amplification.",
        difficulty: "hard"
      },
      {
        question: "How does MVCC (Multi-Version Concurrency Control) implement non-blocking concurrent reads during active writes in engines like InnoDB and PostgreSQL?",
        options: [
          "By retaining multiple snapshots/versions of rows using undo logs or tuple xmin/xmax timestamps, allowing readers to view consistent point-in-time snapshots.",
          "By locking the entire database table with a shared mutex.",
          "By buffering all writes to memory and delaying transaction commits.",
          "By forcing readers into serialized queues."
        ],
        correctAnswer: "By retaining multiple snapshots/versions of rows using undo logs or tuple xmin/xmax timestamps, allowing readers to view consistent point-in-time snapshots.",
        explanation: "MVCC ensures readers do not block writers and writers do not block readers by maintaining historical versions of modified rows.",
        difficulty: "hard"
      }
    ]
  },
  debugging: {
    easy: [
      {
        question: "What causes a 'ReferenceError: x is not defined' in JavaScript?",
        options: [
          "Accessing a variable that has never been declared in any reachable scope.",
          "Calling a function with incorrect parameter count.",
          "Parsing invalid JSON strings.",
          "Dividing a floating-point number by zero."
        ],
        correctAnswer: "Accessing a variable that has never been declared in any reachable scope.",
        explanation: "A ReferenceError occurs when attempting to read a variable identifier that does not exist in local or global scope.",
        difficulty: "easy"
      },
      {
        question: "Which method prints diagnostic messages to the browser developer tools console?",
        options: ["console.log()", "print.screen()", "debug.write()", "terminal.output()"],
        correctAnswer: "console.log()",
        explanation: "console.log() writes informational and debugging objects to the developer console.",
        difficulty: "easy"
      },
      {
        question: "What does the 'typeof null' expression evaluate to in JavaScript due to legacy implementation?",
        options: ["'object'", "'null'", "'undefined'", "'boolean'"],
        correctAnswer: "'object'",
        explanation: "In JavaScript's initial implementation, values had type tags, and null had a zero tag matching object.",
        difficulty: "easy"
      },
      {
        question: "How do you inspect network requests and status codes in Google Chrome or Firefox?",
        options: [
          "Open Developer Tools and inspect the 'Network' tab.",
          "Open Task Manager.",
          "Inspect the Elements stylesheet panel.",
          "Check the browser download history."
        ],
        correctAnswer: "Open Developer Tools and inspect the 'Network' tab.",
        explanation: "The Network panel captures HTTP requests, payloads, response headers, and timing metrics.",
        difficulty: "easy"
      },
      {
        question: "What is the typical result of calling .toUpperCase() on an undefined variable in JavaScript?",
        options: [
          "TypeError: Cannot read properties of undefined",
          "Returns empty string ''",
          "Returns 'UNDEFINED'",
          "SyntaxError: Invalid token"
        ],
        correctAnswer: "TypeError: Cannot read properties of undefined",
        explanation: "Calling methods on undefined or null throws a TypeError because primitive undefined has no object wrapper.",
        difficulty: "easy"
      }
    ],
    medium: [
      {
        question: "In asynchronous JavaScript, what common issue occurs when forgetting to 'await' a Promise inside an async try-catch block?",
        options: [
          "Uncaught promise rejections occur outside the try-catch block because the function returns the pending promise before resolution.",
          "The browser halts execution and crashes the event loop immediately.",
          "The Promise automatically converts into a synchronous blocking primitive.",
          "The JavaScript engine automatically retries the rejected promise indefinitely."
        ],
        correctAnswer: "Uncaught promise rejections occur outside the try-catch block because the function returns the pending promise before resolution.",
        explanation: "Returning a Promise without 'await' inside try/catch bypasses local catch blocks when rejected, triggering an unhandled rejection.",
        difficulty: "medium"
      },
      {
        question: "What causes a 'Maximum call stack size exceeded' error in recursive function execution?",
        options: [
          "Missing or unreachable base condition causing unbounded recursive stack frame allocation.",
          "Exceeding heap memory quota with large objects.",
          "Passing undefined arguments into a pure mathematical function.",
          "Calling synchronous functions inside a Web Worker thread."
        ],
        correctAnswer: "Missing or unreachable base condition causing unbounded recursive stack frame allocation.",
        explanation: "Each recursive call consumes a stack frame; lacking a terminating base condition exhausts the call stack boundary.",
        difficulty: "medium"
      },
      {
        question: "What is a common symptom of a memory leak in a Single Page Application (SPA)?",
        options: [
          "Steadily increasing browser memory usage over time leading to UI stutter and eventual tab crash, caused by dangling event listeners or uncleaned subscriptions.",
          "Instant HTTP 500 status codes on external API calls.",
          "CSS styles failing to compile on window resize.",
          "Automatic clearing of localStorage cookies."
        ],
        correctAnswer: "Steadily increasing browser memory usage over time leading to UI stutter and eventual tab crash, caused by dangling event listeners or uncleaned subscriptions.",
        explanation: "Retaining references in closures, global arrays, or uncleaned DOM event handlers prevents the Garbage Collector from freeing detached memory.",
        difficulty: "medium"
      },
      {
        question: "In concurrent programming, what is a 'Race Condition'?",
        options: [
          "A flaw where system output depends on the non-deterministic sequence or timing of concurrent execution threads.",
          "An algorithm that runs faster than O(N log N) comparison sort limits.",
          "When two processes perpetually wait for locks held by each other (deadlock).",
          "When a CPU core runs at 100% capacity due to an infinite loop."
        ],
        correctAnswer: "A flaw where system output depends on the non-deterministic sequence or timing of concurrent execution threads.",
        explanation: "Race conditions arise when multiple threads access shared mutable state without proper synchronization (mutexes, semaphores, or atomic operations).",
        difficulty: "medium"
      },
      {
        question: "Why might a React component re-render infinitely when updating state inside a `useEffect` hook?",
        options: [
          "The useEffect dependency array includes the state variable being mutated inside the effect without a conditional guard.",
          "The component is wrapped inside React.memo.",
          "The effect returns a cleanup callback function.",
          "The component is rendered within a StrictMode tag."
        ],
        correctAnswer: "The useEffect dependency array includes the state variable being mutated inside the effect without a conditional guard.",
        explanation: "Mutating `foo` inside `useEffect(..., [foo])` triggers a re-render, which re-runs the effect, mutating `foo` again in an infinite loop.",
        difficulty: "medium"
      }
    ],
    hard: [
      {
        question: "In Node.js or high-performance C++ backend services, what tool is most effective for diagnosing CPU event-loop blockage and flamegraph generation?",
        options: [
          "Linux perf / clinic.js flamegraph profiling",
          "Adding console.time() statements around entire server listener",
          "Using Wireshark packet capture",
          "Checking heap dump sizes only"
        ],
        correctAnswer: "Linux perf / clinic.js flamegraph profiling",
        explanation: "Sampling profilers like Linux perf and clinic.js inspect stack traces periodically to pinpoint which hot synchronous functions monopolize the CPU loop.",
        difficulty: "hard"
      },
      {
        question: "What is an 'ABA problem' in lock-free concurrent algorithm design?",
        options: [
          "A thread reads value A, gets preempted; other threads change A to B and back to A; the first thread resumes and mistakenly assumes no mutation occurred.",
          "A syntax error caused by circular dependency imports.",
          "A network buffer overflow during duplex streaming.",
          "A database dead-letter queue overflow."
        ],
        correctAnswer: "A thread reads value A, gets preempted; other threads change A to B and back to A; the first thread resumes and mistakenly assumes no mutation occurred.",
        explanation: "Standard CAS checks equality of pointer or value, missing hidden intermediary state transitions unless versioned pointers/tagged references are used.",
        difficulty: "hard"
      },
      {
        question: "In distributed microservices, what architectural pattern prevents cascading failures when downstream dependencies degrade or become unresponsive?",
        options: [
          "Circuit Breaker pattern",
          "Aggressive infinite exponential retry loops",
          "Synchronous RPC chains with infinite timeouts",
          "Single-threaded worker queues"
        ],
        correctAnswer: "Circuit Breaker pattern",
        explanation: "Circuit Breakers (e.g. resilience4j, Polly) trip open when failure thresholds are exceeded, immediately short-circuiting calls to protect system resources.",
        difficulty: "hard"
      },
      {
        question: "What causes 'Zombie Processes' (defunct) in POSIX operating systems?",
        options: [
          "A child process that has completed execution, but its exit status has not yet been read by its parent via wait() / waitpid().",
          "A process executing an infinite memory allocation loop.",
          "A process terminated forcefully via SIGKILL (kill -9).",
          "A thread that has deadlocked on an unreleased mutex."
        ],
        correctAnswer: "A child process that has completed execution, but its exit status has not yet been read by its parent via wait() / waitpid().",
        explanation: "Zombies occupy process table slots until the parent reaps their exit status, leading to process table exhaustion if neglected.",
        difficulty: "hard"
      },
      {
        question: "What is the primary indicator of thread pool starvation in an asynchronous thread-pool runtime (like .NET or Go runtime)?",
        options: [
          "Tasks queueing indefinitely with minimal CPU utilization because synchronous blocking operations (e.g. .Result, sleep) occupy all worker threads.",
          "Immediate out-of-memory exception.",
          "Sudden drop in TCP keep-alive pings.",
          "Crash of the underlying hypervisor."
        ],
        correctAnswer: "Tasks queueing indefinitely with minimal CPU utilization because synchronous blocking operations (e.g. .Result, sleep) occupy all worker threads.",
        explanation: "Sync-over-async blocks pool worker threads, preventing new I/O tasks from being picked up despite plentiful CPU capacity.",
        difficulty: "hard"
      }
    ]
  },
  quant: {
    easy: [
      {
        question: "If the price of 6 pens is $24, what is the price of 15 pens?",
        options: ["$60", "$50", "$72", "$45"],
        correctAnswer: "$60",
        explanation: "Cost of 1 pen = 24 / 6 = $4. Cost of 15 pens = 15 * 4 = $60.",
        difficulty: "easy"
      },
      {
        question: "What is 15% of 200?",
        options: ["30", "25", "35", "20"],
        correctAnswer: "30",
        explanation: "15% of 200 = (15 / 100) * 200 = 30.",
        difficulty: "easy"
      },
      {
        question: "The average of five numbers (10, 20, 30, 40, 50) is:",
        options: ["30", "25", "35", "28"],
        correctAnswer: "30",
        explanation: "Sum = 150. Count = 5. Average = 150 / 5 = 30.",
        difficulty: "easy"
      },
      {
        question: "A car travels at 60 km/h for 2.5 hours. How far does it travel?",
        options: ["150 km", "120 km", "180 km", "140 km"],
        correctAnswer: "150 km",
        explanation: "Distance = Speed * Time = 60 * 2.5 = 150 km.",
        difficulty: "easy"
      },
      {
        question: "What is the square root of 144?",
        options: ["12", "14", "11", "16"],
        correctAnswer: "12",
        explanation: "12 * 12 = 144.",
        difficulty: "easy"
      }
    ],
    medium: [
      {
        question: "A train running at a speed of 72 km/hr crosses a stationary pole in 15 seconds. What is the length of the train?",
        options: ["300 meters", "250 meters", "360 meters", "180 meters"],
        correctAnswer: "300 meters",
        explanation: "Speed in m/s = 72 * (5 / 18) = 20 m/s. Distance = Speed * Time = 20 m/s * 15 s = 300 meters.",
        difficulty: "medium"
      },
      {
        question: "A person sells an article for $480 incurring a loss of 20%. At what price should it be sold to gain 20% profit?",
        options: ["$720", "$600", "$680", "$640"],
        correctAnswer: "$720",
        explanation: "Cost Price (CP) = 480 / 0.80 = $600. To gain 20% profit: Selling Price = 600 * 1.20 = $720.",
        difficulty: "medium"
      },
      {
        question: "Pipe A can fill a tank in 12 hours and Pipe B can fill it in 18 hours. If both pipes are opened simultaneously, how long will it take to fill the tank?",
        options: ["7.2 hours", "8 hours", "6.5 hours", "9 hours"],
        correctAnswer: "7.2 hours",
        explanation: "Combined rate per hour = (1/12) + (1/18) = (3 + 2)/36 = 5/36. Total time = 36 / 5 = 7.2 hours (7 hours 12 minutes).",
        difficulty: "medium"
      },
      {
        question: "Two fair six-sided dice are rolled simultaneously. What is the probability that the sum of the numbers on the top faces is equal to 8?",
        options: ["5 / 36", "1 / 6 (6/36)", "7 / 36", "1 / 9 (4/36)"],
        correctAnswer: "5 / 36",
        explanation: "Total outcomes = 36. Favorable outcomes yielding sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes. Probability = 5 / 36.",
        difficulty: "medium"
      },
      {
        question: "If a principal amount doubles itself in 5 years under simple interest, what is the annual rate of interest?",
        options: ["20% per annum", "25% per annum", "15% per annum", "10% per annum"],
        correctAnswer: "20% per annum",
        explanation: "Simple Interest (SI) = Principal (P). SI = (P * R * T) / 100 => P = (P * R * 5) / 100 => R = 100 / 5 = 20%.",
        difficulty: "medium"
      }
    ],
    hard: [
      {
        question: "A bag contains 5 red, 4 green, and 3 blue balls. If 3 balls are drawn at random without replacement, what is the probability that all 3 are of different colors?",
        options: ["3 / 11", "2 / 11", "5 / 22", "1 / 4"],
        correctAnswer: "3 / 11",
        explanation: "Total ways to choose 3 balls = 12C3 = (12 * 11 * 10) / 6 = 220. Ways to choose 1 of each color = 5 * 4 * 3 = 60. Probability = 60 / 220 = 3 / 11.",
        difficulty: "hard"
      },
      {
        question: "In how many distinct ways can the letters of the word 'PERMUTATION' be arranged such that all vowels always occur together?",
        options: ["120,960", "241,920", "60,480", "15,120"],
        correctAnswer: "120,960",
        explanation: "Vowels: E, U, A, I, O (5 distinct vowels). Consonants: P, R, M, T, T, N (6 consonants with two T's). Treat vowels as 1 block => 7 blocks arranged in 7! / 2! ways. Inside vowel block: 5! ways. Total = (5040 / 2) * 120 = 2520 * 120 = 302,400.",
        difficulty: "hard"
      },
      {
        question: "A sum of money invested at compound interest amounts to $8,000 in 3 years and $10,000 in 4 years. What is the annual rate of interest?",
        options: ["25%", "20%", "15%", "12.5%"],
        correctAnswer: "25%",
        explanation: "Interest in the 4th year = 10,000 - 8,000 = $2,000 on principal of $8,000. Rate = (2,000 / 8,000) * 100 = 25%.",
        difficulty: "hard"
      },
      {
        question: "Two trains leave stations 400 miles apart at the same time heading towards each other at 45 mph and 55 mph. A bird flies back and forth between them at 80 mph until they meet. What total distance does the bird fly?",
        options: ["320 miles", "400 miles", "280 miles", "360 miles"],
        correctAnswer: "320 miles",
        explanation: "Relative approach speed = 45 + 55 = 100 mph. Time until trains meet = 400 / 100 = 4 hours. Distance bird flies = 80 mph * 4 hours = 320 miles.",
        difficulty: "hard"
      },
      {
        question: "Find the remainder when 2^2024 is divided by 7.",
        options: ["2", "1", "4", "0"],
        correctAnswer: "2",
        explanation: "By Fermat's Little Theorem: 2^6 ≡ 1 (mod 7). 2024 mod 6 = 2. Therefore, 2^2024 ≡ 2^2 ≡ 4 (mod 7) Wait: 2024 = 6 * 337 + 2 => 2^2 = 4.",
        difficulty: "hard"
      }
    ]
  },
  logical: {
    easy: [
      {
        question: "Find the next number in the pattern: 2, 4, 8, 16, ___?",
        options: ["32", "24", "30", "64"],
        correctAnswer: "32",
        explanation: "Each number is multiplied by 2: 16 * 2 = 32.",
        difficulty: "easy"
      },
      {
        question: "If CAT is coded as 3-1-20, what is the code for DOG?",
        options: ["4-15-7", "4-14-7", "3-15-8", "5-15-7"],
        correctAnswer: "4-15-7",
        explanation: "Alphabet positions: D=4, O=15, G=7.",
        difficulty: "easy"
      },
      {
        question: "Which word does NOT belong with the others?",
        options: ["Carrot", "Apple", "Banana", "Orange"],
        correctAnswer: "Carrot",
        explanation: "Carrot is a root vegetable, whereas the others are fruits.",
        difficulty: "easy"
      },
      {
        question: "If Monday is the 1st day of the month, what day is the 15th?",
        options: ["Monday", "Sunday", "Tuesday", "Wednesday"],
        correctAnswer: "Monday",
        explanation: "Day 1 + 14 days (exactly 2 weeks) = Day 15, which is also Monday.",
        difficulty: "easy"
      },
      {
        question: "Light is to Dark as Day is to:",
        options: ["Night", "Dawn", "Sun", "Noon"],
        correctAnswer: "Night",
        explanation: "Night is the direct antonym of Day, mirroring Light and Dark.",
        difficulty: "easy"
      }
    ],
    medium: [
      {
        question: "Complete the series: 3, 7, 15, 31, 63, ___?",
        options: ["127", "125", "129", "131"],
        correctAnswer: "127",
        explanation: "Pattern: Each number is (previous * 2) + 1, or 2^(n+1) - 1. For n=6: (63 * 2) + 1 = 126 + 1 = 127.",
        difficulty: "medium"
      },
      {
        question: "Statements:\n1. All engineers are problem solvers.\n2. Some problem solvers are researchers.\nConclusion:\nWhich conclusion logically follows?",
        options: [
          "Some engineers may be researchers.",
          "All researchers are engineers.",
          "No problem solver is an engineer.",
          "All engineers are researchers."
        ],
        correctAnswer: "Some engineers may be researchers.",
        explanation: "Engineers are a subset of problem solvers. Because some problem solvers are researchers, the intersection of engineers and researchers is possible but not guaranteed for all.",
        difficulty: "medium"
      },
      {
        question: "Pointing to a photograph, a man says: 'He is the son of the only son of my grandfather.' How is the man related to the boy in the photograph?",
        options: ["Father (if speaker is the only son)", "Brother", "Uncle", "Cousin"],
        correctAnswer: "Father (if speaker is the only son)",
        explanation: "Grandfather's only son is the speaker's father (or speaker himself). The son of that person is either the speaker himself or the speaker's son.",
        difficulty: "medium"
      },
      {
        question: "In a certain code language, 'GLOBAL' is coded as 'HMPCBN'. How is 'SYSTEM' coded in that same language?",
        options: ["TZTUFN", "TZUTFM", "SZTUFN", "TYTUFM"],
        correctAnswer: "TZTUFN",
        explanation: "Each letter is shifted forward by +1 position in the English alphabet: S->T, Y->Z, S->T, T->U, E->F, M->N => TZTUFN.",
        difficulty: "medium"
      },
      {
        question: "Five colleagues (A, B, C, D, E) sit in a row facing North. B is between A and C. E is to the immediate right of C. D is at the extreme left. Who is sitting in the middle?",
        options: ["B", "A", "C", "E"],
        correctAnswer: "B",
        explanation: "D is at extreme left: [D, _, _, _, _]. E is to the immediate right of C: [C, E] at the end. B is between A and C => [D, A, B, C, E]. The person in the middle position (3rd) is B.",
        difficulty: "medium"
      }
    ],
    hard: [
      {
        question: "Six executives (P, Q, R, S, T, U) sit around a circular table facing the center. P is opposite S. T is to the immediate left of P. Q is between S and U. Who sits opposite T?",
        options: ["U", "Q", "R", "S"],
        correctAnswer: "U",
        explanation: "Placing P at top (0°), S is at bottom (180°). T is immediate left (clockwise 60°). Q is between S and U, placing U at 240° opposite T (60°).",
        difficulty: "hard"
      },
      {
        question: "In a truth-teller and liar island, A says: 'At least one of us is a liar.' What can be concluded about A and B?",
        options: [
          "A is a truth-teller and B is a liar.",
          "Both A and B are liars.",
          "Both A and B are truth-tellers.",
          "A is a liar and B is a truth-teller."
        ],
        correctAnswer: "A is a truth-teller and B is a liar.",
        explanation: "If A were a liar, the statement 'at least one of us is a liar' would be true, a contradiction. Hence A is a truth-teller, making the statement true, which requires B to be a liar.",
        difficulty: "hard"
      },
      {
        question: "Statements:\n1. No squares are circles.\n2. All circles are ellipses.\n3. Some ellipses are curves.\nConclusions:\nI. Some ellipses are not squares.\nII. Some curves are circles.",
        options: [
          "Only Conclusion I logically follows.",
          "Only Conclusion II logically follows.",
          "Both Conclusions I and II follow.",
          "Neither Conclusion I nor II follows."
        ],
        correctAnswer: "Only Conclusion I logically follows.",
        explanation: "Circles are entirely within ellipses and disjoint from squares; thus those ellipses that are circles cannot be squares (Conclusion I follows). There is no guaranteed overlap between curves and circles.",
        difficulty: "hard"
      },
      {
        question: "If 'A + B' means A is the brother of B; 'A - B' means A is the mother of B; 'A * B' means A is the father of B. Which expression means P is the maternal grandmother of S?",
        options: ["P - Q - S", "P * Q - S", "P - Q + S", "P + Q - S"],
        correctAnswer: "P - Q - S",
        explanation: "P - Q means P is mother of Q. Q - S means Q is mother of S. Thus P is the mother of S's mother, i.e., maternal grandmother.",
        difficulty: "hard"
      },
      {
        question: "A cube has its 6 faces painted red. It is then cut into 64 identical smaller cubes. How many smaller cubes have exactly ONE face painted red?",
        options: ["24", "16", "32", "8"],
        correctAnswer: "24",
        explanation: "64 cubes = 4 x 4 x 4. Cubes with 1 face painted lie in the interior of each of the 6 faces: (4 - 2)^2 = 4 per face. 6 faces * 4 = 24 cubes.",
        difficulty: "hard"
      }
    ]
  },
  verbal: {
    easy: [
      {
        question: "Select the synonym for 'RAPID':",
        options: ["Quick", "Sluggish", "Fragile", "Gentle"],
        correctAnswer: "Quick",
        explanation: "Rapid means moving or acting with great speed, synonymous with Quick.",
        difficulty: "easy"
      },
      {
        question: "Choose the correct spelling:",
        options: ["Accommodate", "Acommodate", "Accomodate", "Acomodate"],
        correctAnswer: "Accommodate",
        explanation: "'Accommodate' has double 'c' and double 'm'.",
        difficulty: "easy"
      },
      {
        question: "What is the plural of 'Child'?",
        options: ["Children", "Childs", "Childrens", "Childes"],
        correctAnswer: "Children",
        explanation: "The irregular plural form of child is children.",
        difficulty: "easy"
      },
      {
        question: "Identify the conjunction in: 'She wanted to come, but she was unwell.'",
        options: ["but", "wanted", "unwell", "she"],
        correctAnswer: "but",
        explanation: "'But' connects the two independent clauses as a coordinating conjunction.",
        difficulty: "easy"
      },
      {
        question: "Select the antonym for 'ANCIENT':",
        options: ["Modern", "Antique", "Aged", "Historical"],
        correctAnswer: "Modern",
        explanation: "Ancient refers to long ago in the past; its direct antonym is Modern.",
        difficulty: "easy"
      }
    ],
    medium: [
      {
        question: "Select the word that is most nearly OPPOSITE in meaning to 'METICULOUS':",
        options: ["Careless", "Thorough", "Scrupulous", "Fastidious"],
        correctAnswer: "Careless",
        explanation: "'Meticulous' denotes showing great attention to detail and precision. The direct antonym is 'Careless'.",
        difficulty: "medium"
      },
      {
        question: "Choose the grammatically correct sentence:",
        options: [
          "Neither of the candidates has submitted their credentials on time.",
          "Neither of the candidates have submitted their credentials on time.",
          "Neither of the candidate has submit their credentials on time.",
          "Neither among the candidates have submitted their credentials."
        ],
        correctAnswer: "Neither of the candidates has submitted their credentials on time.",
        explanation: "'Neither' is a singular indefinite pronoun and grammatically takes the singular verb 'has'.",
        difficulty: "medium"
      },
      {
        question: "Identify the meaning of the idiom: 'Bite the bullet'",
        options: [
          "To endure a painful or difficult situation with courage and resilience.",
          "To aggressively attack a competitor in the market.",
          "To act impulsively without considering consequences.",
          "To deliberately make a fatal error in judgment."
        ],
        correctAnswer: "To endure a painful or difficult situation with courage and resilience.",
        explanation: "The historical idiom refers to wounded soldiers biting a lead bullet during surgery to endure pain courageously.",
        difficulty: "medium"
      },
      {
        question: "Fill in the blank with the most appropriate preposition: 'The team was commended _____ their exceptional performance during the migration.'",
        options: ["for", "with", "on", "at"],
        correctAnswer: "for",
        explanation: "The verb 'commended' is correctly followed by the preposition 'for' when designating the cause or achievement being praised.",
        difficulty: "medium"
      },
      {
        question: "Select the word that best completes the sentence: 'The CEO gave a _____ speech that left no ambiguity regarding the company's future strategy.'",
        options: ["lucid", "convoluted", "circuitous", "tenuous"],
        correctAnswer: "lucid",
        explanation: "'Lucid' means expressed clearly and easy to understand, leaving no room for ambiguity.",
        difficulty: "medium"
      }
    ],
    hard: [
      {
        question: "Select the word that best describes an argument that appears plausible on the surface but is fundamentally fallacious:",
        options: ["Specious", "Sagacious", "Perspicacious", "Veracious"],
        correctAnswer: "Specious",
        explanation: "'Specious' characterizes reasoning that sounds superficially plausible or attractive but is actually misleading or wrong.",
        difficulty: "hard"
      },
      {
        question: "Choose the sentence with correct subjunctive mood usage:",
        options: [
          "It is imperative that the lead architect be present at the deployment review.",
          "It is imperative that the lead architect is present at the deployment review.",
          "It is imperative that the lead architect was present at the deployment review.",
          "It is imperative that the lead architect will be present at the deployment review."
        ],
        correctAnswer: "It is imperative that the lead architect be present at the deployment review.",
        explanation: "Demand and requirement expressions (mandative subjunctive) take the base form of the verb ('be').",
        difficulty: "hard"
      },
      {
        question: "Identify the figure of speech in: 'The deafening silence of the empty auditorium spoke volumes.'",
        options: ["Oxymoron", "Metonymy", "Hyperbole only", "Synecdoche"],
        correctAnswer: "Oxymoron",
        explanation: "'Deafening silence' pairs contradictory terms directly together to produce an expressive paradoxical effect.",
        difficulty: "hard"
      },
      {
        question: "Which of the following pairs exhibits the same analogical relationship as EPHEMERAL : PERMANENCE?",
        options: [
          "Erratic : Predictability",
          "Mundane : Ordinary",
          "Audacious : Boldness",
          "Taciturn : Silence"
        ],
        correctAnswer: "Erratic : Predictability",
        explanation: "Something ephemeral lacks permanence; similarly, something erratic lacks predictability.",
        difficulty: "hard"
      },
      {
        question: "Identify the grammatical error: 'Having finished the audit, the report was submitted to the board by the compliance officer.'",
        options: [
          "Dangling modifier (the participle phrase modifies 'report' instead of the compliance officer)",
          "Split infinitive",
          "Incorrect pronoun agreement",
          "Tense inconsistency"
        ],
        correctAnswer: "Dangling modifier (the participle phrase modifies 'report' instead of the compliance officer)",
        explanation: "The opening modifier 'Having finished the audit' illogically attaches to 'the report' rather than the person who finished it.",
        difficulty: "hard"
      }
    ]
  }
};

export function getFallbackQuestions(category: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium', topic?: string): AssessmentQuestion[] {
  const cat = (category || 'mcq').toLowerCase();
  const catPool = QUESTION_BANK[cat] || QUESTION_BANK['mcq'];
  const diffPool = catPool[difficulty] || catPool['medium'] || catPool['easy'];
  return diffPool.map(q => ({ ...q, difficulty }));
}

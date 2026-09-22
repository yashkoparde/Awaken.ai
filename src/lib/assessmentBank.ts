export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const QUESTION_BANK: Record<string, AssessmentQuestion[]> = {
  coding: [
    {
      question: "Which data structure provides average O(1) time complexity for insert, search, and delete operations?",
      options: ["Hash Table", "Binary Search Tree", "Balanced AVL Tree", "Sorted Array"],
      correctAnswer: "Hash Table",
      explanation: "Hash tables compute an index via a hashing function, allowing constant-time average access for search, insertion, and deletion."
    },
    {
      question: "What is the worst-case time complexity of the standard QuickSort algorithm when picking the first or last element as pivot?",
      options: ["O(N^2)", "O(N log N)", "O(N)", "O(log N)"],
      correctAnswer: "O(N^2)",
      explanation: "If the pivot consistently divides the array into subproblems of size 0 and N-1 (e.g., when already sorted), QuickSort degenerates to O(N^2)."
    },
    {
      question: "In graph theory, which algorithm guarantees finding the shortest path in a weighted graph with non-negative edge weights?",
      options: ["Dijkstra's Algorithm", "Breadth-First Search (BFS)", "Floyd-Warshall (all-pairs only)", "Depth-First Search (DFS)"],
      correctAnswer: "Dijkstra's Algorithm",
      explanation: "Dijkstra's greedy algorithm computes single-source shortest paths on graphs with non-negative edge weights in O((V + E) log V) using a min-heap."
    },
    {
      question: "Which of the following techniques is most effective for solving the 'Longest Common Subsequence' (LCS) problem?",
      options: ["Dynamic Programming (Tabulation/Memoization)", "Greedy Choice Strategy", "Divide and Conquer without state caching", "Linear Binary Search"],
      correctAnswer: "Dynamic Programming (Tabulation/Memoization)",
      explanation: "LCS exhibits optimal substructure and overlapping subproblems, which Dynamic Programming solves in O(M*N) time."
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
      explanation: "Threads of the same process share code, data, and OS resources like open files, but maintain their own program counters and call stacks."
    }
  ],
  mcq: [
    {
      question: "In distributed systems, what does the CAP theorem state regarding network partitions?",
      options: [
        "A distributed data store can simultaneously provide at most two of Consistency, Availability, and Partition Tolerance.",
        "Every distributed database must sacrifice Partition Tolerance to achieve sub-millisecond latency.",
        "Systems can achieve 100% Consistency and Availability simultaneously across an asynchronous partitioned network.",
        "Consistency is impossible in any multi-node architecture."
      ],
      correctAnswer: "A distributed data store can simultaneously provide at most two of Consistency, Availability, and Partition Tolerance.",
      explanation: "Eric Brewer's CAP theorem proves that in the presence of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A)."
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
      explanation: "HTTP/2 introduces a binary framing layer allowing interleaved requests and responses over a single TCP socket with header compression (HPACK)."
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
      explanation: "B-Tree or Hash indexes enable fast point and range queries without scanning every row, though inserts/updates require index maintenance."
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
      explanation: "Generational hypothesis posits most objects die young; separating Young (Eden/Survivor) and Tenured generations minimizes full GC pauses."
    },
    {
      question: "What HTTP response status code should be returned when a client attempts to access a protected resource without valid credentials?",
      options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "400 Bad Request"],
      correctAnswer: "401 Unauthorized",
      explanation: "RFC 9110 specifies 401 Unauthorized when authentication credentials are required and missing or invalid. (403 is used when authenticated but permissions are denied)."
    }
  ],
  sql: [
    {
      question: "Which SQL clause is used to filter aggregated group records produced by a GROUP BY clause?",
      options: ["HAVING", "WHERE", "ORDER BY", "QUALIFY"],
      correctAnswer: "HAVING",
      explanation: "WHERE filters individual rows prior to grouping, while HAVING filters aggregated metric buckets after GROUP BY execution."
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
      explanation: "When equal values are encountered, RANK() leaves gaps corresponding to the number of ties, whereas DENSE_RANK() maintains sequential integers without gaps."
    },
    {
      question: "Which type of SQL JOIN returns all rows from the left table and only matching rows from the right table?",
      options: ["LEFT OUTER JOIN", "INNER JOIN", "CROSS JOIN", "RIGHT OUTER JOIN"],
      correctAnswer: "LEFT OUTER JOIN",
      explanation: "LEFT JOIN retains every record from the left table and populates NULL for right-table columns when no predicate match is satisfied."
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
      explanation: "Atomicity ensures transactional boundaries are indivisible: if any statement fails, the entire transaction is rolled back."
    },
    {
      question: "Which database index structure is predominantly utilized by relational database engines (PostgreSQL, MySQL InnoDB) for range queries?",
      options: ["B+ Tree", "Hash Table", "Skip List", "Bloom Filter"],
      correctAnswer: "B+ Tree",
      explanation: "B+ Trees store all data pointers in linked leaf nodes, making sequential range scans (BETWEEN, >, <) highly cache-efficient."
    }
  ],
  debugging: [
    {
      question: "In asynchronous JavaScript, what common issue occurs when forgetting to 'await' a Promise inside an async try-catch block?",
      options: [
        "Uncaught promise rejections occur outside the try-catch block because the function returns the pending promise before resolution.",
        "The browser halts execution and crashes the event loop immediately.",
        "The Promise automatically converts into a synchronous blocking primitive.",
        "The JavaScript engine automatically retries the rejected promise indefinitely."
      ],
      correctAnswer: "Uncaught promise rejections occur outside the try-catch block because the function returns the pending promise before resolution.",
      explanation: "Returning a Promise without 'await' inside try/catch bypasses local catch blocks when rejected, triggering an unhandled rejection."
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
      explanation: "Each recursive call consumes a stack frame; lacking a terminating base condition exhausts the call stack boundary."
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
      explanation: "Retaining references in closures, global arrays, or uncleaned DOM event handlers prevents the Garbage Collector from freeing detached memory."
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
      explanation: "Race conditions arise when multiple threads access shared mutable state without proper synchronization (mutexes, semaphores, or atomic operations)."
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
      explanation: "Mutating `foo` inside `useEffect(..., [foo])` triggers a re-render, which re-runs the effect, mutating `foo` again in an infinite loop."
    }
  ],
  quant: [
    {
      question: "A train running at a speed of 72 km/hr crosses a stationary pole in 15 seconds. What is the length of the train?",
      options: ["300 meters", "250 meters", "360 meters", "180 meters"],
      correctAnswer: "300 meters",
      explanation: "Speed in m/s = 72 * (5 / 18) = 20 m/s. Distance = Speed * Time = 20 m/s * 15 s = 300 meters."
    },
    {
      question: "A person sells an article for $480 incurring a loss of 20%. At what price should it be sold to gain 20% profit?",
      options: ["$720", "$600", "$680", "$640"],
      correctAnswer: "$720",
      explanation: "Cost Price (CP) = 480 / 0.80 = $600. To gain 20% profit: Selling Price = 600 * 1.20 = $720."
    },
    {
      question: "Pipe A can fill a tank in 12 hours and Pipe B can fill it in 18 hours. If both pipes are opened simultaneously, how long will it take to fill the tank?",
      options: ["7.2 hours", "8 hours", "6.5 hours", "9 hours"],
      correctAnswer: "7.2 hours",
      explanation: "Combined rate per hour = (1/12) + (1/18) = (3 + 2)/36 = 5/36. Total time = 36 / 5 = 7.2 hours (7 hours 12 minutes)."
    },
    {
      question: "Two fair six-sided dice are rolled simultaneously. What is the probability that the sum of the numbers on the top faces is equal to 8?",
      options: ["5 / 36", "1 / 6 (6/36)", "7 / 36", "1 / 9 (4/36)"],
      correctAnswer: "5 / 36",
      explanation: "Total outcomes = 36. Favorable outcomes yielding sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes. Probability = 5 / 36."
    },
    {
      question: "If a principal amount doubles itself in 5 years under simple interest, what is the annual rate of interest?",
      options: ["20% per annum", "25% per annum", "15% per annum", "10% per annum"],
      correctAnswer: "20% per annum",
      explanation: "Simple Interest (SI) = Principal (P). SI = (P * R * T) / 100 => P = (P * R * 5) / 100 => R = 100 / 5 = 20%."
    }
  ],
  logical: [
    {
      question: "Complete the series: 3, 7, 15, 31, 63, ___?",
      options: ["127", "125", "129", "131"],
      correctAnswer: "127",
      explanation: "Pattern: Each number is (previous * 2) + 1, or 2^(n+1) - 1. For n=6: (63 * 2) + 1 = 126 + 1 = 127."
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
      explanation: "Engineers are a subset of problem solvers. Because some problem solvers are researchers, the intersection of engineers and researchers is possible but not guaranteed for all."
    },
    {
      question: "Pointing to a photograph, a man says: 'He is the son of the only son of my grandfather.' How is the man related to the boy in the photograph?",
      options: ["Father or Brother (Brother if only son has 2 sons, or the boy is his brother/himself)", "Father (if speaker is the only son)", "Uncle", "Cousin"],
      correctAnswer: "Father (if speaker is the only son)",
      explanation: "Grandfather's only son is the speaker's father (or speaker himself). The son of that person is either the speaker himself or the speaker's brother/son depending on perspective."
    },
    {
      question: "In a certain code language, 'GLOBAL' is coded as 'HMPCBN'. How is 'SYSTEM' coded in that same language?",
      options: ["TZTUFN", "TZUTFM", "SZTUFN", "TYTUFM"],
      correctAnswer: "TZTUFN",
      explanation: "Each letter is shifted forward by +1 position in the English alphabet: S->T, Y->Z, S->T, T->U, E->F, M->N => TZTUFN."
    },
    {
      question: "Five colleagues (A, B, C, D, E) sit in a row facing North. B is between A and C. E is to the immediate right of C. D is at the extreme left. Who is sitting in the middle?",
      options: ["B", "A", "C", "E"],
      correctAnswer: "B",
      explanation: "D is at extreme left: [D, _, _, _, _]. E is to the immediate right of C: [C, E] at the end. B is between A and C => [D, A, B, C, E]. The person in the middle position (3rd) is B."
    }
  ],
  verbal: [
    {
      question: "Select the word that is most nearly OPPOSITE in meaning to 'METICULOUS':",
      options: ["Careless", "Thorough", "Scrupulous", "Fastidious"],
      correctAnswer: "Careless",
      explanation: "'Meticulous' denotes showing great attention to detail and precision. The direct antonym is 'Careless'."
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
      explanation: "'Neither' is a singular indefinite pronoun and grammatically takes the singular verb 'has'."
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
      explanation: "The historical idiom refers to wounded soldiers biting a lead bullet during surgery to endure pain courageously."
    },
    {
      question: "Fill in the blank with the most appropriate preposition: 'The team was commended _____ their exceptional performance during the migration.'",
      options: ["for", "with", "on", "at"],
      correctAnswer: "for",
      explanation: "The verb 'commended' is correctly followed by the preposition 'for' when designating the cause or achievement being praised."
    },
    {
      question: "Select the word that best completes the sentence: 'The CEO gave a _____ speech that left no ambiguity regarding the company's future strategy.'",
      options: ["lucid", "convoluted", "circuitous", "tenuous"],
      correctAnswer: "lucid",
      explanation: "'Lucid' means expressed clearly and easy to understand, leaving no room for ambiguity."
    }
  ]
};

export function getFallbackQuestions(category: string, topic?: string): AssessmentQuestion[] {
  const cat = (category || 'mcq').toLowerCase();
  const pool = QUESTION_BANK[cat] || QUESTION_BANK['mcq'];
  return pool;
}

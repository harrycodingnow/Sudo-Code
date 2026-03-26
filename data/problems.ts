import type { Problem } from "@/types/problem";

type ProblemSeed = Omit<
  Problem,
  "id" | "examples" | "constraints" | "starterPseudocode" | "idealPseudocode" | "referencePython"
> &
  Partial<
    Pick<
      Problem,
      "examples" | "constraints" | "starterPseudocode" | "idealPseudocode" | "referencePython"
    >
  >;

function createProblem(id: number, seed: ProblemSeed): Problem {
  const details = problemDetails[seed.slug];

  return {
    id: String(id),
    examples: seed.examples ?? details?.examples ?? [],
    constraints: seed.constraints ?? details?.constraints ?? [],
    starterPseudocode:
      seed.starterPseudocode ??
      `identify the core pattern
track the minimum state needed
update the answer and return it`,
    idealPseudocode:
      seed.idealPseudocode ??
      `apply the standard approach for this problem
maintain the key invariant
return the final result`,
    referencePython:
      seed.referencePython ?? "# Reference implementation intentionally omitted.",
    ...seed,
  };
}

const problemSeeds: ProblemSeed[] = [
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    description:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.",
    keyConcepts: ["hash map", "complement lookup", "single pass"],
    initialGuideQuestion:
      "What would a brute-force solution look like - and what makes it slow?",
  },
  {
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    description:
      "Return the length of the longest substring of `s` that contains no repeated characters.",
    keyConcepts: ["sliding window", "set or map", "window shrink"],
    initialGuideQuestion:
      "If you extend your window one character at a time, what condition forces you to shrink it?",
  },
  {
    slug: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    category: "Two Pointers",
    description:
      "Given a string `s`, return the longest substring of `s` that is a palindrome.",
    keyConcepts: ["expand around center", "palindrome check", "two pointers"],
    initialGuideQuestion:
      "What makes a string a palindrome, and how could you check whether a palindrome is centered at a given position?",
  },
  {
    slug: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Two Pointers",
    description:
      "Choose two vertical lines that, together with the x-axis, form a container holding the maximum possible water.",
    keyConcepts: ["two pointers", "area comparison", "greedy movement"],
    initialGuideQuestion:
      "If you have two pointers at both ends, which one should you move - and why?",
  },
  {
    slug: "3sum",
    title: "3Sum",
    difficulty: "Medium",
    category: "Two Pointers",
    description:
      "Return all unique triplets `[nums[i], nums[j], nums[k]]` such that their sum is zero.",
    keyConcepts: ["sorting", "two pointers", "duplicate skipping"],
    initialGuideQuestion:
      "If the array were sorted, how would that help you avoid checking every possible triple?",
  },
  {
    slug: "remove-nth-node-from-end-of-list",
    title: "Remove Nth Node From End of List",
    difficulty: "Medium",
    category: "Linked List",
    description:
      "Remove the `n`th node from the end of a linked list and return the head of the updated list.",
    keyConcepts: ["two pointers", "dummy node", "fixed gap"],
    initialGuideQuestion:
      "You don't know the list length upfront. How could two pointers, started at the right offset, tell you exactly where to stop?",
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    description:
      "Determine whether a string of brackets is valid by checking matching types and correct nesting order.",
    keyConcepts: ["stack", "matching pairs", "early exit"],
    initialGuideQuestion:
      "If you read the string left to right, what do you need to remember to check correctness?",
  },
  {
    slug: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    category: "Linked List",
    description:
      "Merge two sorted linked lists into one sorted linked list and return its head.",
    keyConcepts: ["dummy head", "two pointers", "tail pointer"],
    initialGuideQuestion:
      "At each step, how do you decide which node gets appended next?",
  },
  {
    slug: "merge-k-sorted-lists",
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    category: "Heap / Priority Queue",
    description:
      "Merge `k` sorted linked lists and return the head of one fully sorted linked list.",
    keyConcepts: ["min heap", "k-way merge", "smallest element"],
    initialGuideQuestion:
      "You already know how to merge two sorted lists. What's inefficient about repeating that k times, and what structure gives you the smallest element cheaply?",
  },
  {
    slug: "search-in-rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    category: "Binary Search",
    description:
      "Search for `target` in a sorted array that has been rotated at an unknown pivot.",
    keyConcepts: ["binary search", "sorted half", "range check"],
    initialGuideQuestion:
      "Even though the array is rotated, is at least one half of it always sorted - and how can you use that?",
  },
  {
    slug: "combination-sum",
    title: "Combination Sum",
    difficulty: "Medium",
    category: "Backtracking",
    description:
      "Return all unique combinations of candidates that sum to `target`, where each candidate may be reused.",
    keyConcepts: ["backtracking", "choose or skip", "running sum"],
    initialGuideQuestion:
      "If you pick a candidate, what two choices do you have at the next step?",
  },
  {
    slug: "rotate-image",
    title: "Rotate Image",
    difficulty: "Medium",
    category: "Math & Geometry",
    description:
      "Rotate an `n x n` matrix 90 degrees clockwise in place.",
    keyConcepts: ["transpose", "reverse rows", "in-place matrix"],
    initialGuideQuestion:
      "Instead of using extra space, can you decompose a 90 degree rotation into two simpler in-place operations you already know?",
  },
  {
    slug: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    category: "Arrays & Hashing",
    description:
      "Group strings together so that each group contains words that are anagrams of one another.",
    keyConcepts: ["hash key", "sorted signature", "frequency key"],
    initialGuideQuestion:
      "What property do all anagrams of the same word share that you could use as a common key?",
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Greedy",
    description:
      "Return the largest possible sum of any contiguous subarray.",
    keyConcepts: ["Kadane's algorithm", "running sum", "restart decision"],
    initialGuideQuestion:
      "At each position, you have two choices: extend the previous subarray or start fresh. When is starting fresh better?",
  },
  {
    slug: "spiral-matrix",
    title: "Spiral Matrix",
    difficulty: "Medium",
    category: "Math & Geometry",
    description:
      "Return all elements of a matrix in spiral order.",
    keyConcepts: ["boundaries", "layer traversal", "shrinking window"],
    initialGuideQuestion:
      "Can you describe the boundary of what's left to visit at each step, and what shrinks after each pass?",
  },
  {
    slug: "jump-game",
    title: "Jump Game",
    difficulty: "Medium",
    category: "Greedy",
    description:
      "Determine whether you can reach the last index if each value tells you the maximum jump length from that position.",
    keyConcepts: ["furthest reach", "greedy scan", "feasibility"],
    initialGuideQuestion:
      "Instead of tracking exact paths, what's the one thing you need to know as you scan left to right?",
  },
  {
    slug: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    category: "Intervals",
    description:
      "Merge all overlapping intervals and return the condensed set.",
    keyConcepts: ["sorting", "overlap check", "merge ranges"],
    initialGuideQuestion:
      "If the intervals were sorted by start time, when exactly do two adjacent intervals overlap?",
  },
  {
    slug: "insert-interval",
    title: "Insert Interval",
    difficulty: "Medium",
    category: "Intervals",
    description:
      "Insert a new interval into a sorted, non-overlapping interval list and merge when necessary.",
    keyConcepts: ["three cases", "interval scan", "merge update"],
    initialGuideQuestion:
      "As you scan the existing intervals, what are the three distinct cases you encounter relative to the new interval?",
  },
  {
    slug: "unique-paths",
    title: "Unique Paths",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      "Count how many unique paths move from the top-left to the bottom-right of an `m x n` grid using only right and down moves.",
    keyConcepts: ["grid DP", "subproblem count", "top and left"],
    initialGuideQuestion:
      "How many ways can you reach any given cell, expressed in terms of the cells directly above and to its left?",
  },
  {
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    description:
      "Count the number of distinct ways to climb to step `n` when you can move up 1 or 2 steps at a time.",
    keyConcepts: ["recurrence", "Fibonacci pattern", "rolling state"],
    initialGuideQuestion:
      "How many ways can you reach step N, if you already know the ways to reach step N-1 and N-2?",
  },
  {
    slug: "set-matrix-zeroes",
    title: "Set Matrix Zeroes",
    difficulty: "Medium",
    category: "Math & Geometry",
    description:
      "If an element in a matrix is zero, set its entire row and column to zero in place.",
    keyConcepts: ["marker rows", "marker columns", "in-place flags"],
    initialGuideQuestion:
      "If you zero out rows and columns immediately when you find a zero, what problem does that cause?",
  },
  {
    slug: "minimum-window-substring",
    title: "Minimum Window Substring",
    difficulty: "Hard",
    category: "Sliding Window",
    description:
      "Return the smallest substring of `s` that contains every character from `t` with the required counts.",
    keyConcepts: ["sliding window", "frequency counts", "window shrink"],
    initialGuideQuestion:
      "Once you have a valid window, what should you do to try to improve it?",
  },
  {
    slug: "word-search",
    title: "Word Search",
    difficulty: "Medium",
    category: "Backtracking",
    description:
      "Check whether a word can be formed in a grid by moving horizontally or vertically without reusing a cell.",
    keyConcepts: ["DFS", "visited cells", "backtracking"],
    initialGuideQuestion:
      "When you're at a cell, what are your choices - and what do you need to undo if a path doesn't work out?",
  },
  {
    slug: "decode-ways",
    title: "Decode Ways",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      "Count how many ways a digit string can be decoded where `1` to `26` map to letters.",
    keyConcepts: ["1-step and 2-step transitions", "digit validity", "DP"],
    initialGuideQuestion:
      "How does the number of ways to decode up to position i depend on the previous one or two characters?",
  },
  {
    slug: "validate-binary-search-tree",
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    category: "Trees",
    description:
      "Determine whether a binary tree satisfies the strict ordering rules of a valid BST.",
    keyConcepts: ["bounds", "tree recursion", "global validity"],
    initialGuideQuestion:
      "Just checking left < root < right at each node isn't enough - can you construct a tree that passes that check but isn't a valid BST?",
  },
  {
    slug: "same-tree",
    title: "Same Tree",
    difficulty: "Easy",
    category: "Trees",
    description:
      "Return whether two binary trees are structurally identical and store the same values in corresponding positions.",
    keyConcepts: ["tree recursion", "base cases", "structural equality"],
    initialGuideQuestion:
      "What are the base cases when comparing two nodes - and when are two nodes definitively the same or different?",
  },
  {
    slug: "binary-tree-level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    category: "Trees",
    description:
      "Return the values of a binary tree level by level from left to right.",
    keyConcepts: ["queue", "BFS", "level size"],
    initialGuideQuestion:
      "How do you know when all nodes at the current level have been processed?",
  },
  {
    slug: "maximum-depth-of-binary-tree",
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    category: "Trees",
    description:
      "Return the maximum depth of a binary tree.",
    keyConcepts: ["recursion", "DFS", "height"],
    initialGuideQuestion:
      "How would you define the depth of a node in terms of its two children's depths?",
  },
  {
    slug: "construct-binary-tree-from-preorder-and-inorder-traversal",
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    difficulty: "Medium",
    category: "Trees",
    description:
      "Reconstruct a binary tree from its preorder and inorder traversal arrays.",
    keyConcepts: ["root from preorder", "split inorder", "recursive build"],
    initialGuideQuestion:
      "What does the first element of the preorder array always tell you, and how does that help you split the inorder array?",
  },
  {
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Greedy",
    description:
      "Given daily stock prices, return the maximum profit from one buy and one sell.",
    keyConcepts: ["running minimum", "single pass", "profit tracking"],
    initialGuideQuestion:
      "On any given day, what's the only thing you need to know about all previous days to maximise profit?",
  },
  {
    slug: "binary-tree-maximum-path-sum",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard",
    category: "Trees",
    description:
      "Return the maximum path sum in a binary tree, where a path may start and end at any nodes.",
    keyConcepts: ["postorder DFS", "max gain", "discard negatives"],
    initialGuideQuestion:
      "A path can turn at most once - at the root of some subtree. What's the most you can gain from each child, and when should you discard a branch entirely?",
  },
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    category: "Two Pointers",
    description:
      "Determine whether a string is a palindrome after ignoring non-alphanumeric characters and case.",
    keyConcepts: ["two pointers", "skip characters", "normalize case"],
    initialGuideQuestion:
      "If you place two pointers at opposite ends and move them inward, what's your stopping condition - and what do you do with non-alphanumeric characters?",
  },
  {
    slug: "longest-consecutive-sequence",
    title: "Longest Consecutive Sequence",
    difficulty: "Medium",
    category: "Arrays & Hashing",
    description:
      "Return the length of the longest run of consecutive integer values in an unsorted array.",
    keyConcepts: ["hash set", "sequence starts", "O(1) membership"],
    initialGuideQuestion:
      "For a brute-force solution you'd sort first. Can you get O(n) without sorting - and what structure lets you check membership in O(1)?",
  },
  {
    slug: "clone-graph",
    title: "Clone Graph",
    difficulty: "Medium",
    category: "Graphs",
    description:
      "Return a deep copy of a connected graph where each node contains a value and a list of neighbors.",
    keyConcepts: ["graph traversal", "old-to-new map", "visited nodes"],
    initialGuideQuestion:
      "What's the risk of naively cloning each node as you visit it, and what do you need to track to avoid it?",
  },
  {
    slug: "word-break",
    title: "Word Break",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      "Determine whether a string can be segmented into a sequence of dictionary words.",
    keyConcepts: ["prefix DP", "dictionary lookup", "reachable states"],
    initialGuideQuestion:
      "If you know which prefixes of the string can be segmented, how does that help you decide about longer prefixes?",
  },
  {
    slug: "linked-list-cycle",
    title: "Linked List Cycle",
    difficulty: "Easy",
    category: "Linked List",
    description:
      "Determine whether a linked list contains a cycle.",
    keyConcepts: ["fast and slow pointers", "cycle detection", "pointer meeting"],
    initialGuideQuestion:
      "If two runners traverse the list at different speeds, what happens if there's a cycle?",
  },
  {
    slug: "reorder-list",
    title: "Reorder List",
    difficulty: "Medium",
    category: "Linked List",
    description:
      "Reorder a linked list from `L0 -> L1 -> ... -> Ln` into `L0 -> Ln -> L1 -> Ln-1 -> ...`.",
    keyConcepts: ["find middle", "reverse list", "merge halves"],
    initialGuideQuestion:
      "Can you decompose this into three simpler subproblems you've seen before?",
  },
  {
    slug: "maximum-product-subarray",
    title: "Maximum Product Subarray",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      "Return the maximum product of a contiguous subarray.",
    keyConcepts: ["track max and min", "negative flip", "running product"],
    initialGuideQuestion:
      "Why does Kadane's algorithm from Maximum Subarray not directly apply here - what's different about products?",
  },
  {
    slug: "find-minimum-in-rotated-sorted-array",
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "Medium",
    category: "Binary Search",
    description:
      "Find the minimum element in a rotated sorted array with unique elements.",
    keyConcepts: ["binary search", "sorted half", "pivot side"],
    initialGuideQuestion:
      "How can you tell which half of the array contains the minimum - and what comparison gives that away?",
  },
  {
    slug: "reverse-bits",
    title: "Reverse Bits",
    difficulty: "Easy",
    category: "Bit Manipulation",
    description:
      "Reverse the bits of a given 32-bit unsigned integer.",
    keyConcepts: ["bit shift", "extract bit", "build result"],
    initialGuideQuestion:
      "If you build the result one bit at a time from right to left, what two operations do you perform per iteration?",
  },
  {
    slug: "number-of-1-bits",
    title: "Number of 1 Bits",
    difficulty: "Easy",
    category: "Bit Manipulation",
    description:
      "Return the number of set bits in a 32-bit integer.",
    keyConcepts: ["bit trick", "set bits", "n & (n-1)"],
    initialGuideQuestion:
      "What does n & (n-1) do to the binary representation of n?",
  },
  {
    slug: "house-robber",
    title: "House Robber",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      "Return the maximum amount you can rob from a row of houses without robbing adjacent houses.",
    keyConcepts: ["take or skip", "linear DP", "rolling state"],
    initialGuideQuestion:
      "For each house, you have two choices. What's the maximum you can rob considering those two choices?",
  },
  {
    slug: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    category: "Graphs",
    description:
      "Count how many islands appear in a grid of land and water, where islands connect horizontally or vertically.",
    keyConcepts: ["DFS or BFS", "flood fill", "visited marking"],
    initialGuideQuestion:
      "How would you describe which cells belong to the same island - and how does that map to a graph problem?",
  },
  {
    slug: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Linked List",
    description:
      "Reverse a singly linked list and return the new head.",
    keyConcepts: ["prev current next", "pointer rewiring", "iterative reversal"],
    initialGuideQuestion:
      "To reverse an edge between two nodes, what three pointers do you need, and in what order do you update them?",
  },
  {
    slug: "course-schedule",
    title: "Course Schedule",
    difficulty: "Medium",
    category: "Graphs",
    description:
      "Determine whether all courses can be finished given prerequisite pairs.",
    keyConcepts: ["cycle detection", "directed graph", "topological reasoning"],
    initialGuideQuestion:
      "What does a cycle in the prerequisite graph mean for your ability to finish all courses?",
  },
  {
    slug: "implement-trie-prefix-tree",
    title: "Implement Trie (Prefix Tree)",
    difficulty: "Medium",
    category: "Tries",
    description:
      "Implement a trie supporting `insert`, `search`, and `startsWith`.",
    keyConcepts: ["children map", "end marker", "prefix traversal"],
    initialGuideQuestion:
      "What does each node in a Trie need to store, and how do insert and search traverse it?",
  },
  {
    slug: "design-add-and-search-words-data-structure",
    title: "Design Add and Search Words Data Structure",
    difficulty: "Medium",
    category: "Tries",
    description:
      "Design a data structure that supports adding words and searching with `.` wildcard matches.",
    keyConcepts: ["trie", "DFS search", "wildcard branching"],
    initialGuideQuestion:
      "Search without wildcards is a standard Trie lookup. How does a '.' character change what you need to do at that node?",
  },
  {
    slug: "word-search-ii",
    title: "Word Search II",
    difficulty: "Hard",
    category: "Tries",
    description:
      "Return all dictionary words that can be formed in a board using adjacent cells without reusing a cell.",
    keyConcepts: ["trie", "backtracking", "prefix pruning"],
    initialGuideQuestion:
      "You solved Word Search for a single word. What's inefficient about running that solution once per word, and what structure could prune searches early?",
  },
  {
    slug: "house-robber-ii",
    title: "House Robber II",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      "Return the maximum amount you can rob when houses are arranged in a circle.",
    keyConcepts: ["split into cases", "linear DP", "exclude first or last"],
    initialGuideQuestion:
      "The only difference from House Robber I is that the first and last houses are neighbours. How does that let you reduce this to two simpler problems you already solved?",
  },
  {
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    description:
      "Return whether any value appears at least twice in the array.",
    keyConcepts: ["hash set", "seen values", "O(1) lookup"],
    initialGuideQuestion:
      "What's the simplest data structure that tells you in O(1) whether you've seen a value before?",
  },
  {
    slug: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "Easy",
    category: "Trees",
    description:
      "Swap the left and right children of every node in a binary tree.",
    keyConcepts: ["tree traversal", "swap children", "DFS or BFS"],
    initialGuideQuestion:
      "If you swap the children of every node, in what order should you process nodes - and does the order matter?",
  },
  {
    slug: "kth-smallest-element-in-a-bst",
    title: "Kth Smallest Element in a BST",
    difficulty: "Medium",
    category: "Trees",
    description:
      "Return the kth smallest value in a binary search tree.",
    keyConcepts: ["in-order traversal", "BST ordering", "early stop"],
    initialGuideQuestion:
      "What ordering does an in-order traversal of a BST produce - and how can you stop early?",
  },
  {
    slug: "lowest-common-ancestor-of-a-binary-search-tree",
    title: "Lowest Common Ancestor of a Binary Search Tree",
    difficulty: "Easy",
    category: "Trees",
    description:
      "Find the lowest common ancestor of two nodes in a BST.",
    keyConcepts: ["BST property", "value comparison", "split point"],
    initialGuideQuestion:
      "Given that it's a BST, how can you use node values to decide whether the LCA is in the left subtree, right subtree, or the current node?",
  },
  {
    slug: "product-of-array-except-self",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    category: "Arrays & Hashing",
    description:
      "Return an array where each element is the product of every other element except itself, without using division.",
    keyConcepts: ["prefix products", "suffix products", "two passes"],
    initialGuideQuestion:
      "Without division, how could two separate passes - one left to right and one right to left - give you what you need?",
  },
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    description:
      "Return whether two strings are anagrams of each other.",
    keyConcepts: ["frequency count", "character counts", "single pass"],
    initialGuideQuestion:
      "What do two strings that are anagrams of each other always have in common that you can check in one pass?",
  },
  {
    slug: "meeting-rooms",
    title: "Meeting Rooms",
    difficulty: "Easy",
    category: "Intervals",
    description:
      "Return whether a person can attend every meeting in a list of time intervals.",
    keyConcepts: ["sorting", "overlap check", "adjacent intervals"],
    initialGuideQuestion:
      "What's the simplest condition for two meetings to conflict - and how does sorting by start time make this easy to check?",
  },
  {
    slug: "meeting-rooms-ii",
    title: "Meeting Rooms II",
    difficulty: "Medium",
    category: "Intervals",
    description:
      "Return the minimum number of meeting rooms required to schedule all meetings.",
    keyConcepts: ["min heap", "earliest ending room", "room reuse"],
    initialGuideQuestion:
      "As you process each meeting in order, how do you know if an existing room is free - and what's the cheapest room to reuse?",
  },
  {
    slug: "graph-valid-tree",
    title: "Graph Valid Tree",
    difficulty: "Medium",
    category: "Graphs",
    description:
      "Determine whether an undirected graph forms a valid tree.",
    keyConcepts: ["connected", "acyclic", "union find or DFS"],
    initialGuideQuestion:
      "What two properties must a graph satisfy to be a valid tree - and how can you check both?",
  },
  {
    slug: "missing-number",
    title: "Missing Number",
    difficulty: "Easy",
    category: "Bit Manipulation",
    description:
      "Given distinct numbers in the range `[0, n]`, return the one missing number.",
    keyConcepts: ["expected sum", "actual sum", "difference"],
    initialGuideQuestion:
      "If the numbers 0 to n were all present, what would their sum be - and how does the actual sum help you?",
  },
  {
    slug: "alien-dictionary",
    title: "Alien Dictionary",
    difficulty: "Hard",
    category: "Graphs",
    description:
      "Given words sorted by an unknown alphabet, infer a valid character ordering.",
    keyConcepts: ["graph edges", "topological sort", "ordering constraints"],
    initialGuideQuestion:
      "From two adjacent words in the list, what can you infer about the alien alphabet's ordering - and how would you represent those constraints?",
  },
  {
    slug: "encode-and-decode-strings",
    title: "Encode and Decode Strings",
    difficulty: "Medium",
    category: "Arrays & Hashing",
    description:
      "Design `encode` and `decode` so a list of strings can be serialized and recovered exactly.",
    keyConcepts: ["length prefix", "delimiter safety", "parsing boundaries"],
    initialGuideQuestion:
      "What information do you need to encode alongside each string so the decoder can reliably find its boundaries?",
  },
  {
    slug: "find-median-from-data-stream",
    title: "Find Median from Data Stream",
    difficulty: "Hard",
    category: "Heap / Priority Queue",
    description:
      "Design a structure that supports adding numbers and returning the median of the stream at any time.",
    keyConcepts: ["two heaps", "rebalance", "middle values"],
    initialGuideQuestion:
      "If you split the stream into a lower half and an upper half, what structure gives you fast access to the largest of the lower and the smallest of the upper?",
  },
  {
    slug: "serialize-and-deserialize-binary-tree",
    title: "Serialize and Deserialize Binary Tree",
    difficulty: "Hard",
    category: "Trees",
    description:
      "Convert a binary tree to a string and back without losing structure.",
    keyConcepts: ["tree traversal", "null markers", "reconstruction"],
    initialGuideQuestion:
      "What traversal order would let you reconstruct the tree using only the serialized values - including null markers?",
  },
  {
    slug: "longest-increasing-subsequence",
    title: "Longest Increasing Subsequence",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      "Return the length of the longest strictly increasing subsequence in an array.",
    keyConcepts: ["DP", "ending at i", "compare earlier values"],
    initialGuideQuestion:
      "For each element, what does the length of the longest subsequence ending at that element depend on?",
  },
  {
    slug: "coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      "Return the fewest coins needed to make up a target amount, or `-1` if it is impossible.",
    keyConcepts: ["bottom-up DP", "minimum transitions", "subamounts"],
    initialGuideQuestion:
      "What's the fewest coins needed for amount A, if you already know the answer for all amounts less than A?",
  },
  {
    slug: "number-of-connected-components-in-an-undirected-graph",
    title: "Number of Connected Components in an Undirected Graph",
    difficulty: "Medium",
    category: "Graphs",
    description:
      "Return how many connected components exist in an undirected graph.",
    keyConcepts: ["union find", "component count", "edge merges"],
    initialGuideQuestion:
      "Starting with N separate components, how does each new edge potentially reduce the component count?",
  },
  {
    slug: "counting-bits",
    title: "Counting Bits",
    difficulty: "Easy",
    category: "Bit Manipulation",
    description:
      "For every integer `i` in `[0, n]`, return the number of set bits in `i`.",
    keyConcepts: ["DP on bits", "right shift", "least significant bit"],
    initialGuideQuestion:
      "How does the number of 1-bits in i relate to the number of 1-bits in i >> 1?",
  },
  {
    slug: "top-k-frequent-elements",
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    category: "Heap / Priority Queue",
    description:
      "Return the `k` most frequent elements in an array.",
    keyConcepts: ["frequency map", "bucket sort or heap", "top-k extraction"],
    initialGuideQuestion:
      "Once you have each element's frequency, what's the cost of finding the top K by sorting - and is there a faster way?",
  },
  {
    slug: "sum-of-two-integers",
    title: "Sum of Two Integers",
    difficulty: "Medium",
    category: "Bit Manipulation",
    description:
      "Compute the sum of two integers without using `+` or `-`.",
    keyConcepts: ["xor sum", "carry bits", "bit shifts"],
    initialGuideQuestion:
      "How does binary addition work at the bit level - what produces the sum bits, and what produces the carry?",
  },
  {
    slug: "pacific-atlantic-water-flow",
    title: "Pacific Atlantic Water Flow",
    difficulty: "Medium",
    category: "Graphs",
    description:
      "Return all grid coordinates from which water can flow to both the Pacific and Atlantic oceans.",
    keyConcepts: ["reverse traversal", "DFS or BFS", "reachability sets"],
    initialGuideQuestion:
      "Instead of asking \"can water from this cell reach both oceans?\", what happens if you reverse the question and flow water upward from each ocean?",
  },
  {
    slug: "longest-repeating-character-replacement",
    title: "Longest Repeating Character Replacement",
    difficulty: "Medium",
    category: "Sliding Window",
    description:
      "Return the length of the longest substring that can be turned into all one character with at most `k` replacements.",
    keyConcepts: ["sliding window", "max frequency", "window validity"],
    initialGuideQuestion:
      "If the window length minus the count of the most frequent character exceeds K, what does that tell you?",
  },
  {
    slug: "non-overlapping-intervals",
    title: "Non-overlapping Intervals",
    difficulty: "Medium",
    category: "Intervals",
    description:
      "Return the minimum number of intervals to remove so the rest are non-overlapping.",
    keyConcepts: ["greedy", "keep smallest end", "overlap resolution"],
    initialGuideQuestion:
      "If you must keep a subset of non-overlapping intervals, which interval should you greedily prefer to keep when two overlap?",
  },
  {
    slug: "subtree-of-another-tree",
    title: "Subtree of Another Tree",
    difficulty: "Easy",
    category: "Trees",
    description:
      "Return whether one binary tree appears as a subtree of another.",
    keyConcepts: ["tree recursion", "same tree check", "candidate roots"],
    initialGuideQuestion:
      "How does this relate to the Same Tree problem - and at which nodes do you need to check?",
  },
  {
    slug: "palindromic-substrings",
    title: "Palindromic Substrings",
    difficulty: "Medium",
    category: "Two Pointers",
    description:
      "Count how many substrings of a string are palindromes.",
    keyConcepts: ["expand around center", "odd and even centers", "counting"],
    initialGuideQuestion:
      "How many possible centers does a string of length N have - including both odd and even length palindromes?",
  },
  {
    slug: "longest-common-subsequence",
    title: "Longest Common Subsequence",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description:
      "Return the length of the longest subsequence common to two strings.",
    keyConcepts: ["2D DP", "matching characters", "skip choices"],
    initialGuideQuestion:
      "If the last characters of both strings match, how does that simplify the problem - and what if they don't?",
  },
];

const problemDetails: Record<
  string,
  Pick<Problem, "examples" | "constraints">
> = {
  "two-sum": {
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i], target <= 10^9",
      "Exactly one valid answer exists.",
    ],
  },
  "longest-substring-without-repeating-characters": {
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc".' },
      { input: 's = "bbbbb"', output: "1" },
    ],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols, and spaces."],
  },
  "longest-palindromic-substring": {
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also valid.' },
      { input: 's = "cbbd"', output: '"bb"' },
    ],
    constraints: ["1 <= s.length <= 1000", "s consists only of digits and English letters."],
  },
  "container-with-most-water": {
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" },
      { input: "height = [1,1]", output: "1" },
    ],
    constraints: ["2 <= height.length <= 10^5", "0 <= height[i] <= 10^4"],
  },
  "3sum": {
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
      { input: "nums = [0,1,1]", output: "[]" },
    ],
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
  },
  "remove-nth-node-from-end-of-list": {
    examples: [
      { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]" },
      { input: "head = [1], n = 1", output: "[]" },
    ],
    constraints: ["The number of nodes in the list is sz.", "1 <= sz <= 30", "0 <= Node.val <= 100", "1 <= n <= sz"],
  },
  "valid-parentheses": {
    examples: [
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists only of parentheses characters."],
  },
  "merge-two-sorted-lists": {
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = [0]", output: "[0]" },
    ],
    constraints: ["The number of nodes in both lists is in the range [0, 50].", "-100 <= Node.val <= 100", "Both lists are sorted in non-decreasing order."],
  },
  "merge-k-sorted-lists": {
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
      { input: "lists = []", output: "[]" },
    ],
    constraints: ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500", "-10^4 <= lists[i][j] <= 10^4"],
  },
  "search-in-rotated-sorted-array": {
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" },
    ],
    constraints: ["1 <= nums.length <= 5000", "-10^4 <= nums[i], target <= 10^4", "All values of nums are unique."],
  },
  "combination-sum": {
    examples: [
      { input: "candidates = [2,3,6,7], target = 7", output: "[[2,2,3],[7]]" },
      { input: "candidates = [2,3,5], target = 8", output: "[[2,2,2,2],[2,3,3],[3,5]]" },
    ],
    constraints: ["1 <= candidates.length <= 30", "2 <= candidates[i] <= 40", "All elements of candidates are distinct.", "1 <= target <= 40"],
  },
  "rotate-image": {
    examples: [
      { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]" },
      { input: "matrix = [[1,2],[3,4]]", output: "[[3,1],[4,2]]" },
    ],
    constraints: ["n == matrix.length == matrix[i].length", "1 <= n <= 20", "-1000 <= matrix[i][j] <= 1000"],
  },
  "group-anagrams": {
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
    ],
    constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."],
  },
  "maximum-subarray": {
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum." },
      { input: "nums = [1]", output: "1" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
  },
  "spiral-matrix": {
    examples: [
      { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[1,2,3,6,9,8,7,4,5]" },
      { input: "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]", output: "[1,2,3,4,8,12,11,10,9,5,6,7]" },
    ],
    constraints: ["m == matrix.length", "n == matrix[i].length", "1 <= m, n <= 10", "-100 <= matrix[i][j] <= 100"],
  },
  "jump-game": {
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "true" },
      { input: "nums = [3,2,1,0,4]", output: "false" },
    ],
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
  },
  "merge-intervals": {
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]" },
    ],
    constraints: ["1 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= starti <= endi <= 10^4"],
  },
  "insert-interval": {
    examples: [
      { input: "intervals = [[1,3],[6,9]], newInterval = [2,5]", output: "[[1,5],[6,9]]" },
      { input: "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]", output: "[[1,2],[3,10],[12,16]]" },
    ],
    constraints: ["0 <= intervals.length <= 10^4", "intervals[i].length == 2", "intervals is sorted by starti in ascending order."],
  },
  "unique-paths": {
    examples: [
      { input: "m = 3, n = 7", output: "28" },
      { input: "m = 3, n = 2", output: "3" },
    ],
    constraints: ["1 <= m, n <= 100", "The answer is less than or equal to 2 * 10^9."],
  },
  "climbing-stairs": {
    examples: [
      { input: "n = 2", output: "2" },
      { input: "n = 3", output: "3" },
    ],
    constraints: ["1 <= n <= 45"],
  },
  "set-matrix-zeroes": {
    examples: [
      { input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]" },
      { input: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]", output: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]" },
    ],
    constraints: ["m == matrix.length", "n == matrix[i].length", "1 <= m, n <= 200", "-2^31 <= matrix[i][j] <= 2^31 - 1"],
  },
  "minimum-window-substring": {
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
      { input: 's = "a", t = "a"', output: '"a"' },
    ],
    constraints: ["m == s.length", "n == t.length", "1 <= m, n <= 10^5", "s and t consist of English letters."],
  },
  "word-search": {
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: "true" },
      { input: 'board = [["A","B"],["C","D"]], word = "ABCD"', output: "false" },
    ],
    constraints: ["m == board.length", "n == board[i].length", "1 <= m, n <= 6", "1 <= word.length <= 15"],
  },
  "decode-ways": {
    examples: [
      { input: 's = "12"', output: "2" },
      { input: 's = "226"', output: "3" },
    ],
    constraints: ["1 <= s.length <= 100", "s contains only digits and may contain leading zeroes."],
  },
  "validate-binary-search-tree": {
    examples: [
      { input: "root = [2,1,3]", output: "true" },
      { input: "root = [5,1,4,null,null,3,6]", output: "false" },
    ],
    constraints: ["The number of nodes in the tree is in the range [1, 10^4].", "-2^31 <= Node.val <= 2^31 - 1"],
  },
  "same-tree": {
    examples: [
      { input: "p = [1,2,3], q = [1,2,3]", output: "true" },
      { input: "p = [1,2], q = [1,null,2]", output: "false" },
    ],
    constraints: ["The number of nodes in both trees is in the range [0, 100].", "-10^4 <= Node.val <= 10^4"],
  },
  "binary-tree-level-order-traversal": {
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
      { input: "root = [1]", output: "[[1]]" },
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 2000].", "-1000 <= Node.val <= 1000"],
  },
  "maximum-depth-of-binary-tree": {
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "3" },
      { input: "root = []", output: "0" },
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"],
  },
  "construct-binary-tree-from-preorder-and-inorder-traversal": {
    examples: [
      { input: "preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]", output: "[3,9,20,null,null,15,7]" },
      { input: "preorder = [-1], inorder = [-1]", output: "[-1]" },
    ],
    constraints: ["1 <= preorder.length <= 3000", "inorder.length == preorder.length", "-3000 <= preorder[i], inorder[i] <= 3000", "preorder and inorder consist of unique values."],
  },
  "best-time-to-buy-and-sell-stock": {
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5" },
      { input: "prices = [7,6,4,3,1]", output: "0" },
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
  },
  "binary-tree-maximum-path-sum": {
    examples: [
      { input: "root = [1,2,3]", output: "6" },
      { input: "root = [-10,9,20,null,null,15,7]", output: "42" },
    ],
    constraints: ["The number of nodes in the tree is in the range [1, 3 * 10^4].", "-1000 <= Node.val <= 1000"],
  },
  "valid-palindrome": {
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "true" },
      { input: 's = "race a car"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
  },
  "longest-consecutive-sequence": {
    examples: [
      { input: "nums = [100,4,200,1,3,2]", output: "4" },
      { input: "nums = [0,3,7,2,5,8,4,6,0,1]", output: "9" },
    ],
    constraints: ["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
  },
  "clone-graph": {
    examples: [
      { input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]" },
      { input: "adjList = [[]]", output: "[[]]" },
    ],
    constraints: ["The number of nodes in the graph is in the range [0, 100].", "1 <= Node.val <= 100", "There are no repeated edges and no self-loops."],
  },
  "word-break": {
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: "true" },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: "false" },
    ],
    constraints: ["1 <= s.length <= 300", "1 <= wordDict.length <= 1000", "1 <= wordDict[i].length <= 20"],
  },
  "linked-list-cycle": {
    examples: [
      { input: "head = [3,2,0,-4], pos = 1", output: "true" },
      { input: "head = [1], pos = -1", output: "false" },
    ],
    constraints: ["The number of nodes in the list is in the range [0, 10^4].", "-10^5 <= Node.val <= 10^5", "pos is -1 or a valid index in the linked list."],
  },
  "reorder-list": {
    examples: [
      { input: "head = [1,2,3,4]", output: "[1,4,2,3]" },
      { input: "head = [1,2,3,4,5]", output: "[1,5,2,4,3]" },
    ],
    constraints: ["The number of nodes in the list is in the range [1, 5 * 10^4].", "1 <= Node.val <= 1000"],
  },
  "maximum-product-subarray": {
    examples: [
      { input: "nums = [2,3,-2,4]", output: "6" },
      { input: "nums = [-2,0,-1]", output: "0" },
    ],
    constraints: ["1 <= nums.length <= 2 * 10^4", "-10 <= nums[i] <= 10"],
  },
  "find-minimum-in-rotated-sorted-array": {
    examples: [
      { input: "nums = [3,4,5,1,2]", output: "1" },
      { input: "nums = [11,13,15,17]", output: "11" },
    ],
    constraints: ["1 <= nums.length <= 5000", "-5000 <= nums[i] <= 5000", "All integers of nums are unique."],
  },
  "reverse-bits": {
    examples: [
      { input: "n = 00000010100101000001111010011100", output: "964176192" },
      { input: "n = 11111111111111111111111111111101", output: "3221225471" },
    ],
    constraints: ["The input must be a binary string of length 32."],
  },
  "number-of-1-bits": {
    examples: [
      { input: "n = 00000000000000000000000000001011", output: "3" },
      { input: "n = 11111111111111111111111111111101", output: "31" },
    ],
    constraints: ["The input must be a binary string of length 32."],
  },
  "house-robber": {
    examples: [
      { input: "nums = [1,2,3,1]", output: "4" },
      { input: "nums = [2,7,9,3,1]", output: "12" },
    ],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
  },
  "number-of-islands": {
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: "1" },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: "3" },
    ],
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300", "grid[i][j] is '0' or '1'."],
  },
  "reverse-linked-list": {
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
    ],
    constraints: ["The number of nodes in the list is the range [0, 5000].", "-5000 <= Node.val <= 5000"],
  },
  "course-schedule": {
    examples: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true" },
      { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false" },
    ],
    constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000", "prerequisites[i].length == 2"],
  },
  "implement-trie-prefix-tree": {
    examples: [
      { input: 'insert("apple"), search("apple"), search("app"), startsWith("app"), insert("app"), search("app")', output: "[null,true,false,true,null,true]" },
    ],
    constraints: ["1 <= word.length, prefix.length <= 2000", "word and prefix consist only of lowercase English letters.", "At most 3 * 10^4 calls in total."],
  },
  "design-add-and-search-words-data-structure": {
    examples: [
      { input: 'addWord("bad"), addWord("dad"), addWord("mad"), search("pad"), search("bad"), search(".ad"), search("b..")', output: "[null,null,null,false,true,true,true]" },
    ],
    constraints: ["1 <= word.length <= 25", "word in addWord consists of lowercase English letters.", "search word may contain '.' characters."],
  },
  "word-search-ii": {
    examples: [
      { input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]' },
      { input: 'board = [["a","b"],["c","d"]], words = ["abcb"]', output: "[]" },
    ],
    constraints: ["m == board.length", "n == board[i].length", "1 <= m, n <= 12", "1 <= words.length <= 3 * 10^4"],
  },
  "house-robber-ii": {
    examples: [
      { input: "nums = [2,3,2]", output: "3" },
      { input: "nums = [1,2,3,1]", output: "4" },
    ],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 1000"],
  },
  "contains-duplicate": {
    examples: [
      { input: "nums = [1,2,3,1]", output: "true" },
      { input: "nums = [1,2,3,4]", output: "false" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
  },
  "invert-binary-tree": {
    examples: [
      { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"],
  },
  "kth-smallest-element-in-a-bst": {
    examples: [
      { input: "root = [3,1,4,null,2], k = 1", output: "1" },
      { input: "root = [5,3,6,2,4,null,null,1], k = 3", output: "3" },
    ],
    constraints: ["The number of nodes in the tree is n.", "1 <= k <= n <= 10^4", "0 <= Node.val <= 10^4"],
  },
  "lowest-common-ancestor-of-a-binary-search-tree": {
    examples: [
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8", output: "6" },
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4", output: "2" },
    ],
    constraints: ["The number of nodes in the tree is in the range [2, 10^5].", "-10^9 <= Node.val <= 10^9", "p and q will exist in the BST."],
  },
  "product-of-array-except-self": {
    examples: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
    ],
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "The product of any prefix or suffix fits in a 32-bit integer."],
  },
  "valid-anagram": {
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true" },
      { input: 's = "rat", t = "car"', output: "false" },
    ],
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
  },
  "meeting-rooms": {
    examples: [
      { input: "intervals = [[0,30],[5,10],[15,20]]", output: "false" },
      { input: "intervals = [[7,10],[2,4]]", output: "true" },
    ],
    constraints: ["0 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= starti < endi <= 10^6"],
  },
  "meeting-rooms-ii": {
    examples: [
      { input: "intervals = [[0,30],[5,10],[15,20]]", output: "2" },
      { input: "intervals = [[7,10],[2,4]]", output: "1" },
    ],
    constraints: ["1 <= intervals.length <= 10^4", "0 <= starti < endi <= 10^6"],
  },
  "graph-valid-tree": {
    examples: [
      { input: "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]", output: "true" },
      { input: "n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]", output: "false" },
    ],
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 5000", "edges[i].length == 2"],
  },
  "missing-number": {
    examples: [
      { input: "nums = [3,0,1]", output: "2" },
      { input: "nums = [0,1]", output: "2" },
    ],
    constraints: ["n == nums.length", "1 <= n <= 10^4", "0 <= nums[i] <= n", "All the numbers of nums are unique."],
  },
  "alien-dictionary": {
    examples: [
      { input: 'words = ["wrt","wrf","er","ett","rftt"]', output: '"wertf"' },
      { input: 'words = ["z","x","z"]', output: '""' },
    ],
    constraints: ["1 <= words.length <= 100", "1 <= words[i].length <= 100", "words[i] consists of lowercase English letters."],
  },
  "encode-and-decode-strings": {
    examples: [
      { input: '["lint","code","love","you"]', output: '["lint","code","love","you"]', explanation: "Decoding the encoded string should return the original list." },
    ],
    constraints: ["0 <= strs.length <= 200", "0 <= strs[i].length <= 200", "strs[i] may contain any valid ASCII character."],
  },
  "find-median-from-data-stream": {
    examples: [
      { input: 'addNum(1), addNum(2), findMedian(), addNum(3), findMedian()', output: "[null,null,1.5,null,2.0]" },
    ],
    constraints: ["-10^5 <= num <= 10^5", "There will be at least one element before calling findMedian.", "At most 5 * 10^4 calls will be made."],
  },
  "serialize-and-deserialize-binary-tree": {
    examples: [
      { input: "root = [1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]" },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 10^4].", "-1000 <= Node.val <= 1000"],
  },
  "longest-increasing-subsequence": {
    examples: [
      { input: "nums = [10,9,2,5,3,7,101,18]", output: "4" },
      { input: "nums = [7,7,7,7,7,7,7]", output: "1" },
    ],
    constraints: ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
  },
  "coin-change": {
    examples: [
      { input: "coins = [1,2,5], amount = 11", output: "3" },
      { input: "coins = [2], amount = 3", output: "-1" },
    ],
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
  },
  "number-of-connected-components-in-an-undirected-graph": {
    examples: [
      { input: "n = 5, edges = [[0,1],[1,2],[3,4]]", output: "2" },
      { input: "n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]", output: "1" },
    ],
    constraints: ["1 <= n <= 2000", "1 <= edges.length <= 5000", "edges[i].length == 2"],
  },
  "counting-bits": {
    examples: [
      { input: "n = 2", output: "[0,1,1]" },
      { input: "n = 5", output: "[0,1,1,2,1,2]" },
    ],
    constraints: ["0 <= n <= 10^5"],
  },
  "top-k-frequent-elements": {
    examples: [
      { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]" },
      { input: "nums = [1], k = 1", output: "[1]" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4", "k is in the range [1, number of unique elements]."],
  },
  "sum-of-two-integers": {
    examples: [
      { input: "a = 1, b = 2", output: "3" },
      { input: "a = 2, b = 3", output: "5" },
    ],
    constraints: ["-1000 <= a, b <= 1000"],
  },
  "pacific-atlantic-water-flow": {
    examples: [
      { input: "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]", output: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]" },
      { input: "heights = [[1]]", output: "[[0,0]]" },
    ],
    constraints: ["m == heights.length", "n == heights[r].length", "1 <= m, n <= 200", "0 <= heights[r][c] <= 10^5"],
  },
  "longest-repeating-character-replacement": {
    examples: [
      { input: 's = "ABAB", k = 2', output: "4" },
      { input: 's = "AABABBA", k = 1', output: "4" },
    ],
    constraints: ["1 <= s.length <= 10^5", "s consists of only uppercase English letters.", "0 <= k <= s.length"],
  },
  "non-overlapping-intervals": {
    examples: [
      { input: "intervals = [[1,2],[2,3],[3,4],[1,3]]", output: "1" },
      { input: "intervals = [[1,2],[1,2],[1,2]]", output: "2" },
    ],
    constraints: ["1 <= intervals.length <= 10^5", "intervals[i].length == 2", "-5 * 10^4 <= starti < endi <= 5 * 10^4"],
  },
  "subtree-of-another-tree": {
    examples: [
      { input: "root = [3,4,5,1,2], subRoot = [4,1,2]", output: "true" },
      { input: "root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]", output: "false" },
    ],
    constraints: ["The number of nodes in the root tree is in the range [1, 2000].", "The number of nodes in the subRoot tree is in the range [1, 1000]."],
  },
  "palindromic-substrings": {
    examples: [
      { input: 's = "abc"', output: "3" },
      { input: 's = "aaa"', output: "6" },
    ],
    constraints: ["1 <= s.length <= 1000", "s consists of lowercase English letters."],
  },
  "longest-common-subsequence": {
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: "3" },
      { input: 'text1 = "abc", text2 = "def"', output: "0" },
    ],
    constraints: ["1 <= text1.length, text2.length <= 1000", "text1 and text2 consist of lowercase English characters."],
  },
};

export const problems: Problem[] = problemSeeds.map((seed, index) =>
  createProblem(index + 1, seed),
);

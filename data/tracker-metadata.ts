import type { TrackerSeedMetadata } from "@/types/tracker";

export const trackerSeedMetadata: Record<string, TrackerSeedMetadata> = {
  "two-sum": {
    sourceUrl: "https://leetcode.com/problems/two-sum/",
    topicTags: ["Arrays", "Hash Map"],
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  },
  "valid-parentheses": {
    sourceUrl: "https://leetcode.com/problems/valid-parentheses/",
    topicTags: ["Stack", "Matching"],
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  },
  "merge-two-sorted-lists": {
    sourceUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
    topicTags: ["Linked List", "Two Pointers"],
    timeComplexity: "O(n + m)",
    spaceComplexity: "O(1)",
  },
  "best-time-to-buy-and-sell-stock": {
    sourceUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    topicTags: ["Arrays", "Greedy"],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
  },
  "binary-search": {
    sourceUrl: "https://leetcode.com/problems/binary-search/",
    topicTags: ["Binary Search"],
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
  },
  "maximum-depth-of-binary-tree": {
    sourceUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    topicTags: ["Tree", "DFS"],
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
  },
  "binary-tree-level-order-traversal": {
    sourceUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    topicTags: ["Tree", "BFS", "Queue"],
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  },
  "top-k-frequent-elements": {
    sourceUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
    topicTags: ["Arrays", "Hash Map", "Heap"],
    timeComplexity: "O(n log k)",
    spaceComplexity: "O(n)",
  },
  "lru-cache": {
    sourceUrl: "https://leetcode.com/problems/lru-cache/",
    topicTags: ["Design", "Hash Map", "Linked List"],
    timeComplexity: "O(1)",
    spaceComplexity: "O(capacity)",
  },
  "number-of-islands": {
    sourceUrl: "https://leetcode.com/problems/number-of-islands/",
    topicTags: ["Grid", "DFS"],
    timeComplexity: "O(m*n)",
    spaceComplexity: "O(m*n)",
  },
};

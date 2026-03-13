import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "1",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    description:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. You may assume exactly one solution exists, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "2 + 7 = 9, so return the matching indices.",
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i], target <= 10^9",
      "Exactly one valid answer exists.",
    ],
    keyConcepts: ["hash map", "single pass", "complement lookup"],
    starterPseudocode: `create empty map from value to index
loop through nums with index i
  let need = target - nums[i]
  if need is already in map
    return [map[need], i]
  store nums[i] in map`,
    idealPseudocode: `create hashMap
for each index i from 0 to nums.length - 1
  current = nums[i]
  needed = target - current
  if hashMap contains needed
    return [hashMap[needed], i]
  hashMap[current] = i`,
    referencePython: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        need = target - num
        if need in seen:
            return [seen[need], i]
        seen[num] = i`,
  },
  {
    id: "2",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    description:
      "Given a string `s` containing just the characters `()[]{}`, determine if the input string is valid. An input string is valid if open brackets are closed by the same type of bracket and in the correct order.",
    examples: [
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
        explanation: "The closing bracket does not match the latest opening bracket.",
      },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists only of parentheses characters.",
    ],
    keyConcepts: ["stack", "matching pairs", "early exit"],
    starterPseudocode: `make a stack
for each character
  if opening bracket
    push it
  else
    compare with top of stack
at end return whether stack is empty`,
    idealPseudocode: `make stack
make map of closing brackets to their matching opening brackets
for each char in s
  if char is an opening bracket
    push char onto stack
  else
    if stack is empty
      return false
    if top of stack is not the expected opening bracket
      return false
    pop stack
return stack is empty`,
    referencePython: `def isValid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in pairs.values():
            stack.append(ch)
        else:
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
    return not stack`,
  },
  {
    id: "3",
    slug: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    category: "Linked List",
    description:
      "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted linked list and return the head of the merged list.",
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
      },
      {
        input: "list1 = [], list2 = [0]",
        output: "[0]",
      },
    ],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both lists are sorted in non-decreasing order.",
    ],
    keyConcepts: ["dummy head", "two pointers", "tail pointer"],
    starterPseudocode: `create dummy node
set tail to dummy
while both lists are not empty
  attach smaller node to tail
attach the remaining nodes
return dummy.next`,
    idealPseudocode: `create dummy node
tail = dummy
while list1 is not null and list2 is not null
  if list1 value <= list2 value
    tail.next = list1
    list1 = list1.next
  else
    tail.next = list2
    list2 = list2.next
  tail = tail.next
if list1 is not null
  tail.next = list1
else
  tail.next = list2
return dummy.next`,
    referencePython: `def mergeTwoLists(list1, list2):
    dummy = ListNode()
    tail = dummy
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 if list1 else list2
    return dummy.next`,
  },
  {
    id: "4",
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Greedy",
    description:
      "Given an array `prices` where `prices[i]` is the price of a given stock on day `i`, return the maximum profit you can achieve from a single buy and a single sell. If no profit is possible, return 0.",
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 at 1 and sell on day 5 at 6.",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
      },
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4",
    ],
    keyConcepts: ["running minimum", "single pass", "profit tracking"],
    starterPseudocode: `lowest = first price
bestProfit = 0
for each later price
  update bestProfit with price - lowest
  update lowest if current price is smaller
return bestProfit`,
    idealPseudocode: `lowestPrice = infinity
bestProfit = 0
for each price in prices
  if price < lowestPrice
    lowestPrice = price
  else
    bestProfit = max(bestProfit, price - lowestPrice)
return bestProfit`,
    referencePython: `def maxProfit(prices):
    lowest = float("inf")
    best = 0
    for price in prices:
        if price < lowest:
            lowest = price
        else:
            best = max(best, price - lowest)
    return best`,
  },
  {
    id: "5",
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    category: "Binary Search",
    description:
      "Given a sorted array of integers `nums` and a target value, return the index of the target if it exists. Otherwise, return `-1`.",
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "nums is sorted in ascending order.",
      "All integers are unique.",
    ],
    keyConcepts: ["sorted invariant", "midpoint", "half elimination"],
    starterPseudocode: `left = 0
right = last index
while left <= right
  mid = middle index
  compare nums[mid] to target
return -1`,
    idealPseudocode: `left = 0
right = nums.length - 1
while left <= right
  mid = left + (right - left) // 2
  if nums[mid] == target
    return mid
  if nums[mid] < target
    left = mid + 1
  else
    right = mid - 1
return -1`,
    referencePython: `def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
  },
  {
    id: "6",
    slug: "maximum-depth-of-binary-tree",
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    category: "Trees",
    description:
      "Given the root of a binary tree, return its maximum depth. The maximum depth is the number of nodes along the longest path from the root down to the farthest leaf node.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "3",
      },
      {
        input: "root = []",
        output: "0",
      },
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 10^4].",
      "-100 <= Node.val <= 100",
    ],
    keyConcepts: ["recursion", "tree DFS", "base case"],
    starterPseudocode: `if root is null return 0
leftDepth = depth of left child
rightDepth = depth of right child
return 1 + larger depth`,
    idealPseudocode: `define dfs(node)
  if node is null
    return 0
  leftDepth = dfs(node.left)
  rightDepth = dfs(node.right)
  return 1 + max(leftDepth, rightDepth)
return dfs(root)`,
    referencePython: `def maxDepth(root):
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))`,
  },
  {
    id: "7",
    slug: "binary-tree-level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    category: "Trees",
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values from left to right, level by level.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
      },
      {
        input: "root = []",
        output: "[]",
      },
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 2000].",
      "-1000 <= Node.val <= 1000",
    ],
    keyConcepts: ["queue", "breadth-first search", "level sizing"],
    starterPseudocode: `if root is null return empty list
put root in queue
while queue is not empty
  process one level
  add children to queue`,
    idealPseudocode: `if root is null
  return empty list
queue = [root]
result = []
while queue is not empty
  levelSize = length of queue
  currentLevel = []
  repeat levelSize times
    node = remove front of queue
    add node.value to currentLevel
    if node.left exists
      add node.left to queue
    if node.right exists
      add node.right to queue
  add currentLevel to result
return result`,
    referencePython: `from collections import deque

def levelOrder(root):
    if not root:
        return []
    queue = deque([root])
    result = []
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result`,
  },
  {
    id: "8",
    slug: "top-k-frequent-elements",
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    category: "Heaps",
    description:
      "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.",
    examples: [
      {
        input: "nums = [1,1,1,2,2,3], k = 2",
        output: "[1,2]",
      },
      {
        input: "nums = [1], k = 1",
        output: "[1]",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
      "k is in the range [1, number of unique elements].",
    ],
    keyConcepts: ["frequency map", "bucket sort or heap", "top-k extraction"],
    starterPseudocode: `count how often each number appears
organize numbers by frequency
take the k most frequent numbers`,
    idealPseudocode: `create frequency map
create buckets where index means frequency
for each number in nums
  increase its count in frequency map
for each number and count in frequency map
  append number to buckets[count]
result = []
for frequency from highest down to 1
  add numbers from buckets[frequency] into result
  stop when result size is k
return result`,
    referencePython: `def topKFrequent(nums, k):
    counts = {}
    for num in nums:
        counts[num] = counts.get(num, 0) + 1
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, count in counts.items():
        buckets[count].append(num)

    result = []
    for freq in range(len(buckets) - 1, 0, -1):
        for num in buckets[freq]:
            result.append(num)
            if len(result) == k:
                return result`,
  },
  {
    id: "9",
    slug: "lru-cache",
    title: "LRU Cache",
    difficulty: "Hard",
    category: "Design",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement `get(key)` and `put(key, value)` in `O(1)` average time.",
    examples: [
      {
        input:
          "LRUCache cache = new LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2)",
        output: "[null, null, null, 1, null, -1]",
        explanation:
          "Inserting key 3 evicts key 2 because it is the least recently used.",
      },
    ],
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put.",
    ],
    keyConcepts: ["hash map", "doubly linked list", "eviction policy"],
    starterPseudocode: `use a map for fast lookup
use a doubly linked list to track recency
on get move node to front
on put update or insert and evict from back if needed`,
    idealPseudocode: `store capacity
create hash map from key to linked-list node
create dummy head and dummy tail for doubly linked list

define remove(node)
  unlink node from its neighbors

define insertAtFront(node)
  place node right after head

define get(key)
  if key not in map
    return -1
  node = map[key]
  remove(node)
  insertAtFront(node)
  return node.value

define put(key, value)
  if key already in map
    node = map[key]
    node.value = value
    remove(node)
    insertAtFront(node)
    return
  create new node
  map[key] = node
  insertAtFront(node)
  if map size > capacity
    lru = node before tail
    remove(lru)
    delete lru.key from map`,
    referencePython: `class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        prev_node, next_node = node.prev, node.next
        prev_node.next = next_node
        next_node.prev = prev_node

    def _add(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add(node)
        return node.value

    def put(self, key, value):
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self._add(node)
        if len(self.cache) > self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]`,
  },
  {
    id: "10",
    slug: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    category: "Graphs",
    description:
      "Given an `m x n` 2D binary grid where `'1'` represents land and `'0'` represents water, return the number of islands. An island is formed by connecting adjacent lands horizontally or vertically.",
    examples: [
      {
        input:
          "grid = [[1,1,1,1,0],[1,1,0,1,0],[1,1,0,0,0],[0,0,0,0,0]]",
        output: "1",
      },
      {
        input:
          "grid = [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]",
        output: "3",
      },
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'.",
    ],
    keyConcepts: ["DFS or BFS flood fill", "visited marking", "grid traversal"],
    starterPseudocode: `count = 0
for every cell in grid
  if cell is land and not visited
    run DFS/BFS to mark the whole island
    count += 1
return count`,
    idealPseudocode: `rows = number of rows
cols = number of cols
count = 0

define dfs(r, c)
  if r or c is out of bounds
    return
  if grid[r][c] is water
    return
  mark grid[r][c] as visited
  dfs(r + 1, c)
  dfs(r - 1, c)
  dfs(r, c + 1)
  dfs(r, c - 1)

for each row r
  for each col c
    if grid[r][c] is land
      count += 1
      dfs(r, c)
return count`,
    referencePython: `def numIslands(grid):
    if not grid:
        return 0

    rows, cols = len(grid), len(grid[0])
    islands = 0

    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols:
            return
        if grid[r][c] != "1":
            return
        grid[r][c] = "0"
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                islands += 1
                dfs(r, c)

    return islands`,
  },
];

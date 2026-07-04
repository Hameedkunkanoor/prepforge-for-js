/* =====================================================================
   PATTERNS — the core interview patterns, each with recognition triggers
   ("when you see X, reach for this"), a reusable Python template, when to
   use it, common pitfalls, and example problems that link to the Playground.
   Rendered by patterns.js.
   ===================================================================== */
window.PATTERNS = [
  {
    id: "two-pointers", name: "Two Pointers", color: "var(--c-compute)",
    tagline: "Two indices move toward each other or in tandem over a sorted/linear structure.",
    triggers: [
      "Array is sorted and you need a pair/triplet with a target sum",
      "\"Find two numbers that…\", \"closest\", \"container\", \"trapping\"",
      "Reverse or partition in place with O(1) space",
      "Comparing from both ends of a string/array",
    ],
    use: "When a brute-force pair search is O(n²) but a sorted order (or symmetry) lets you discard half the possibilities each step.",
    template: `l, r = 0, len(arr) - 1
while l < r:
    cur = arr[l] + arr[r]
    if cur == target:
        return [l, r]
    if cur < target:
        l += 1          # need a bigger sum
    else:
        r -= 1          # need a smaller sum`,
    complexity: "Time O(n), Space O(1)",
    pitfalls: ["Forgetting the array must be sorted for the sum variant", "Off-by-one when l and r cross", "Moving the wrong pointer (move the one that improves the objective)"],
    examples: [["blind", "p4", "Container With Most Water"], ["blind", "p5", "Trapping Rain Water"], ["blind", "p69", "Find the Duplicate Number"]],
  },
  {
    id: "sliding-window", name: "Sliding Window", color: "var(--c-network)",
    tagline: "A window [l..r] expands and contracts over a sequence to maintain a property.",
    triggers: [
      "\"longest/shortest substring or subarray…\" with a constraint",
      "\"at most K\", \"without repeating\", \"contains all of…\"",
      "Contiguous elements + optimize length or sum",
    ],
    use: "When you want the best contiguous run satisfying a condition, and recomputing each window from scratch would be O(n·k).",
    template: `from collections import defaultdict
count = defaultdict(int)
l = 0
best = 0
for r in range(len(s)):
    count[s[r]] += 1
    while not valid(count):      # window broke the rule
        count[s[l]] -= 1
        l += 1
    best = max(best, r - l + 1)
return best`,
    complexity: "Time O(n), Space O(k) for the window contents",
    pitfalls: ["Shrinking with 'if' instead of 'while'", "Updating the answer before restoring validity", "Fixed vs. variable window — know which you need"],
    examples: [["blind", "p6", "Longest Substring Without Repeating"], ["blind", "p7", "Minimum Window Substring"], ["blind", "p43", "Sliding Window Maximum"]],
  },
  {
    id: "fast-slow", name: "Fast & Slow Pointers", color: "var(--c-compute)",
    tagline: "Two pointers at different speeds detect cycles, midpoints, and nth-from-end.",
    triggers: [
      "Linked list: cycle detection, find the middle, nth from end",
      "\"Does it loop?\", \"where does the cycle start?\"",
      "Array where values act as next-index pointers",
    ],
    use: "When you need a structural property of a linked list/sequence in one pass with O(1) space.",
    template: `slow = fast = head
while fast and fast.next:
    slow = slow.next          # +1
    fast = fast.next.next     # +2
    if slow is fast:
        break                 # cycle found
# 'slow' is the midpoint if fast ran off the end`,
    complexity: "Time O(n), Space O(1)",
    pitfalls: ["Null checks on fast.next before dereferencing", "Confusing cycle-detection with cycle-entrance (needs a second walk)"],
    examples: [["blind", "p69", "Find the Duplicate Number"], ["blind", "p10", "Remove Nth Node From End"]],
  },
  {
    id: "hashing", name: "Hash Map / Set", color: "var(--c-storage)",
    tagline: "Trade space for O(1) lookups: 'have I seen this / its complement?'",
    triggers: [
      "\"Two Sum\"-style complement lookups",
      "Counting frequencies, grouping, deduping",
      "\"Have I seen…\", \"first unique\", \"anagram\"",
    ],
    use: "When repeated membership or frequency questions would otherwise cost O(n) each.",
    template: `seen = {}
for i, x in enumerate(nums):
    if target - x in seen:
        return [seen[target - x], i]
    seen[x] = i`,
    complexity: "Time O(n), Space O(n)",
    pitfalls: ["Storing before checking (Two Sum needs check-then-store)", "Using a list where a set/dict gives O(1)", "Hashing unhashable types (use tuples for lists)"],
    examples: [["blind", "p1", "Two Sum"], ["blind", "p3", "Longest Consecutive Sequence"], ["blind", "p30", "Group Anagrams"]],
  },
  {
    id: "binary-search", name: "Binary Search", color: "var(--c-network)",
    tagline: "Halve the search space each step over a sorted or monotonic domain.",
    triggers: [
      "Input is sorted (even rotated) and you need O(log n)",
      "\"Find the smallest/largest value such that condition holds\"",
      "\"minimize the maximum\" / \"maximize the minimum\" (binary search on answer)",
    ],
    use: "When the answer space is monotonic: below the boundary the predicate is false, above it's true.",
    template: `lo, hi = 0, len(arr) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1
return -1`,
    complexity: "Time O(log n), Space O(1)",
    pitfalls: ["Infinite loops from wrong lo/hi updates", "Overflow in other languages (Python is fine)", "Deciding <= vs < in the while condition"],
    examples: [["blind", "p11", "Search in Rotated Sorted Array"], ["blind", "p12", "Find Minimum in Rotated Sorted Array"], ["blind", "p54", "Find Peak Element"]],
  },
  {
    id: "bfs", name: "BFS (Breadth-First)", color: "var(--c-network)",
    tagline: "A queue explores level by level — the go-to for shortest paths on unweighted graphs.",
    triggers: [
      "\"Shortest path / fewest steps\" on an unweighted graph or grid",
      "\"Level order\", \"nearest\", \"minimum number of moves\"",
      "Spreading/flood outward from sources",
    ],
    use: "When the first time you reach a node is guaranteed to be via the shortest path.",
    template: `from collections import deque
q = deque([start])
seen = {start}
steps = 0
while q:
    for _ in range(len(q)):       # one whole level
        node = q.popleft()
        if node == goal:
            return steps
        for nb in neighbors(node):
            if nb not in seen:
                seen.add(nb)
                q.append(nb)
    steps += 1`,
    complexity: "Time O(V + E), Space O(V)",
    pitfalls: ["Marking visited when dequeuing (do it when enqueuing) → duplicates", "Forgetting the level-size loop when you need distances"],
    examples: [["blind", "p14", "Binary Tree Level Order Traversal"], ["blind", "p17", "Number of Islands"], ["blind", "p67", "Word Ladder"]],
  },
  {
    id: "dfs-backtracking", name: "DFS & Backtracking", color: "var(--c-interview)",
    tagline: "Explore a choice, recurse, then undo it — enumerate combinations, permutations, paths.",
    triggers: [
      "\"All combinations / permutations / subsets\"",
      "\"Does a path exist\", \"generate every…\", constraint satisfaction",
      "Grid/board exploration where you mark and unmark cells",
    ],
    use: "When you must enumerate or search a decision tree, pruning invalid branches early.",
    template: `res = []
def dfs(start, path):
    res.append(path[:])           # record (subsets) or check goal
    for i in range(start, len(nums)):
        path.append(nums[i])      # choose
        dfs(i + 1, path)          # explore
        path.pop()                # un-choose (backtrack)
dfs(0, [])
return res`,
    complexity: "Time O(2ⁿ) or O(n!) depending on branching, Space O(n) recursion",
    pitfalls: ["Mutating shared state without undoing it", "Appending 'path' by reference instead of a copy", "Missing a base case or pruning → TLE"],
    examples: [["blind", "p20", "Word Search"], ["blind", "p32", "Subsets"], ["blind", "p33", "Permutations"]],
  },
  {
    id: "dp-1d", name: "Dynamic Programming (1D)", color: "var(--c-interview)",
    tagline: "Build the answer from smaller overlapping subproblems along one axis.",
    triggers: [
      "\"Number of ways\", \"min/max cost to reach\", \"can you…\"",
      "Choices at each step where the future depends only on recent state",
      "\"climb stairs\", \"rob houses\", \"coin change\", \"decode\"",
    ],
    use: "When greedy fails and the optimal solution reuses optimal sub-solutions (optimal substructure + overlap).",
    template: `dp = [base] * (n + 1)
dp[0] = seed
for i in range(1, n + 1):
    dp[i] = combine(dp[i - 1], dp[i - 2], ...)   # transition
return dp[n]
# Often collapsible to two rolling variables for O(1) space.`,
    complexity: "Time O(n·transitions), Space O(n) → O(1) rolling",
    pitfalls: ["Wrong base cases", "Off-by-one in dp indexing", "Not recognizing it's Fibonacci-shaped (a,b = b,a+b)"],
    examples: [["blind", "p24", "House Robber"], ["blind", "p23", "Coin Change"], ["blind", "p79", "Maximum Product Subarray"]],
  },
  {
    id: "dp-2d", name: "Dynamic Programming (2D / grid)", color: "var(--c-interview)",
    tagline: "A table indexed by two dimensions — strings, grids, or intervals.",
    triggers: [
      "Two sequences compared (edit distance, LCS, regex)",
      "Grid path counting / min-cost paths",
      "\"match\", \"transform A into B\", \"unique paths\"",
    ],
    use: "When state needs two indices (prefix of A × prefix of B, or row × col).",
    template: `dp = [[0] * (n + 1) for _ in range(m + 1)]
# seed first row / column
for i in range(1, m + 1):
    for j in range(1, n + 1):
        if match(i, j):
            dp[i][j] = dp[i-1][j-1] + 0-or-cost
        else:
            dp[i][j] = best(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
return dp[m][n]`,
    complexity: "Time O(m·n), Space O(m·n) → often O(n) with a rolling row",
    pitfalls: ["Base row/column initialization", "Mixing up which neighbor = insert/delete/replace", "Interval DP needs length-first loop order"],
    examples: [["blind", "p28", "Unique Paths"], ["blind", "p65", "Edit Distance"], ["blind", "p72", "Regular Expression Matching"]],
  },
  {
    id: "heap", name: "Heap / Top-K", color: "var(--c-storage)",
    tagline: "A priority queue surfaces the best element in O(log n) — ideal for 'k' problems.",
    triggers: [
      "\"K largest / smallest / most frequent\"",
      "\"Median of a stream\", \"merge K sorted…\"",
      "Repeatedly grab the current min/max",
    ],
    use: "When you need ordered access to extremes without fully sorting everything.",
    template: `import heapq
heap = []                       # min-heap
for x in nums:
    heapq.heappush(heap, x)
    if len(heap) > k:
        heapq.heappop(heap)     # keep only k largest
return heap[0]                  # kth largest
# max-heap: push -x`,
    complexity: "Time O(n log k), Space O(k)",
    pitfalls: ["Python heaps are min-heaps — negate for max", "Pushing tuples for custom keys (value ordering)", "Using a full sort when a size-k heap suffices"],
    examples: [["blind", "p34", "Kth Largest Element"], ["blind", "p35", "Top K Frequent Elements"], ["blind", "p45", "Find Median from Data Stream"]],
  },
  {
    id: "monotonic-stack", name: "Stack / Monotonic Stack", color: "var(--c-compute)",
    tagline: "A stack that stays sorted answers 'next greater/smaller' in one pass.",
    triggers: [
      "\"Next greater / previous smaller element\"",
      "\"Largest rectangle\", \"daily temperatures\", \"valid parentheses\"",
      "You keep comparing to the most recent unresolved item",
    ],
    use: "When each element is pushed and popped at most once, giving O(n) over a seemingly O(n²) problem.",
    template: `stack = []                      # indices, values increasing
for i, h in enumerate(heights):
    while stack and heights[stack[-1]] > h:
        top = stack.pop()
        width = i - stack[-1] - 1 if stack else i
        best = max(best, heights[top] * width)
    stack.append(i)`,
    complexity: "Time O(n), Space O(n)",
    pitfalls: ["Storing values when you need indices (for width)", "Forgetting to flush the stack at the end (append a sentinel 0)"],
    examples: [["blind", "p74", "Largest Rectangle in Histogram"], ["blind", "p73", "Maximal Rectangle"], ["blind", "p8", "Valid Parentheses"]],
  },
  {
    id: "intervals", name: "Intervals", color: "var(--c-network)",
    tagline: "Sort by start (or end), then sweep and merge/count overlaps.",
    triggers: [
      "\"Merge / insert intervals\", \"meeting rooms\"",
      "\"Overlapping\", \"non-overlapping\", \"minimum removals\"",
      "Ranges [start, end] that may collide",
    ],
    use: "When ordering the intervals makes overlaps adjacent and decisions local.",
    template: `intervals.sort(key=lambda x: x[0])
res = [intervals[0]]
for s, e in intervals[1:]:
    if s <= res[-1][1]:          # overlap
        res[-1][1] = max(res[-1][1], e)
    else:
        res.append([s, e])
return res`,
    complexity: "Time O(n log n), Space O(n)",
    pitfalls: ["Sorting by the wrong endpoint for the task", "Boundary: does touching (s == prevEnd) count as overlap?", "Meeting-rooms needs a min-heap of end times"],
    examples: [["blind", "p26", "Merge Intervals"], ["blind", "p27", "Insert Interval"], ["blind", "p61", "Meeting Rooms II"]],
  },
  {
    id: "greedy", name: "Greedy", color: "var(--c-interview)",
    tagline: "Make the locally optimal choice and never look back — when it provably works.",
    triggers: [
      "\"Minimum number of…\", \"can you reach…\", \"maximum you can…\"",
      "A sort + single sweep feels sufficient",
      "Exchange-argument intuition ('taking the biggest/earliest can't hurt')",
    ],
    use: "When a local optimum leads to a global optimum — often provable via an exchange argument.",
    template: `arr.sort()                      # or sort by a smart key
reach = 0
for i, x in enumerate(arr):
    if i > reach:               # unreachable → fail
        return False
    reach = max(reach, i + x)   # extend greedily
return True`,
    complexity: "Time O(n log n) with the sort, Space O(1)",
    pitfalls: ["Assuming greedy works without proof (many DP problems look greedy)", "Wrong sort key", "Missing the impossibility check"],
    examples: [["blind", "p25", "Jump Game"], ["blind", "p58", "Gas Station"], ["blind", "p62", "Task Scheduler"]],
  },
  {
    id: "topo-sort", name: "Topological Sort", color: "var(--c-network)",
    tagline: "Order a DAG so every edge points forward — and detect cycles for free.",
    triggers: [
      "\"Course schedule\", \"build order\", \"prerequisites\"",
      "\"Is there a valid ordering?\", \"detect a cycle in directed graph\"",
      "Dependencies between tasks/characters",
    ],
    use: "When you must sequence items respecting directed dependencies.",
    template: `from collections import deque, defaultdict
indeg = [0] * n
g = defaultdict(list)
for a, b in edges:              # b must come before a
    g[b].append(a); indeg[a] += 1
q = deque([i for i in range(n) if indeg[i] == 0])
order = []
while q:
    c = q.popleft(); order.append(c)
    for nb in g[c]:
        indeg[nb] -= 1
        if indeg[nb] == 0:
            q.append(nb)
return order if len(order) == n else []   # [] = cycle`,
    complexity: "Time O(V + E), Space O(V)",
    pitfalls: ["Edge direction (prereq → course)", "Not detecting cycles (order shorter than n)", "DFS variant needs 3 states (visiting/visited)"],
    examples: [["blind", "p19", "Course Schedule"], ["blind", "p77", "Course Schedule II"], ["blind", "p63", "Alien Dictionary"]],
  },
  {
    id: "tree-dfs", name: "Tree DFS", color: "var(--c-interview)",
    tagline: "Recurse into children and combine results on the way back up.",
    triggers: [
      "\"Height / depth / diameter\", \"is it valid/balanced/symmetric\"",
      "\"Path sum\", \"lowest common ancestor\"",
      "Anything where a node's answer depends on its subtrees",
    ],
    use: "When the whole-tree answer is a fold of subtree answers (post-order) or a top-down constraint (pre-order).",
    template: `def dfs(node):
    if not node:
        return 0                # base case
    left = dfs(node.left)
    right = dfs(node.right)
    update_global(left, right, node.val)   # e.g. diameter/path sum
    return 1 + max(left, right)            # value passed to parent
dfs(root)`,
    complexity: "Time O(n), Space O(h) recursion",
    pitfalls: ["Confusing 'return to parent' vs. 'global answer'", "Passing bounds for BST validation", "Deep trees → recursion limit (rare in interviews)"],
    examples: [["blind", "p15", "Validate BST"], ["blind", "p16", "Diameter of Binary Tree"], ["blind", "p70", "Binary Tree Maximum Path Sum"]],
  },
  {
    id: "linked-list", name: "Linked List Manipulation", color: "var(--c-storage)",
    tagline: "Rewire next-pointers with a dummy head and careful pointer bookkeeping.",
    triggers: [
      "\"Reverse\", \"merge\", \"reorder\", \"remove\" a linked list",
      "In-place pointer surgery with O(1) extra space",
      "Edge cases at the head → use a dummy node",
    ],
    use: "When you manipulate pointers directly and want to avoid special-casing the head.",
    template: `dummy = cur = ListNode(0)
while l1 and l2:
    if l1.val < l2.val:
        cur.next, l1 = l1, l1.next
    else:
        cur.next, l2 = l2, l2.next
    cur = cur.next
cur.next = l1 or l2
return dummy.next`,
    complexity: "Time O(n), Space O(1)",
    pitfalls: ["Losing the rest of the list (save .next before rewiring)", "Not using a dummy → messy head handling", "Null-pointer dereferences"],
    examples: [["blind", "p9", "Merge Two Sorted Lists"], ["blind", "p10", "Remove Nth Node From End"]],
  },
];

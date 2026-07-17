/* =====================================================================
   PATTERN DETAIL — end-to-end teaching content for each pattern, rendered
   by pattern.js on pattern.html?id=<id>. Each entry has intuition, an
   interactive/visual aid, recognition heuristics, when-to-use/avoid,
   an annotated template, variations, pitfalls, a worked trace, and
   graded practice problems.

   viz types: "array" (stepper), "grid" (matrix), "bars" (timeline),
              "hist" (histogram), "mermaid" (diagram).
   ===================================================================== */
window.PATTERN_DETAIL = {

  "two-pointers": {
    name: "Two Pointers", color: "var(--c-compute)", complexity: "Time O(n) · Space O(1)",
    tagline: "Two indices sweep a sequence — from both ends, or in tandem — turning an O(n²) pair search into one linear pass.",
    recognize: {
      triggers: [
        "The array is sorted and you need a pair / triplet hitting a target",
        "Words like \"pair\", \"closest\", \"container\", \"trapping\", \"palindrome\"",
        "Reverse, partition, or dedupe in place with O(1) extra space",
      ],
      howToFind: "Ask: \"If I fix one element, is there a monotonic way to find its partner without re-scanning?\" If moving one boundary can only ever help or hurt the objective, two pointers applies.",
      redFlags: ["Unsorted data where order carries no meaning (hashing is usually better)", "You need every pair, not just the best one"],
    },
    idea: "Place one pointer at each end of a sorted array. The pair they point to gives some value; because the array is sorted, you know <b>exactly which pointer to move</b> to improve it. Each element is visited once, so the whole scan is linear instead of quadratic.",
    viz: {
      type: "array", caption: "Container With Most Water — width shrinks each step, so only a taller wall can beat the current best.",
      cells: ["1", "8", "6", "2", "5", "4", "8", "3", "7"],
      frames: [
        { marks: { L: 0, R: 8 }, note: "area = min(1,7) × 8 = 8. Left wall is shorter → move L inward." },
        { marks: { L: 1, R: 8 }, note: "area = min(8,7) × 7 = 49 ✓ new best. Right wall shorter → move R." },
        { marks: { L: 1, R: 6 }, note: "area = min(8,8) × 5 = 40. Best stays 49; move either side." },
        { marks: { L: 1, R: 5 }, note: "Nothing beats 49. Pointers keep closing → answer 49." },
      ],
    },
    steps: [
      "Put <code>l</code> at the start and <code>r</code> at the end.",
      "Evaluate the current pair (sum, area, match…).",
      "Move the pointer that could improve the result — for a target sum, move <code>l</code> up if the sum is too small, <code>r</code> down if too big.",
      "Stop when the pointers cross.",
    ],
    template: `l, r = 0, len(arr) - 1
while l < r:
    s = arr[l] + arr[r]
    if s == target:
        return [l, r]
    elif s < target:
        l += 1          # need a bigger value
    else:
        r -= 1          # need a smaller value`,
    whenUse: ["Sorted array pair/triplet sums", "Max/min over a window bounded by both ends", "In-place reversals and partitions (Dutch flag, move zeroes)", "Palindrome checks"],
    whenAvoid: ["Data isn't sorted and can't be (sort cost may dominate, or a hash map is simpler)", "You must enumerate all pairs"],
    variations: [
      { name: "Opposite ends", note: "l at front, r at back — sums, containers, trapping water." },
      { name: "Same direction (slow/fast write)", note: "One pointer writes, the other scans — move zeroes, remove duplicates." },
      { name: "Fixed one + two-pointer inner", note: "3Sum: fix i, two-pointer the rest." },
    ],
    pitfalls: ["Forgetting the array must be sorted for the sum variant", "Off-by-one when l and r meet", "Moving the wrong pointer — always move the one that improves the objective"],
    worked: {
      title: "Two Sum II (sorted)", problem: { set: "blind", id: "p4", label: "Try a two-pointer problem" },
      trace: ["arr=[2,7,11,15], target=9", "l=0,r=3 → 2+15=17 > 9 → r=2", "l=0,r=2 → 2+11=13 > 9 → r=1", "l=0,r=1 → 2+7=9 ✓ → return [0,1]"],
    },
    problems: [
      { set: "blind", id: "p4", title: "Container With Most Water", difficulty: "Medium" },
      { set: "blind", id: "p5", title: "Trapping Rain Water", difficulty: "Hard" },
      { set: "blind", id: "p69", title: "Find the Duplicate Number", difficulty: "Medium" },
      { set: "microsoft", id: "m12", title: "Move Zeroes", difficulty: "Easy" },
    ],
  },

  "sliding-window": {
    name: "Sliding Window", color: "var(--c-network)", complexity: "Time O(n) · Space O(k)",
    tagline: "A window [l..r] grows and shrinks over a sequence, maintaining a property so you never re-scan the same elements.",
    recognize: {
      triggers: [
        "\"Longest / shortest substring or subarray\" with a constraint",
        "Phrases like \"at most K\", \"without repeating\", \"contains all of…\"",
        "Contiguous elements + optimize length or sum",
      ],
      howToFind: "If the answer is a contiguous run and a brute force would recompute overlapping ranges, slide a window: extend the right edge to include more, contract the left edge when the window breaks the rule.",
      redFlags: ["The subsequence need not be contiguous (that's usually DP)", "You need all windows, not the best one, with heavy per-window work"],
    },
    idea: "Keep a window that always satisfies your condition. Push the <b>right</b> edge out to grow it; when it becomes invalid, pull the <b>left</b> edge in until it's valid again. Every index enters and leaves the window at most once → linear.",
    viz: {
      type: "array", caption: "Longest substring without repeating characters — jump L past a duplicate.",
      cells: ["a", "b", "c", "a", "b", "c", "b", "b"],
      frames: [
        { marks: { L: 0, R: 2 }, win: [0, 2], note: "window \"abc\" — all unique, length 3 (best so far)." },
        { marks: { L: 1, R: 3 }, win: [1, 3], note: "r=3 'a' repeats (last seen 0) → move L to 1. \"bca\", length 3." },
        { marks: { L: 2, R: 4 }, win: [2, 4], note: "r=4 'b' repeats → move L to 2. \"cab\", length 3 → answer 3." },
      ],
    },
    steps: [
      "Expand: add <code>s[r]</code> to the window's state.",
      "While the window is invalid, remove <code>s[l]</code> and advance <code>l</code>.",
      "The window is now valid — update the answer with its size or sum.",
      "Repeat until <code>r</code> reaches the end.",
    ],
    template: `from collections import defaultdict
count = defaultdict(int)
l = best = 0
for r in range(len(s)):
    count[s[r]] += 1
    while invalid(count):        # e.g. some char count > 1
        count[s[l]] -= 1
        l += 1
    best = max(best, r - l + 1)
return best`,
    whenUse: ["Longest/shortest contiguous run under a constraint", "Fixed-size window aggregates (max sum of k)", "\"Cover all of t\" minimum window", "Counting subarrays with a property"],
    whenAvoid: ["Non-contiguous subsequences", "The window property isn't monotonic (shrinking doesn't restore validity)"],
    variations: [
      { name: "Variable window", note: "Grow/shrink to optimize length — longest substring, min window." },
      { name: "Fixed window", note: "Size k slides one step at a time — max sum of k, averages." },
      { name: "Window + monotonic deque", note: "Sliding window maximum keeps a decreasing deque of indices." },
    ],
    pitfalls: ["Shrinking with <code>if</code> instead of <code>while</code>", "Updating the answer before restoring validity", "Confusing fixed vs. variable window logic"],
    worked: {
      title: "Longest substring without repeating", problem: { set: "blind", id: "p6", label: "Solve it in the Playground" },
      trace: ["s='abcabcbb'", "grow to 'abc' (len 3)", "r='a' repeats → l jumps past first 'a'", "window stays size 3 throughout → answer 3"],
    },
    problems: [
      { set: "blind", id: "p6", title: "Longest Substring Without Repeating", difficulty: "Medium" },
      { set: "blind", id: "p7", title: "Minimum Window Substring", difficulty: "Hard" },
      { set: "blind", id: "p43", title: "Sliding Window Maximum", difficulty: "Hard" },
    ],
  },

  "fast-slow": {
    name: "Fast & Slow Pointers", color: "var(--c-compute)", complexity: "Time O(n) · Space O(1)",
    tagline: "Two pointers at different speeds reveal cycles, midpoints, and nth-from-end in a single O(1)-space pass.",
    recognize: {
      triggers: [
        "Linked list: detect a cycle, find the middle, nth from end",
        "\"Does it loop?\", \"where does the cycle start?\"",
        "An array where values act as next-index pointers",
      ],
      howToFind: "If you need a structural fact about a sequence you can only traverse forward — and you can't use extra space — run one pointer twice as fast as the other and reason about when/where they meet.",
      redFlags: ["You can afford a visited-set (simpler)", "Random access is available and cheaper"],
    },
    idea: "Advance <code>slow</code> by one and <code>fast</code> by two. If there's a cycle, <code>fast</code> laps <code>slow</code> and they meet inside it. If not, <code>fast</code> falls off the end exactly when <code>slow</code> sits at the middle.",
    viz: {
      type: "mermaid", caption: "Values act as next-pointers; a duplicate creates a cycle. Slow (+1) and fast (+2) meet inside it; a second walk from the start finds the entrance.",
      code: `graph LR
  n1((1)) --> n3((3)) --> n4((4)) --> n2((2))
  n2 --> n2b((2))
  n2b --> n4`,
    },
    steps: [
      "Start both pointers at the head.",
      "Loop: <code>slow = slow.next</code>, <code>fast = fast.next.next</code>.",
      "If they ever meet → a cycle exists.",
      "For the cycle entrance: reset one pointer to the head and advance both by one; they meet at the start of the loop.",
    ],
    template: `slow = fast = head
while fast and fast.next:
    slow = slow.next          # +1
    fast = fast.next.next     # +2
    if slow is fast:
        break                 # cycle detected
# if the loop ends normally, 'slow' is the midpoint`,
    whenUse: ["Cycle detection in a linked list or functional graph", "Find the middle node in one pass", "Nth-from-end with a fixed gap", "Happy number / duplicate number (values as pointers)"],
    whenAvoid: ["A hash set of visited nodes is acceptable and clearer", "The structure supports indexing"],
    variations: [
      { name: "Cycle detection", note: "Floyd's tortoise and hare." },
      { name: "Cycle entrance", note: "Meet, then walk from head + meeting point together." },
      { name: "Fixed-gap pointers", note: "Advance fast by n first (remove nth-from-end)." },
    ],
    pitfalls: ["Dereferencing <code>fast.next</code> without a null check", "Confusing 'a cycle exists' with 'where the cycle starts' (needs the second walk)"],
    worked: {
      title: "Find the Duplicate Number", problem: { set: "blind", id: "p69", label: "Solve it in the Playground" },
      trace: ["nums=[1,3,4,2,2]", "phase 1: slow/fast meet inside the cycle", "phase 2: walk from index 0 and the meeting point", "they converge at value 2 → the duplicate"],
    },
    problems: [
      { set: "blind", id: "p69", title: "Find the Duplicate Number", difficulty: "Medium" },
      { set: "blind", id: "p10", title: "Remove Nth Node From End", difficulty: "Medium" },
    ],
  },

  "hashing": {
    name: "Hash Map / Set", color: "var(--c-storage)", complexity: "Time O(n) · Space O(n)",
    tagline: "Trade memory for O(1) lookups: \"have I seen this, its complement, or how many times?\"",
    recognize: {
      triggers: [
        "\"Two Sum\"-style complement lookups",
        "Counting frequencies, grouping, deduping",
        "\"Have I seen…\", \"first unique\", \"anagram\", \"consecutive\"",
      ],
      howToFind: "Whenever a nested loop is really asking a membership or counting question repeatedly, replace the inner loop with a dict/set lookup.",
      redFlags: ["Order matters and you need a sorted structure", "Memory is tightly constrained"],
    },
    idea: "A hash map answers \"is X here?\" and \"how many X?\" in O(1). Instead of re-scanning for a partner or a count, you remember what you've seen as you go — one pass, constant-time questions.",
    viz: {
      type: "grid", caption: "Two Sum — as we scan, we ask the map for the complement before storing the current value.",
      cols: ["value", "index"],
      rows: [["2", "0"]],
      note: "At value 7 (target 9): is 9−7=2 in the map? Yes → answer [0, 1]. We check first, then store.",
    },
    steps: [
      "Create an empty map/set.",
      "For each element, ask the map a question first (is the complement present? seen before?).",
      "If the answer solves the problem, return.",
      "Otherwise record the current element and continue.",
    ],
    template: `seen = {}                       # value -> index
for i, x in enumerate(nums):
    if target - x in seen:
        return [seen[target - x], i]
    seen[x] = i`,
    whenUse: ["Complement / pair lookups", "Frequency counts (Counter)", "Grouping by a key (anagrams via sorted signature)", "Dedup and membership tests"],
    whenAvoid: ["You need ordered iteration or range queries", "Keys are unhashable and can't be normalized"],
    variations: [
      { name: "Set for membership", note: "Longest consecutive sequence walks runs from a set." },
      { name: "Counter for frequencies", note: "Anagrams, top-k, first unique." },
      { name: "Map to index/position", note: "Two Sum, sliding-window last-seen." },
    ],
    pitfalls: ["Storing before checking (Two Sum must check, then store)", "Using a list where a set gives O(1)", "Hashing a list — convert to a tuple"],
    worked: {
      title: "Two Sum", problem: { set: "blind", id: "p1", label: "Solve it in the Playground" },
      trace: ["nums=[2,7,11], target=9", "i=0 x=2: need 7, absent → seen={2:0}", "i=1 x=7: need 2, present → return [0,1]"],
    },
    problems: [
      { set: "blind", id: "p1", title: "Two Sum", difficulty: "Easy" },
      { set: "blind", id: "p3", title: "Longest Consecutive Sequence", difficulty: "Medium" },
      { set: "blind", id: "p30", title: "Group Anagrams", difficulty: "Medium" },
      { set: "microsoft", id: "m4", title: "Valid Anagram", difficulty: "Easy" },
    ],
  },

  "binary-search": {
    name: "Binary Search", color: "var(--c-network)", complexity: "Time O(log n) · Space O(1)",
    tagline: "Halve the search space each step over a sorted — or monotonic — domain.",
    recognize: {
      triggers: [
        "Input is sorted (even rotated) and you need O(log n)",
        "\"Smallest/largest value such that a condition holds\"",
        "\"Minimize the maximum\" / \"maximize the minimum\" (search on the answer)",
      ],
      howToFind: "Look for monotonicity: is there a boundary where a predicate flips from false to true? If yes, binary-search that boundary — even if the array itself isn't the thing you're searching.",
      redFlags: ["No sorted or monotonic structure to exploit", "n is tiny (a linear scan is simpler and just as fast)"],
    },
    idea: "Check the middle. Because the domain is ordered, one comparison tells you which half can contain the answer — so you throw away the other half every step. log₂(n) steps to pinpoint one element.",
    viz: {
      type: "array", caption: "Search for 7 in a sorted array — each step discards half.",
      cells: ["1", "3", "5", "7", "9", "11"],
      frames: [
        { marks: { lo: 0, mid: 2, hi: 5 }, note: "a[mid]=5 < 7 → answer is to the right → lo = mid+1." },
        { marks: { lo: 3, mid: 4, hi: 5 }, note: "a[mid]=9 > 7 → answer is to the left → hi = mid−1." },
        { marks: { lo: 3, mid: 3, hi: 3 }, note: "a[mid]=7 == target → found at index 3." },
      ],
    },
    steps: [
      "Set <code>lo, hi</code> to the ends of the search space.",
      "Compute <code>mid</code>; test the predicate or compare to the target.",
      "Discard the half that cannot contain the answer.",
      "Repeat until the space collapses to the boundary.",
    ],
    template: `lo, hi = 0, len(a) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if a[mid] == target:
        return mid
    elif a[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1
return -1`,
    whenUse: ["Find/insert position in sorted data", "Rotated-array search (one half is always sorted)", "Binary search on the answer (Koko eats bananas, min capacity)", "First/last occurrence, peak element"],
    whenAvoid: ["Unsorted data with no monotonic predicate", "You need all matches, not a boundary"],
    variations: [
      { name: "Exact match", note: "Classic <=, return mid." },
      { name: "Boundary (lower/upper bound)", note: "Find the first index where predicate is true." },
      { name: "Search on answer", note: "Guess a value, feasibility-check, narrow the range." },
    ],
    pitfalls: ["Infinite loops from wrong <code>lo/hi</code> updates", "Mixing up <code>&lt;</code> vs <code>&lt;=</code> in the loop", "Boundary variant returning the wrong side"],
    worked: {
      title: "Search in Rotated Sorted Array", problem: { set: "blind", id: "p11", label: "Solve it in the Playground" },
      trace: ["nums=[4,5,6,7,0,1,2], target=0", "mid=7: left half sorted, 0 not in [4,7) → go right", "mid=1: right side, 0 in (1,2]? no → go left", "find 0 at index 4"],
    },
    problems: [
      { set: "blind", id: "p11", title: "Search in Rotated Sorted Array", difficulty: "Medium" },
      { set: "blind", id: "p12", title: "Find Minimum in Rotated Array", difficulty: "Medium" },
      { set: "blind", id: "p54", title: "Find Peak Element", difficulty: "Medium" },
      { set: "blind", id: "p13", title: "Median of Two Sorted Arrays", difficulty: "Hard" },
    ],
  },

  "bfs": {
    name: "BFS (Breadth-First Search)", color: "var(--c-network)", complexity: "Time O(V + E) · Space O(V)",
    tagline: "A queue explores level by level — the default for shortest paths on unweighted graphs and grids.",
    recognize: {
      triggers: [
        "\"Shortest path / fewest steps\" on an unweighted graph or grid",
        "\"Level order\", \"nearest\", \"minimum number of moves\"",
        "Spreading outward from one or many sources",
      ],
      howToFind: "If the cost of every move is equal and you want the minimum number of moves, BFS gives it for free — the first time you reach a node is via the shortest path.",
      redFlags: ["Edges have different weights (use Dijkstra)", "You want any path, and depth is huge (DFS uses less memory)"],
    },
    idea: "Process nodes in waves. Everything at distance 1 is handled before anything at distance 2. A queue enforces that order, and marking nodes visited <b>when you enqueue them</b> keeps the work linear.",
    viz: {
      type: "mermaid", caption: "BFS from S: level 0 = {S}, level 1 = {A, B}, level 2 = {C}, level 3 = {G}. The first time G is dequeued is the shortest distance.",
      code: `graph TD
  S((S)) --> A((A))
  S --> B((B))
  A --> C((C))
  B --> C
  C --> G((G))`,
    },
    steps: [
      "Seed a queue with the start node(s); mark them visited.",
      "Pop a node; if it's the goal, return the distance.",
      "Enqueue each unvisited neighbor, marking it visited immediately.",
      "Process a whole level per outer iteration if you need distances.",
    ],
    template: `from collections import deque
q = deque([start]); seen = {start}; steps = 0
while q:
    for _ in range(len(q)):        # one full level
        node = q.popleft()
        if node == goal:
            return steps
        for nb in neighbors(node):
            if nb not in seen:
                seen.add(nb)
                q.append(nb)
    steps += 1`,
    whenUse: ["Shortest path on unweighted graphs/grids", "Level-order tree traversal", "Multi-source spread (rotting oranges, walls and gates)", "Minimum moves puzzles"],
    whenAvoid: ["Weighted shortest paths (Dijkstra/Bellman-Ford)", "Deep, memory-heavy search where DFS is leaner"],
    variations: [
      { name: "Level-tracked BFS", note: "Loop over len(queue) to count distance." },
      { name: "Multi-source BFS", note: "Seed the queue with all sources at once." },
      { name: "0-1 BFS", note: "Deque for edges of weight 0 or 1." },
    ],
    pitfalls: ["Marking visited on dequeue → the same node enqueued many times", "Forgetting the level loop when you need exact distances"],
    worked: {
      title: "Word Ladder", problem: { set: "blind", id: "p67", label: "Solve it in the Playground" },
      trace: ["hit → hot → dot → dog → cog", "each step changes one letter", "BFS reaches 'cog' first at distance 5 → answer 5"],
    },
    problems: [
      { set: "blind", id: "p14", title: "Binary Tree Level Order Traversal", difficulty: "Medium" },
      { set: "blind", id: "p17", title: "Number of Islands", difficulty: "Medium" },
      { set: "blind", id: "p67", title: "Word Ladder", difficulty: "Hard" },
    ],
  },

  "dfs-backtracking": {
    name: "DFS & Backtracking", color: "var(--c-interview)", complexity: "Time O(2ⁿ) or O(n!) · Space O(n)",
    tagline: "Choose, explore, then un-choose — systematically enumerate combinations, permutations, and paths.",
    recognize: {
      triggers: [
        "\"All combinations / permutations / subsets\"",
        "\"Does a path exist\", \"generate every…\", constraint satisfaction",
        "Grid/board exploration where you mark and unmark cells",
      ],
      howToFind: "If the solution is a sequence of choices and you must explore all of them (or find one that satisfies constraints), build the decision tree with recursion and undo each choice on the way back.",
      redFlags: ["Overlapping subproblems with an optimal value → that's DP, not raw enumeration", "The tree is astronomically large with no pruning"],
    },
    idea: "Walk a tree of choices depth-first. At each node you <b>make a choice</b>, recurse to explore its consequences, then <b>undo the choice</b> so the next branch starts clean. Pruning invalid branches early keeps it tractable.",
    viz: {
      type: "mermaid", caption: "Subsets of [1,2,3] — every node in this tree is a valid subset. We record on entry and extend with later elements only.",
      code: `graph TD
  r["[ ]"] --> a["[1]"]
  r --> b["[2]"]
  r --> c["[3]"]
  a --> a2["[1,2]"]
  a --> a3["[1,3]"]
  a2 --> a23["[1,2,3]"]
  b --> b3["[2,3]"]`,
    },
    steps: [
      "At each step, record or check the current partial solution.",
      "Loop over the available choices.",
      "Make a choice (append), recurse, then un-make it (pop).",
      "Prune branches that can't lead to a valid solution.",
    ],
    template: `res = []
def dfs(start, path):
    res.append(path[:])          # record (subsets) or test goal
    for i in range(start, len(nums)):
        path.append(nums[i])     # choose
        dfs(i + 1, path)         # explore
        path.pop()               # un-choose (backtrack)
dfs(0, [])
return res`,
    whenUse: ["Subsets, combinations, permutations", "Constraint puzzles (N-Queens, Sudoku)", "Path existence / enumeration in a grid", "Generate-and-test with pruning"],
    whenAvoid: ["You only need the optimal value over overlapping subproblems (DP)", "The search space is unbounded without pruning"],
    variations: [
      { name: "Subsets / combinations", note: "Pass a start index to avoid duplicates." },
      { name: "Permutations", note: "Track a used set (order matters)." },
      { name: "Grid backtracking", note: "Mark a cell, recurse in 4 directions, restore." },
    ],
    pitfalls: ["Appending <code>path</code> by reference instead of a copy", "Forgetting to undo shared state", "No base case or pruning → time-limit blowup"],
    worked: {
      title: "Subsets", problem: { set: "blind", id: "p32", label: "Solve it in the Playground" },
      trace: ["nums=[1,2,3]", "[] → [1] → [1,2] → [1,2,3]; backtrack", "→ [1,3]; backtrack → [2] → [2,3]; → [3]", "8 subsets total"],
    },
    problems: [
      { set: "blind", id: "p20", title: "Word Search", difficulty: "Medium" },
      { set: "blind", id: "p32", title: "Subsets", difficulty: "Medium" },
      { set: "blind", id: "p33", title: "Permutations", difficulty: "Medium" },
      { set: "blind", id: "p57", title: "Combination Sum II", difficulty: "Medium" },
    ],
  },

  "dp-1d": {
    name: "Dynamic Programming (1D)", color: "var(--c-interview)", complexity: "Time O(n·transitions) · Space O(n) → O(1)",
    tagline: "Build the answer from smaller overlapping subproblems along a single axis.",
    recognize: {
      triggers: [
        "\"Number of ways\", \"min/max cost to reach\", \"can you…\"",
        "A choice at each step where the future depends only on recent state",
        "\"climb stairs\", \"rob houses\", \"coin change\", \"decode\"",
      ],
      howToFind: "If greedy fails and the optimal answer reuses optimal answers to smaller versions of the same problem, define <code>dp[i]</code> as the answer for the first i elements and find the transition from earlier states.",
      redFlags: ["No overlapping subproblems (plain recursion/divide-and-conquer)", "A greedy choice is provably optimal"],
    },
    idea: "Solve tiny versions first and store them, so each bigger version is a quick combination of ones you already solved. <code>dp[i]</code> depends on a few earlier entries — often just <code>dp[i-1]</code> and <code>dp[i-2]</code>, which collapses to two rolling variables.",
    viz: {
      type: "array", caption: "Climbing Stairs — dp[i] = dp[i-1] + dp[i-2] (Fibonacci-shaped).",
      cells: ["1", "1", "2", "3", "5", "8"],
      frames: [
        { marks: { i: 2 }, note: "dp[2] = dp[1] + dp[0] = 1 + 1 = 2." },
        { marks: { i: 3 }, note: "dp[3] = dp[2] + dp[1] = 2 + 1 = 3." },
        { marks: { i: 5 }, note: "dp[5] = dp[4] + dp[3] = 5 + 3 = 8 → answer." },
      ],
    },
    steps: [
      "Define <code>dp[i]</code> in words — the answer for the first i items.",
      "Write the transition: how does <code>dp[i]</code> use earlier entries?",
      "Set the base cases.",
      "Fill left to right; optionally collapse to O(1) rolling variables.",
    ],
    template: `dp = [base] * (n + 1)
dp[0] = seed
for i in range(1, n + 1):
    dp[i] = combine(dp[i - 1], dp[i - 2], ...)   # transition
return dp[n]
# Often: prev1, prev2 = f(prev1, prev2)  for O(1) space`,
    whenUse: ["Counting ways / paths", "Min/max cost along a line", "Take-or-skip choices (house robber)", "Reachability / decodability"],
    whenAvoid: ["Greedy is provably optimal", "State needs two independent indices (that's 2D DP)"],
    variations: [
      { name: "Fibonacci-style", note: "dp[i] from the last one or two entries." },
      { name: "Knapsack (1D)", note: "Iterate capacities, reuse a rolling array." },
      { name: "Kadane / running extremes", note: "Max subarray, max product." },
    ],
    pitfalls: ["Wrong base cases", "Off-by-one in indexing", "Not spotting the Fibonacci collapse to O(1) space"],
    worked: {
      title: "House Robber", problem: { set: "blind", id: "p24", label: "Solve it in the Playground" },
      trace: ["nums=[2,7,9,3,1]", "rolling: 2 → 7 → 11 (2+9) → 11 → 12 (11+1)", "answer 12"],
    },
    problems: [
      { set: "blind", id: "p24", title: "House Robber", difficulty: "Medium" },
      { set: "blind", id: "p23", title: "Coin Change", difficulty: "Medium" },
      { set: "blind", id: "p29", title: "Climbing Stairs", difficulty: "Easy" },
      { set: "blind", id: "p79", title: "Maximum Product Subarray", difficulty: "Medium" },
    ],
  },

  "dp-2d": {
    name: "Dynamic Programming (2D / grid)", color: "var(--c-interview)", complexity: "Time O(m·n) · Space O(m·n) → O(n)",
    tagline: "A table indexed by two dimensions — comparing two strings, walking a grid, or filling intervals.",
    recognize: {
      triggers: [
        "Two sequences compared (edit distance, LCS, regex)",
        "Grid path counting or min-cost paths",
        "\"match\", \"transform A into B\", \"unique paths\"",
      ],
      howToFind: "If state needs two indices — a prefix of A and a prefix of B, or a row and a column — build a 2D table and express each cell from its neighbors (up, left, diagonal).",
      redFlags: ["One axis suffices (1D DP)", "No overlapping subproblems"],
    },
    idea: "Each cell answers a sub-question: \"the best result using the first i of A and first j of B.\" Matching characters carry the diagonal; a mismatch takes the best of the neighboring cells plus a cost. Fill the grid and read the corner.",
    viz: {
      type: "grid", caption: "Edit Distance (horse → ros). dp[i][j] = edits to convert the first i letters of \"horse\" into the first j of \"ros\". Answer = bottom-right = 3.",
      cols: ["", "∅", "r", "o", "s"],
      rows: [
        ["∅", "0", "1", "2", "3"],
        ["h", "1", "1", "2", "3"],
        ["o", "2", "2", "1", "2"],
        ["r", "3", "2", "2", "2"],
        ["s", "4", "3", "3", "2"],
        ["e", "5", "4", "4", "3"],
      ],
      hl: [5, 4],
    },
    steps: [
      "Define <code>dp[i][j]</code> over prefixes of the two inputs.",
      "Seed the first row and column (empty-string cases).",
      "For each cell: if the current items match, take the diagonal; else 1 + best(up, left, diagonal).",
      "Return the bottom-right cell.",
    ],
    template: `dp = [[0] * (n + 1) for _ in range(m + 1)]
for i in range(m + 1): dp[i][0] = i
for j in range(n + 1): dp[0][j] = j
for i in range(1, m + 1):
    for j in range(1, n + 1):
        if a[i-1] == b[j-1]:
            dp[i][j] = dp[i-1][j-1]
        else:
            dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
return dp[m][n]`,
    whenUse: ["Edit distance, LCS, longest common substring", "Regex / wildcard matching", "Grid path counts & min-cost paths", "Interval DP (burst balloons, matrix chain)"],
    whenAvoid: ["A single index captures the state", "Greedy / direct formula exists"],
    variations: [
      { name: "String × string", note: "Prefixes of two sequences." },
      { name: "Grid paths", note: "Cell from top + left." },
      { name: "Interval DP", note: "Loop by length; pick a split/last point." },
    ],
    pitfalls: ["Base row/column initialization", "Mixing up which neighbor means insert vs delete vs replace", "Interval DP needs a length-first loop order"],
    worked: {
      title: "Unique Paths", problem: { set: "blind", id: "p28", label: "Solve it in the Playground" },
      trace: ["3×3 grid", "first row & column = 1", "dp[i][j] = dp[i-1][j] + dp[i][j-1]", "bottom-right = 6"],
    },
    problems: [
      { set: "blind", id: "p28", title: "Unique Paths", difficulty: "Medium" },
      { set: "blind", id: "p65", title: "Edit Distance", difficulty: "Hard" },
      { set: "blind", id: "p72", title: "Regular Expression Matching", difficulty: "Hard" },
    ],
  },

  "heap": {
    name: "Heap / Top-K", color: "var(--c-storage)", complexity: "Time O(n log k) · Space O(k)",
    tagline: "A priority queue surfaces the best element in O(log n) — the tool for \"k\" and streaming problems.",
    recognize: {
      triggers: [
        "\"K largest / smallest / most frequent\"",
        "\"Median of a stream\", \"merge K sorted…\"",
        "Repeatedly grab the current min or max",
      ],
      howToFind: "If you need ordered access to extremes but not a full sort — especially repeatedly, or over a stream — a heap gives the min/max in O(log n) per operation.",
      redFlags: ["You need everything sorted once (just sort)", "k ≈ n and a sort is simpler"],
    },
    idea: "A binary heap keeps the smallest (or largest) element at the root with only partial ordering, so push and pop cost O(log n). Keep a heap of size k and you always hold the top-k with tiny memory.",
    viz: {
      type: "mermaid", caption: "A min-heap: every parent ≤ its children, so the minimum is always at the root. Pop it in O(log n), then sift down.",
      code: `graph TD
  a((2)) --> b((5))
  a --> c((8))
  b --> d((9))
  b --> e((7))`,
    },
    steps: [
      "Choose a min-heap (top-k largest) or max-heap (top-k smallest).",
      "Push each element; if the heap exceeds k, pop the root.",
      "The root is the kth extreme; the heap holds the top-k.",
      "For streams, maintain two heaps to balance around the median.",
    ],
    template: `import heapq
heap = []                       # min-heap
for x in nums:
    heapq.heappush(heap, x)
    if len(heap) > k:
        heapq.heappop(heap)     # keep only k largest
return heap[0]                  # kth largest
# max-heap: push -x`,
    whenUse: ["Top-k largest / smallest / frequent", "Merge k sorted lists/streams", "Running median (two heaps)", "Dijkstra / Prim (min-heap of frontier)"],
    whenAvoid: ["A single full sort suffices", "You need arbitrary-position access"],
    variations: [
      { name: "Size-k heap", note: "Bounded memory for top-k." },
      { name: "Two heaps", note: "Max-heap (low half) + min-heap (high half) for medians." },
      { name: "Heap of tuples", note: "(priority, item) for custom ordering / Dijkstra." },
    ],
    pitfalls: ["Python heaps are min-heaps — negate for max", "Forgetting to bound the heap to size k", "Unstable ordering when priorities tie (add a tiebreaker)"],
    worked: {
      title: "Kth Largest Element", problem: { set: "blind", id: "p34", label: "Solve it in the Playground" },
      trace: ["nums=[3,2,1,5,6,4], k=2", "keep a size-2 min-heap of the largest", "heap ends as [5,6]; root = 5", "answer 5"],
    },
    problems: [
      { set: "blind", id: "p34", title: "Kth Largest Element", difficulty: "Medium" },
      { set: "blind", id: "p35", title: "Top K Frequent Elements", difficulty: "Medium" },
      { set: "blind", id: "p45", title: "Find Median from Data Stream", difficulty: "Hard" },
      { set: "blind", id: "p61", title: "Meeting Rooms II", difficulty: "Medium" },
    ],
  },

  "monotonic-stack": {
    name: "Stack / Monotonic Stack", color: "var(--c-compute)", complexity: "Time O(n) · Space O(n)",
    tagline: "A stack that stays sorted answers \"next greater / smaller element\" in a single pass.",
    recognize: {
      triggers: [
        "\"Next greater / previous smaller element\"",
        "\"Largest rectangle\", \"daily temperatures\", \"valid parentheses\"",
        "You keep comparing to the most recent unresolved item",
      ],
      howToFind: "If each element only needs to be compared to the nearest bigger/smaller one — and once resolved it's never needed again — a monotonic stack processes everything in O(n).",
      redFlags: ["You need comparisons to far-away elements repeatedly (maybe a heap or DP)", "Order of resolution doesn't matter"],
    },
    idea: "Keep a stack whose values stay increasing (or decreasing). When a new element breaks the order, pop the elements it 'resolves' and compute their answer — each element is pushed and popped once, so the total work is linear.",
    viz: {
      type: "hist", caption: "Largest Rectangle in Histogram — bars 5 and 6 form the widest tall block: height 5 × width 2 = 10 (the max).",
      bars: [{ h: 2 }, { h: 1 }, { h: 5, cls: "hl" }, { h: 6, cls: "hl" }, { h: 2 }, { h: 3 }],
    },
    steps: [
      "Keep a stack of indices with monotonic values.",
      "For each new element, pop while it violates the order.",
      "When you pop, you've found that element's boundary → compute its answer (width, span).",
      "Push the current index; flush with a sentinel at the end.",
    ],
    template: `stack = []                      # indices, values increasing
best = 0
for i, h in enumerate(heights + [0]):
    while stack and heights[stack[-1]] > h:
        top = stack.pop()
        width = i - stack[-1] - 1 if stack else i
        best = max(best, heights[top] * width)
    stack.append(i)
return best`,
    whenUse: ["Next/previous greater or smaller element", "Largest rectangle / maximal area", "Daily temperatures, stock spans", "Matching / nesting (parentheses)"],
    whenAvoid: ["Comparisons span the whole array repeatedly", "Random access to arbitrary past elements is needed"],
    variations: [
      { name: "Increasing stack", note: "Next smaller / largest rectangle." },
      { name: "Decreasing stack", note: "Next greater / daily temperatures." },
      { name: "Plain stack", note: "Balanced parentheses, expression parsing." },
    ],
    pitfalls: ["Storing values when you need indices (for width)", "Forgetting the trailing sentinel to flush the stack"],
    worked: {
      title: "Largest Rectangle in Histogram", problem: { set: "blind", id: "p74", label: "Solve it in the Playground" },
      trace: ["heights=[2,1,5,6,2,3]", "pop 6 → area 6; pop 5 → area 5×2 = 10", "best = 10", "answer 10"],
    },
    problems: [
      { set: "blind", id: "p74", title: "Largest Rectangle in Histogram", difficulty: "Hard" },
      { set: "blind", id: "p73", title: "Maximal Rectangle", difficulty: "Hard" },
      { set: "blind", id: "p8", title: "Valid Parentheses", difficulty: "Easy" },
      { set: "blind", id: "p80", title: "Longest Valid Parentheses", difficulty: "Hard" },
    ],
  },

  "intervals": {
    name: "Intervals", color: "var(--c-network)", complexity: "Time O(n log n) · Space O(n)",
    tagline: "Sort by start (or end), then sweep once to merge, count, or schedule overlaps.",
    recognize: {
      triggers: [
        "\"Merge / insert intervals\", \"meeting rooms\"",
        "\"Overlapping\", \"non-overlapping\", \"minimum removals\"",
        "Ranges [start, end] that may collide",
      ],
      howToFind: "Anything about ranges colliding becomes easy once they're ordered — sort by start to merge, sort by end to schedule the most non-overlapping.",
      redFlags: ["Ranges are already handled by a sweep-line/heap you must maintain online", "Only point queries (maybe a different structure)"],
    },
    idea: "After sorting, overlapping intervals sit next to each other, so a single left-to-right sweep can merge them, count concurrency (with a min-heap of end times), or greedily pick the most non-overlapping.",
    viz: {
      type: "bars", caption: "Merge Intervals — A and B overlap → merge to [1,6]. C stands alone.", max: 11,
      rows: [
        { label: "A", start: 1, end: 3 },
        { label: "B", start: 2, end: 6 },
        { label: "C", start: 8, end: 10 },
        { label: "merged", start: 1, end: 6, cls: "hl" },
        { label: "", start: 8, end: 10, cls: "hl" },
      ],
    },
    steps: [
      "Sort intervals by start (or by end for scheduling).",
      "Walk through, comparing each to the last kept interval.",
      "Overlap → merge (extend the end) or count; no overlap → start a new one.",
      "For room counts, pop a min-heap of end times as rooms free up.",
    ],
    template: `intervals.sort(key=lambda x: x[0])
res = [intervals[0]]
for s, e in intervals[1:]:
    if s <= res[-1][1]:          # overlap
        res[-1][1] = max(res[-1][1], e)
    else:
        res.append([s, e])
return res`,
    whenUse: ["Merge / insert intervals", "Meeting rooms (min rooms, can-attend-all)", "Non-overlapping selection (interval scheduling)", "Employee free time, calendar merges"],
    whenAvoid: ["Ranges need online updates without re-sorting (segment tree)", "Only single-point lookups"],
    variations: [
      { name: "Merge (sort by start)", note: "Combine overlapping ranges." },
      { name: "Scheduling (sort by end)", note: "Greedily keep the earliest-finishing." },
      { name: "Sweep + heap", note: "Meeting Rooms II counts concurrency." },
    ],
    pitfalls: ["Sorting by the wrong endpoint for the task", "Boundary: does touching (s == prevEnd) count as overlap?", "Forgetting the heap for concurrency counts"],
    worked: {
      title: "Merge Intervals", problem: { set: "blind", id: "p26", label: "Solve it in the Playground" },
      trace: ["[[1,3],[2,6],[8,10]]", "sort → same order", "[1,3] & [2,6] overlap → [1,6]", "[8,10] separate → [[1,6],[8,10]]"],
    },
    problems: [
      { set: "blind", id: "p26", title: "Merge Intervals", difficulty: "Medium" },
      { set: "blind", id: "p27", title: "Insert Interval", difficulty: "Medium" },
      { set: "blind", id: "p61", title: "Meeting Rooms II", difficulty: "Medium" },
    ],
  },

  "greedy": {
    name: "Greedy", color: "var(--c-interview)", complexity: "Typically O(n log n) with a sort · Space O(1)",
    tagline: "Make the locally optimal choice and never look back — when it provably leads to the global optimum.",
    recognize: {
      triggers: [
        "\"Minimum number of…\", \"can you reach…\", \"maximum you can…\"",
        "A sort + single sweep feels sufficient",
        "Intuition that \"taking the biggest/earliest can't hurt\"",
      ],
      howToFind: "Try to argue an exchange: if some optimal solution differs from the greedy choice, can you swap it for the greedy one without getting worse? If yes, greedy works.",
      redFlags: ["Counterexamples exist where local best ≠ global best (use DP)", "Choices interact in complex ways"],
    },
    idea: "At each step commit to the option that looks best right now. It only works when a local optimum can't block a global one — provable via an exchange argument. When valid, it's simpler and faster than DP.",
    viz: {
      type: "array", caption: "Jump Game — track the farthest reachable index; if you ever stand beyond it, you're stuck.",
      cells: ["2", "3", "1", "1", "4"],
      frames: [
        { marks: { i: 0 }, note: "reach = max(0, 0+2) = 2." },
        { marks: { i: 1 }, note: "1 ≤ reach; reach = max(2, 1+3) = 4." },
        { marks: { i: 4 }, note: "4 ≤ reach → the end is reachable ✓." },
      ],
    },
    steps: [
      "Identify the greedy choice (largest, earliest-finishing, most frequent…).",
      "Sort if the choice depends on order.",
      "Sweep once, committing to the best local option and tracking a running invariant.",
      "Sanity-check with an exchange argument or a quick counterexample.",
    ],
    template: `arr.sort()                      # or a smart key
reach = 0
for i, x in enumerate(arr):
    if i > reach:               # unreachable → fail
        return False
    reach = max(reach, i + x)   # extend greedily
return True`,
    whenUse: ["Interval scheduling / activity selection", "Jump game, gas station", "Huffman coding, task scheduling", "Minimum coins with canonical currencies"],
    whenAvoid: ["Coin systems where greedy fails (use DP)", "Choices with long-range consequences"],
    variations: [
      { name: "Sort then sweep", note: "Scheduling, minimum arrows." },
      { name: "Running invariant", note: "Farthest reach, running balance." },
      { name: "Priority-based", note: "Pick the current best via a heap." },
    ],
    pitfalls: ["Assuming greedy works without proof (many DP problems look greedy)", "Wrong sort key", "Missing the impossibility / reset check"],
    worked: {
      title: "Gas Station", problem: { set: "blind", id: "p58", label: "Solve it in the Playground" },
      trace: ["gas=[1,2,3,4,5], cost=[3,4,5,1,2]", "tank dips negative early → reset start past it", "from index 3 the tank stays ≥ 0; total ≥ 0", "answer 3"],
    },
    problems: [
      { set: "blind", id: "p25", title: "Jump Game", difficulty: "Medium" },
      { set: "blind", id: "p58", title: "Gas Station", difficulty: "Medium" },
      { set: "blind", id: "p62", title: "Task Scheduler", difficulty: "Medium" },
    ],
  },

  "topo-sort": {
    name: "Topological Sort", color: "var(--c-network)", complexity: "Time O(V + E) · Space O(V)",
    tagline: "Order a DAG so every edge points forward — and detect cycles for free.",
    recognize: {
      triggers: [
        "\"Course schedule\", \"build order\", \"prerequisites\"",
        "\"Is there a valid ordering?\", \"detect a cycle in a directed graph\"",
        "Dependencies between tasks or characters",
      ],
      howToFind: "If items depend on other items and you must sequence them (or decide if that's even possible), model dependencies as directed edges and topologically sort.",
      redFlags: ["The graph is undirected (use union-find / DFS components)", "There is no dependency structure"],
    },
    idea: "Repeatedly take any node with no remaining prerequisites (in-degree 0), output it, and remove its outgoing edges — which may free up new nodes. If you can't output everything, a cycle exists.",
    viz: {
      type: "mermaid", caption: "Take a course only after its prerequisites. Start with in-degree 0 (course 0), which unlocks 1 and 2, then 3.",
      code: `graph LR
  c0((0)) --> c1((1))
  c0 --> c2((2))
  c1 --> c3((3))
  c2 --> c3`,
    },
    steps: [
      "Build the graph and compute each node's in-degree.",
      "Queue all in-degree-0 nodes.",
      "Pop one, append it to the order, and decrement its neighbors' in-degrees.",
      "Enqueue any neighbor that hits in-degree 0. If the order is short, there's a cycle.",
    ],
    template: `from collections import deque, defaultdict
indeg = [0] * n
g = defaultdict(list)
for a, b in edges:              # b must come before a
    g[b].append(a); indeg[a] += 1
q = deque(i for i in range(n) if indeg[i] == 0)
order = []
while q:
    c = q.popleft(); order.append(c)
    for nb in g[c]:
        indeg[nb] -= 1
        if indeg[nb] == 0:
            q.append(nb)
return order if len(order) == n else []   # [] means a cycle`,
    whenUse: ["Course schedules / build systems", "Dependency resolution (package managers)", "Alien dictionary letter order", "Detecting cycles in directed graphs"],
    whenAvoid: ["Undirected connectivity (union-find)", "Weighted shortest paths"],
    variations: [
      { name: "Kahn's (BFS)", note: "In-degree queue, iterative." },
      { name: "DFS post-order", note: "Reverse finish times; 3 colors detect cycles." },
    ],
    pitfalls: ["Edge direction (prereq → course)", "Not detecting cycles (order shorter than n)", "DFS variant needs visiting/visited states"],
    worked: {
      title: "Course Schedule II", problem: { set: "blind", id: "p77", label: "Solve it in the Playground" },
      trace: ["n=4, edges 1←0, 2←0, 3←1, 3←2", "in-degree 0 → start with 0", "0 frees 1 and 2; then 3", "order [0,1,2,3]"],
    },
    problems: [
      { set: "blind", id: "p19", title: "Course Schedule", difficulty: "Medium" },
      { set: "blind", id: "p77", title: "Course Schedule II", difficulty: "Medium" },
      { set: "blind", id: "p63", title: "Alien Dictionary", difficulty: "Hard" },
    ],
  },

  "tree-dfs": {
    name: "Tree DFS", color: "var(--c-interview)", complexity: "Time O(n) · Space O(h)",
    tagline: "Recurse into children and combine their results on the way back up.",
    explainer: { href: "lca.html", label: "🎬 Interactive: Lowest Common Ancestor, live" },
    recognize: {
      triggers: [
        "\"Height / depth / diameter\", \"is it valid / balanced / symmetric\"",
        "\"Path sum\", \"lowest common ancestor\"",
        "A node's answer depends on its subtrees",
      ],
      howToFind: "If the whole-tree answer is a fold of subtree answers (compute children, then combine) it's post-order DFS; if it's a constraint pushed down from the root, it's pre-order.",
      redFlags: ["You need level-by-level processing (BFS)", "The structure is a general graph with cycles (add visited)"],
    },
    idea: "Trust the recursion: assume the function already returns the correct answer for each subtree, then combine the left and right results at the current node. The call stack depth is the tree height.",
    viz: {
      type: "mermaid", caption: "Post-order: solve the subtrees of 2 (children 4 and 5), then combine at 2, then at the root 1.",
      code: `graph TD
  n1((1)) --> n2((2))
  n1 --> n3((3))
  n2 --> n4((4))
  n2 --> n5((5))`,
    },
    steps: [
      "Handle the base case (null → identity value like 0 or True).",
      "Recurse into the left and right children.",
      "Combine their results (and maybe update a global answer).",
      "Return the value the parent needs.",
    ],
    template: `def dfs(node):
    if not node:
        return 0                # base case
    left = dfs(node.left)
    right = dfs(node.right)
    update_global(left, right, node.val)   # e.g. diameter / path sum
    return 1 + max(left, right)            # value for the parent
dfs(root)`,
    whenUse: ["Height, depth, diameter, balance", "Validate BST (pass bounds down)", "Path sums, lowest common ancestor", "Subtree aggregates"],
    whenAvoid: ["Shortest path by number of edges (BFS)", "You need nodes grouped by level"],
    variations: [
      { name: "Post-order fold", note: "Combine child results (diameter, path sum)." },
      { name: "Pre-order constraint", note: "Push (low, high) bounds down (validate BST)." },
      { name: "Return + global", note: "Return one thing, track another globally." },
    ],
    pitfalls: ["Confusing 'return to parent' with 'global answer'", "Missing the null base case", "Very deep trees hitting recursion limits (rare in interviews)"],
    worked: {
      title: "Diameter of Binary Tree", problem: { set: "blind", id: "p16", label: "Solve it in the Playground" },
      trace: ["tree 1 / 2,3 / 4,5", "leaves return height 0", "node 2: left=1, right=1 → diameter 2", "answer 2 (edges 4→2→5)"],
    },
    problems: [
      { set: "blind", id: "p15", title: "Validate BST", difficulty: "Medium" },
      { set: "blind", id: "p16", title: "Diameter of Binary Tree", difficulty: "Easy" },
      { set: "blind", id: "p70", title: "Binary Tree Maximum Path Sum", difficulty: "Hard" },
      { set: "blind", id: "p38", title: "Maximum Depth of Binary Tree", difficulty: "Easy" },
    ],
  },

  "linked-list": {
    name: "Linked List Manipulation", color: "var(--c-storage)", complexity: "Time O(n) · Space O(1)",
    tagline: "Rewire next-pointers with a dummy head and careful pointer bookkeeping.",
    recognize: {
      triggers: [
        "\"Reverse\", \"merge\", \"reorder\", \"remove\" a linked list",
        "In-place pointer surgery with O(1) extra space",
        "Edge cases at the head",
      ],
      howToFind: "If the task is to restructure a linked list in place, reach for a dummy head plus a few pointers (prev, cur, next) and rewire carefully — saving <code>.next</code> before you overwrite it.",
      redFlags: ["You'd benefit from random access (copy to an array)", "The data isn't actually a linked structure"],
    },
    idea: "Use a <b>dummy head</b> so the real head needs no special case, and always stash <code>.next</code> before rewiring so you don't lose the rest of the list. Then it's just careful pointer moves.",
    viz: {
      type: "mermaid", caption: "A dummy node precedes the head; you build the result by pointing its next chain forward.",
      code: `graph LR
  d["dummy"] --> n1((1)) --> n2((2)) --> n3((3)) --> nil["None"]`,
    },
    steps: [
      "Create a <code>dummy</code> node pointing at the head.",
      "Keep pointers (<code>prev</code>, <code>cur</code>, <code>nxt</code>) as needed.",
      "Save <code>cur.next</code> before you overwrite it.",
      "Rewire, advance, and return <code>dummy.next</code>.",
    ],
    template: `dummy = cur = ListNode(0)
while l1 and l2:
    if l1.val < l2.val:
        cur.next, l1 = l1, l1.next
    else:
        cur.next, l2 = l2, l2.next
    cur = cur.next
cur.next = l1 or l2
return dummy.next`,
    whenUse: ["Reverse a list (or a sub-range)", "Merge sorted lists", "Reorder / partition / remove nodes", "Detect and remove cycles"],
    whenAvoid: ["Heavy random access (arrays are better)", "The list fits in memory and copying simplifies the logic"],
    variations: [
      { name: "Dummy head", note: "Uniform head handling for insert/delete." },
      { name: "Three-pointer reverse", note: "prev, cur, nxt flip pointers." },
      { name: "Runner technique", note: "Fast/slow for middle, nth-from-end." },
    ],
    pitfalls: ["Losing the rest of the list (save <code>.next</code> first)", "Not using a dummy → messy head handling", "Null-pointer dereferences"],
    worked: {
      title: "Merge Two Sorted Lists", problem: { set: "blind", id: "p9", label: "Solve it in the Playground" },
      trace: ["l1=1→3, l2=2→4", "pick 1, pick 2, pick 3, pick 4", "attach the remaining tail", "result 1→2→3→4"],
    },
    problems: [
      { set: "blind", id: "p9", title: "Merge Two Sorted Lists", difficulty: "Easy" },
      { set: "blind", id: "p10", title: "Remove Nth Node From End", difficulty: "Medium" },
      { set: "microsoft", id: "m1", title: "Reverse Linked List", difficulty: "Easy" },
    ],
  },

};

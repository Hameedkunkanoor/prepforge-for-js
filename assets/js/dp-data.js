/* =====================================================================
   DP DATA — a full Dynamic Programming curriculum: 9 modes, 26 worked
   problems. Rendered by dp.js (hub) and dp-mode.js (per-mode reader).

   Each mode: id, name, color, tagline, intuition, recognize[], approach[],
   viz{}, problems[]. Each problem carries the 4-part framework
   (state / transition / base / answer), complexity, code, walkthrough,
   a trace, and an optional Playground link.

   viz types: "array" (stepper), "grid" (matrix), "mermaid" (diagram).
   ===================================================================== */
window.DP_MODES = [

  {
    id: "linear", name: "Linear (1D) DP", color: "var(--c-interview)",
    tagline: "The answer at position i depends on a constant number of earlier positions — usually just i-1 and i-2.",
    intuition: "You scan left to right making one decision per element (take it, skip it, extend or restart). Because only the last one or two results matter, the whole thing often collapses to a couple of rolling variables.",
    recognize: ["\"number of ways\", \"max/min ending here\", \"can you reach\"", "A choice at each index where the future depends only on recent state", "Classic names: climb stairs, rob houses, max subarray, decode"],
    approach: [
      "Define <code>dp[i]</code> as the answer for the first i elements (or the best <i>ending at</i> i).",
      "Ask what choices exist at i — and which earlier dp values they use.",
      "Write the transition from <code>dp[i-1]</code>, <code>dp[i-2]</code>, …",
      "Set the base cases, then optionally collapse to O(1) rolling variables.",
    ],
    viz: {
      type: "array", caption: "Climbing Stairs — dp[i] = dp[i-1] + dp[i-2] (Fibonacci-shaped).",
      cells: ["1", "1", "2", "3", "5", "8"],
      frames: [
        { marks: { i: 2 }, note: "dp[2] = dp[1] + dp[0] = 2 (one 2-step, or two 1-steps)." },
        { marks: { i: 3 }, note: "dp[3] = dp[2] + dp[1] = 3." },
        { marks: { i: 5 }, note: "dp[5] = dp[4] + dp[3] = 8 → the answer." },
      ],
    },
    problems: [
      {
        title: "Climbing Stairs", difficulty: "Easy", link: { set: "blind", id: "p29" },
        statement: "You can climb 1 or 2 steps at a time. How many distinct ways are there to reach the top of n stairs?",
        hint: "Your final move was either a single step (from n-1) or a double step (from n-2).",
        state: "dp[i] = number of distinct ways to reach step i",
        transition: "dp[i] = dp[i-1] + dp[i-2]",
        base: "dp[0] = dp[1] = 1", answer: "dp[n]",
        time: "O(n)", space: "O(1)",
        code: `def climbStairs(n):
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
        walk: "Reaching step i, the last move came from i-1 (one step) or i-2 (two steps), so the counts add — exactly Fibonacci. Two rolling variables replace the array.",
        trace: ["n = 4", "(a,b): 1,1 → 1,2 → 2,3 → 3,5 → 5,8", "return a = 5"],
      },
      {
        title: "House Robber", difficulty: "Medium", link: { set: "blind", id: "p24" },
        statement: "Houses in a row each hold some money. You can't rob two adjacent houses. Maximize the total you can rob.",
        hint: "At each house: skip it (keep the best so far) or rob it (best that excluded the previous house).",
        state: "dp[i] = max money robbing among houses 0..i",
        transition: "dp[i] = max(dp[i-1], dp[i-2] + nums[i])",
        base: "dp[-1] = 0, dp[0] = nums[0]", answer: "dp[n-1]",
        time: "O(n)", space: "O(1)",
        code: `def rob(nums):
    prev, cur = 0, 0
    for n in nums:
        prev, cur = cur, max(cur, prev + n)
    return cur`,
        walk: "cur tracks the best up to the current house; prev is the best up to the house before it (so robbing now is legal). Each step shifts the window forward.",
        trace: ["nums=[2,7,9,3,1]", "cur: 2 → 7 → 11 → 11 → 12", "answer 12"],
      },
      {
        title: "Maximum Subarray (Kadane)", difficulty: "Medium",
        statement: "Find the contiguous subarray with the largest sum and return that sum.",
        hint: "At index i you either extend the previous subarray or start a brand-new one at i.",
        state: "dp[i] = max sum of a subarray ending exactly at i",
        transition: "dp[i] = max(nums[i], dp[i-1] + nums[i])",
        base: "dp[0] = nums[0]", answer: "max over all dp[i]",
        time: "O(n)", space: "O(1)",
        code: `def maxSubArray(nums):
    cur = best = nums[0]
    for n in nums[1:]:
        cur = max(n, cur + n)
        best = max(best, cur)
    return best`,
        walk: "If the running sum ever goes negative it can only hurt what follows, so we drop it and restart at the current element. The global best captures the answer even when it ends mid-array.",
        trace: ["nums=[-2,1,-3,4,-1,2,1,-5,4]", "cur: -2,1,-2,4,3,5,6,1,5", "best = 6 (subarray [4,-1,2,1])"],
      },
    ],
  },

  {
    id: "grid", name: "Grid (2D) DP", color: "var(--c-network)",
    tagline: "A table indexed by row and column — each cell is built from the cells that lead into it.",
    intuition: "Movement is usually right/down, so a cell's answer comes from the cell above and the cell to its left. Seed the first row and column, then sweep to the bottom-right corner.",
    recognize: ["Robot/paths on a grid, min-cost paths", "\"unique paths\", \"minimum path sum\", obstacles", "You reach a cell only from a fixed set of neighbors"],
    approach: [
      "Let <code>dp[r][c]</code> be the answer to reach or be at cell (r, c).",
      "Identify which neighbors flow into (r, c) — typically (r-1, c) and (r, c-1).",
      "Initialize the first row and column (the only-one-way edges).",
      "Fill row by row; the answer sits at the bottom-right.",
    ],
    viz: {
      type: "grid", caption: "Unique Paths (3×3) — each cell = paths from above + paths from the left. Bottom-right = 6.",
      cols: ["", "c0", "c1", "c2"],
      rows: [["r0", "1", "1", "1"], ["r1", "1", "2", "3"], ["r2", "1", "3", "6"]],
      hl: [2, 3],
    },
    problems: [
      {
        title: "Unique Paths", difficulty: "Medium", link: { set: "blind", id: "p28" },
        statement: "A robot at the top-left of an m×n grid can move only right or down. How many unique paths reach the bottom-right?",
        hint: "You enter each cell from above or from the left.",
        state: "dp[r][c] = number of paths to reach (r, c)",
        transition: "dp[r][c] = dp[r-1][c] + dp[r][c-1]",
        base: "first row and column = 1", answer: "dp[m-1][n-1]",
        time: "O(m·n)", space: "O(m·n)",
        code: `def uniquePaths(m, n):
    dp = [[1]*n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r-1][c] + dp[r][c-1]
    return dp[-1][-1]`,
        walk: "The only way along the top edge or left edge is a straight line (1 path). Every interior cell sums the two ways of arriving. It's Pascal's triangle in disguise.",
        trace: ["3×3 grid", "edges = 1; dp[1][1]=2; dp[1][2]=3", "dp[2][2] = 3 + 3 = 6"],
      },
      {
        title: "Minimum Path Sum", difficulty: "Medium",
        statement: "Given a grid of non-negative numbers, find a path from top-left to bottom-right (moving right/down) that minimizes the sum of values.",
        hint: "The cheapest way into a cell is the cheaper of the two entries plus this cell's cost.",
        state: "dp[r][c] = min cost to reach (r, c)",
        transition: "dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])",
        base: "dp[0][0] = grid[0][0]; edges accumulate", answer: "dp[m-1][n-1]",
        time: "O(m·n)", space: "O(m·n)",
        code: `def minPathSum(grid):
    m, n = len(grid), len(grid[0])
    dp = [[0]*n for _ in range(m)]
    dp[0][0] = grid[0][0]
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                continue
            up = dp[r-1][c] if r else float('inf')
            left = dp[r][c-1] if c else float('inf')
            dp[r][c] = grid[r][c] + min(up, left)
    return dp[-1][-1]`,
        walk: "Same shape as Unique Paths, but instead of adding path counts we take the cheaper predecessor and add the current cell. Using infinity for missing edges keeps the min clean.",
        trace: ["grid=[[1,3,1],[1,5,1],[4,2,1]]", "best path 1→3→1→1→1", "answer 7"],
      },
      {
        title: "Unique Paths II (obstacles)", difficulty: "Medium",
        statement: "Same as Unique Paths, but some cells contain obstacles (1) you can't enter. Count the paths.",
        hint: "An obstacle cell contributes 0 paths; everything else is the usual sum.",
        state: "dp[r][c] = paths to (r, c) avoiding obstacles",
        transition: "dp[r][c] = dp[r-1][c] + dp[r][c-1] (0 if the cell is an obstacle)",
        base: "dp[0][0] = 1 if start is free else 0", answer: "dp[m-1][n-1]",
        time: "O(m·n)", space: "O(m·n)",
        code: `def uniquePathsWithObstacles(grid):
    m, n = len(grid), len(grid[0])
    dp = [[0]*n for _ in range(m)]
    dp[0][0] = 1 - grid[0][0]
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 1:
                dp[r][c] = 0
            elif r or c:
                dp[r][c] = (dp[r-1][c] if r else 0) + (dp[r][c-1] if c else 0)
    return dp[-1][-1]`,
        walk: "The recurrence is identical; obstacles just force a cell to 0, which naturally blocks every path that would have gone through it.",
        trace: ["3×3 with an obstacle in the center", "center → 0 paths", "remaining paths counted at the corner"],
      },
    ],
  },

  {
    id: "knapsack01", name: "0/1 Knapsack", color: "var(--c-storage)",
    tagline: "Each item is used at most once. State runs over items and a capacity/target axis.",
    intuition: "For every item you make a binary choice: take it or leave it. Compressed to a 1D array over capacity, you must iterate capacity <b>backward</b> so an item can't be reused within the same pass.",
    recognize: ["Subset that hits a target sum / can be split evenly", "\"can we pick items to reach exactly W\"", "Each element chosen once, bounded capacity"],
    approach: [
      "Let <code>dp[w]</code> answer the sub-question for capacity/target w.",
      "For each item, decide skip vs. take: <code>dp[w] = best(dp[w], dp[w - weight] + value)</code>.",
      "Iterate w from high to low so each item is counted at most once.",
      "Read the answer at the full capacity (or the target).",
    ],
    viz: {
      type: "grid", caption: "0/1 Knapsack (capacity 5, items (w,v) = (1,1),(3,4),(4,5)). Bottom-right = best value 6.",
      cols: ["item \\ cap", "0", "1", "2", "3", "4", "5"],
      rows: [
        ["∅", "0", "0", "0", "0", "0", "0"],
        ["(1,1)", "0", "1", "1", "1", "1", "1"],
        ["(3,4)", "0", "1", "1", "4", "5", "5"],
        ["(4,5)", "0", "1", "1", "4", "5", "6"],
      ],
      hl: [3, 6],
    },
    problems: [
      {
        title: "0/1 Knapsack (max value)", difficulty: "Medium",
        statement: "Given item weights and values and a capacity W, choose items (each at most once) to maximize total value without exceeding W.",
        hint: "For each item, either skip it or take it (if it fits) and add its value to the best of the remaining capacity.",
        state: "dp[w] = best value achievable with capacity w",
        transition: "dp[w] = max(dp[w], dp[w - wt] + val)",
        base: "dp[0..W] = 0", answer: "dp[W]",
        time: "O(n·W)", space: "O(W)",
        code: `def knapsack(weights, values, W):
    dp = [0] * (W + 1)
    for wt, val in zip(weights, values):
        for w in range(W, wt - 1, -1):   # backward!
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[W]`,
        walk: "The backward capacity loop is the whole trick: it guarantees <code>dp[w - wt]</code> still refers to a state <i>without</i> the current item, so each item is used at most once.",
        trace: ["W=5, items (1,1),(3,4),(4,5)", "take (1,1)+(4,5) → value 6", "dp[5] = 6"],
      },
      {
        title: "Partition Equal Subset Sum", difficulty: "Medium",
        statement: "Can the array be partitioned into two subsets with equal sum?",
        hint: "That's possible iff some subset sums to total/2 — a 0/1 knapsack over a boolean target.",
        state: "dp[s] = can some subset reach sum s?",
        transition: "dp[s] = dp[s] or dp[s - num]",
        base: "dp[0] = True", answer: "dp[total // 2]",
        time: "O(n·sum)", space: "O(sum)",
        code: `def canPartition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for s in range(target, num - 1, -1):
            dp[s] = dp[s] or dp[s - num]
    return dp[target]`,
        walk: "If the total is odd it's impossible. Otherwise we ask a subset-sum question: can we build exactly total/2? The boolean array marks every reachable sum.",
        trace: ["nums=[1,5,11,5], total=22, target=11", "{11} or {1,5,5} reach 11 → dp[11]=True", "answer True"],
      },
      {
        title: "Target Sum", difficulty: "Medium",
        statement: "Assign + or − to each number so the expression equals a target. Count the number of ways.",
        hint: "If P is the set assigned +, then P − N = target and P + N = sum, so P = (sum + target) / 2. Count subsets summing to P.",
        state: "dp[s] = number of subsets summing to s",
        transition: "dp[s] += dp[s - num]",
        base: "dp[0] = 1", answer: "dp[P] where P = (sum + target) / 2",
        time: "O(n·sum)", space: "O(sum)",
        code: `def findTargetSumWays(nums, target):
    total = sum(nums)
    if (total + target) % 2 or abs(target) > total:
        return 0
    P = (total + target) // 2
    dp = [0] * (P + 1)
    dp[0] = 1
    for num in nums:
        for s in range(P, num - 1, -1):
            dp[s] += dp[s - num]
    return dp[P]`,
        walk: "A clever reduction turns signs into a subset-count problem. Counting (rather than boolean) means we <i>add</i> the ways instead of OR-ing, still backward for 0/1 semantics.",
        trace: ["nums=[1,1,1,1,1], target=3 → P=4", "count subsets summing to 4", "answer 5"],
      },
    ],
  },

  {
    id: "unbounded", name: "Unbounded Knapsack", color: "var(--c-storage)",
    tagline: "Items can be reused any number of times — iterate capacity forward.",
    intuition: "Same table as 0/1, but because items are reusable you sweep capacity <b>forward</b>, letting <code>dp[w - item]</code> already include the current item. Loop order decides combinations vs. permutations.",
    recognize: ["Coins/lengths/items reusable without limit", "\"fewest coins\", \"number of ways to make amount\"", "Combine dp[amount - item] repeatedly"],
    approach: [
      "Let <code>dp[a]</code> answer the sub-question for amount/size a.",
      "Combine over each item: <code>dp[a] (op) dp[a - item]</code>, sweeping a <b>forward</b>.",
      "Coins-outer / amount-inner counts <i>combinations</i>; amount-outer counts <i>permutations</i>.",
      "Read the answer at the full amount.",
    ],
    viz: {
      type: "array", caption: "Coin Change count (coins 1,2,5) — dp[a] = number of combinations making amount a.",
      cells: ["1", "1", "2", "2", "3", "4"],
      frames: [
        { marks: { a: 0 }, note: "dp[0] = 1 — one way to make nothing (use no coins)." },
        { marks: { a: 1 }, note: "amount 1: {1} → dp[1] = 1." },
        { marks: { a: 2 }, note: "amount 2: {1,1} and {2} → dp[2] = 2." },
        { marks: { a: 4 }, note: "amount 4: {1×4}, {2,2}, {2,1,1} → dp[4] = 3." },
        { marks: { a: 5 }, note: "amount 5: {5}, {2,2,1}, {2,1,1,1}, {1×5} → dp[5] = 4." },
      ],
    },
    problems: [
      {
        title: "Coin Change (fewest coins)", difficulty: "Medium", link: { set: "blind", id: "p23" },
        statement: "Given coin denominations and an amount, return the fewest coins needed to make it, or -1 if impossible.",
        hint: "dp[a] is the best over using one coin c plus the optimal for a − c.",
        state: "dp[a] = fewest coins to make amount a",
        transition: "dp[a] = min(dp[a], dp[a - c] + 1)",
        base: "dp[0] = 0, rest = ∞", answer: "dp[amount] or -1",
        time: "O(amount·coins)", space: "O(amount)",
        code: `def coinChange(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != amount + 1 else -1`,
        walk: "Initializing to amount+1 acts as infinity. If dp[amount] never improves, the amount is unreachable. Greedy fails for arbitrary coin sets — that's why we need DP.",
        trace: ["coins=[1,2,5], amount=11", "11 = 5 + 5 + 1", "dp[11] = 3"],
      },
      {
        title: "Coin Change II (count combinations)", difficulty: "Medium",
        statement: "Count the number of combinations of coins that make up the amount. Order does not matter.",
        hint: "Put coins in the OUTER loop so {1,2} and {2,1} are counted once.",
        state: "dp[a] = number of combinations making amount a",
        transition: "dp[a] += dp[a - c]",
        base: "dp[0] = 1", answer: "dp[amount]",
        time: "O(amount·coins)", space: "O(amount)",
        code: `def change(amount, coins):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for c in coins:                 # coins OUTER
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]`,
        walk: "By fixing coin order (each coin's whole loop finishes before the next), we never revisit a coin in a different position — so permutations of the same multiset collapse into one combination.",
        trace: ["amount=5, coins=[1,2,5]", "{5}, {2,2,1}, {2,1,1,1}, {1×5}", "answer 4"],
      },
      {
        title: "Combination Sum IV (count permutations)", difficulty: "Medium",
        statement: "Count the number of ordered sequences (permutations allowed) of numbers that sum to the target.",
        hint: "Put the amount in the OUTER loop so different orders count separately.",
        state: "dp[a] = number of ordered ways to sum to a",
        transition: "dp[a] += dp[a - num]",
        base: "dp[0] = 1", answer: "dp[target]",
        time: "O(target·nums)", space: "O(target)",
        code: `def combinationSum4(nums, target):
    dp = [0] * (target + 1)
    dp[0] = 1
    for a in range(1, target + 1):   # amount OUTER
        for num in nums:
            if num <= a:
                dp[a] += dp[a - num]
    return dp[target]`,
        walk: "Swapping the loop order is the <i>only</i> change from Coin Change II — and it flips the meaning from combinations to permutations. Understanding this pair cements loop-order intuition.",
        trace: ["nums=[1,2,3], target=4", "(1,3) and (3,1) both counted", "answer 7"],
      },
    ],
  },

  {
    id: "string", name: "Two-Sequence / String DP", color: "var(--c-compute)",
    tagline: "A grid over the prefixes of two strings; match carries the diagonal, mismatch combines neighbors.",
    intuition: "State is a pair of prefixes A[:i] and B[:j]. If the current characters match, extend the diagonal result; otherwise take the best of dropping a character from either side.",
    recognize: ["Compare / transform two strings", "\"common subsequence\", \"edit distance\", \"matching\"", "Answer defined over prefixes of both inputs"],
    approach: [
      "Let <code>dp[i][j]</code> be the answer for A[:i] and B[:j].",
      "Seed the first row/column (one string empty).",
      "On a match, use the diagonal <code>dp[i-1][j-1]</code>; on a mismatch, combine <code>dp[i-1][j]</code> / <code>dp[i][j-1]</code>.",
      "Return the bottom-right cell.",
    ],
    viz: {
      type: "grid", caption: "Longest Common Subsequence of \"abcde\" and \"ace\". Matches on a, c, e → length 3.",
      cols: ["", "∅", "a", "c", "e"],
      rows: [
        ["∅", "0", "0", "0", "0"],
        ["a", "0", "1", "1", "1"],
        ["b", "0", "1", "1", "1"],
        ["c", "0", "1", "2", "2"],
        ["d", "0", "1", "2", "2"],
        ["e", "0", "1", "2", "3"],
      ],
      hl: [5, 4],
    },
    problems: [
      {
        title: "Longest Common Subsequence", difficulty: "Medium",
        statement: "Given two strings, return the length of their longest common subsequence (characters in order, not necessarily contiguous).",
        hint: "If the last characters match, add 1 to the LCS of both shorter prefixes; else drop one character from one side.",
        state: "dp[i][j] = LCS length of A[:i] and B[:j]",
        transition: "match: dp[i-1][j-1] + 1 · else: max(dp[i-1][j], dp[i][j-1])",
        base: "empty prefixes = 0", answer: "dp[m][n]",
        time: "O(m·n)", space: "O(m·n)",
        code: `def longestCommonSubsequence(a, b):
    m, n = len(a), len(b)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]`,
        walk: "A match lets both prefixes shrink together (diagonal). A mismatch means at least one of the two current characters isn't in the LCS, so we drop whichever gives the better result.",
        trace: ["a='abcde', b='ace'", "matches a, c, e", "answer 3"],
      },
      {
        title: "Edit Distance", difficulty: "Hard", link: { set: "blind", id: "p65" },
        statement: "Minimum number of insertions, deletions, or replacements to turn word A into word B.",
        hint: "Matching characters cost nothing; otherwise 1 + best of delete / insert / replace.",
        state: "dp[i][j] = edits to convert A[:i] into B[:j]",
        transition: "match: dp[i-1][j-1] · else: 1 + min(up, left, diagonal)",
        base: "dp[i][0] = i, dp[0][j] = j", answer: "dp[m][n]",
        time: "O(m·n)", space: "O(m·n)",
        code: `def minDistance(a, b):
    m, n = len(a), len(b)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1): dp[i][0] = i
    for j in range(n+1): dp[0][j] = j
    for i in range(1, m+1):
        for j in range(1, n+1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[m][n]`,
        walk: "The three neighbors correspond to the three operations: up = delete from A, left = insert into A, diagonal = replace. Turning a prefix into the empty string costs its length (the base row/column).",
        trace: ["a='horse', b='ros'", "horse → rorse → rose → ros", "answer 3"],
      },
      {
        title: "Distinct Subsequences", difficulty: "Hard",
        statement: "Count how many distinct subsequences of s equal t.",
        hint: "You can always skip s[i]; if it matches t[j] you may also use it.",
        state: "dp[i][j] = ways to form t[:j] from s[:i]",
        transition: "dp[i][j] = dp[i-1][j] + (dp[i-1][j-1] if s[i-1]==t[j-1])",
        base: "dp[i][0] = 1 (empty t)", answer: "dp[m][n]",
        time: "O(m·n)", space: "O(m·n)",
        code: `def numDistinct(s, t):
    m, n = len(s), len(t)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1):
        dp[i][0] = 1
    for i in range(1, m+1):
        for j in range(1, n+1):
            dp[i][j] = dp[i-1][j]
            if s[i-1] == t[j-1]:
                dp[i][j] += dp[i-1][j-1]
    return dp[m][n]`,
        walk: "Every position of s can be skipped (carry dp[i-1][j]). When characters match, we <i>also</i> count the subsequences that consume both characters (dp[i-1][j-1]). The empty target has exactly one subsequence.",
        trace: ["s='rabbbit', t='rabbit'", "3 ways to pick the 'b's", "answer 3"],
      },
    ],
  },

  {
    id: "lis", name: "Subsequence / LIS", color: "var(--c-compute)",
    tagline: "Track the best subsequence ending at each index — O(n²), or O(n log n) with patience sorting.",
    intuition: "For each element, look back at everything smaller before it and extend the best chain. A slicker version keeps a sorted list of the smallest possible tails, binary-searching each new value.",
    recognize: ["\"longest increasing/decreasing subsequence\"", "Chains/nesting (envelopes), arithmetic sequences", "Best answer ending at i built from earlier j"],
    approach: [
      "Let <code>dp[i]</code> be the best subsequence ending at i.",
      "Extend from a valid earlier index j (nums[j] < nums[i]).",
      "Take the max over all j (O(n²)), or keep a tails array + binary search (O(n log n)).",
      "The answer is the max over all dp[i] (or the tails length).",
    ],
    viz: {
      type: "array", caption: "Longest Increasing Subsequence — dp[i] = longest increasing run ending at i.",
      cells: ["10", "9", "2", "5", "3", "7", "101", "18"],
      frames: [
        { marks: { i: 3 }, note: "5 > 2 → dp[3] = dp[2] + 1 = 2." },
        { marks: { i: 5 }, note: "7 > 2,5,3 → dp[5] = 3 (e.g. 2,5,7)." },
        { marks: { i: 6 }, note: "101 > everything → dp[6] = 4 → the answer." },
      ],
    },
    problems: [
      {
        title: "Longest Increasing Subsequence", difficulty: "Medium",
        statement: "Return the length of the longest strictly increasing subsequence.",
        hint: "Keep the smallest possible tail for every achievable length; binary-search where each number fits.",
        state: "tails[k] = smallest tail of an increasing subsequence of length k+1",
        transition: "replace the first tail ≥ x, or append if x is largest",
        base: "tails = []", answer: "len(tails)",
        time: "O(n log n)", space: "O(n)",
        code: `import bisect
def lengthOfLIS(nums):
    tails = []
    for x in nums:
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)`,
        walk: "tails is always sorted. Replacing the first element ≥ x keeps future options as small as possible without changing the achievable lengths; appending happens only when x extends the longest chain. The length of tails is the LIS length (though tails itself isn't a valid subsequence).",
        trace: ["nums=[10,9,2,5,3,7,101,18]", "tails → [2,3,7,18]", "answer 4"],
      },
      {
        title: "Number of Longest Increasing Subsequences", difficulty: "Medium",
        statement: "Count how many longest strictly increasing subsequences the array has.",
        hint: "Track both the length ending at i and how many ways achieve that length.",
        state: "length[i], count[i] for chains ending at i",
        transition: "extend from j<i with nums[j]<nums[i], updating length and count",
        base: "length=count=1", answer: "sum of count[i] where length[i] is max",
        time: "O(n²)", space: "O(n)",
        code: `def findNumberOfLIS(nums):
    n = len(nums)
    length = [1]*n
    count = [1]*n
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                if length[j] + 1 > length[i]:
                    length[i] = length[j] + 1
                    count[i] = count[j]
                elif length[j] + 1 == length[i]:
                    count[i] += count[j]
    longest = max(length)
    return sum(c for l, c in zip(length, count) if l == longest)`,
        walk: "When a longer chain is found we reset the count to that predecessor's count; when an equally long chain is found we add its count. Summing counts over all maximal-length endings gives the total.",
        trace: ["nums=[1,3,5,4,7]", "1,3,5,7 and 1,3,4,7", "answer 2"],
      },
      {
        title: "Longest Arithmetic Subsequence", difficulty: "Medium",
        statement: "Return the length of the longest subsequence with a constant common difference.",
        hint: "State needs the difference too — a map per index keyed by difference.",
        state: "dp[i][d] = length of arithmetic subseq ending at i with difference d",
        transition: "dp[i][d] = dp[j][d] + 1 for j < i, d = nums[i]-nums[j]",
        base: "each pair starts a length-2 chain", answer: "max over all dp[i][d]",
        time: "O(n²)", space: "O(n²)",
        code: `def longestArithSeqLength(nums):
    dp = [{} for _ in nums]
    best = 0
    for i in range(len(nums)):
        for j in range(i):
            d = nums[i] - nums[j]
            dp[i][d] = dp[j].get(d, 1) + 1
            best = max(best, dp[i][d])
    return best`,
        walk: "Because the difference is part of the state, we store a dictionary at each index. Extending a chain of difference d ending at j gives one of difference d ending at i.",
        trace: ["nums=[3,6,9,12]", "difference 3 → chain of length 4", "answer 4"],
      },
    ],
  },

  {
    id: "interval", name: "Interval DP", color: "var(--c-interview)",
    tagline: "Solve small ranges first, then combine over a split or a last-action point. Loop by increasing length.",
    intuition: "The answer for a range [i..j] depends on splitting it at some k inside — and both halves are shorter ranges you've already solved. That forces a length-first loop order.",
    recognize: ["Choose an order of operations on a sequence", "\"burst balloons\", \"cut the stick\", \"matrix chain\", palindromes", "dp[i][j] combining dp[i][k] and dp[k][j]"],
    approach: [
      "Let <code>dp[i][j]</code> be the best over the sub-range [i..j].",
      "Choose the split / last-action point k inside (i, j).",
      "Combine the two sub-ranges plus the cost/gain of k.",
      "Iterate by increasing length so shorter ranges are ready first.",
    ],
    viz: {
      type: "mermaid", caption: "Interval DP: split [i..j] at each k, solve both halves, then combine. Grow ranges by length.",
      code: `graph TD
  ij["dp[i..j]"] --> ik["dp[i..k]"]
  ij --> kj["dp[k..j]"]
  ik --> comb["combine at k"]
  kj --> comb`,
    },
    problems: [
      {
        title: "Burst Balloons", difficulty: "Hard", link: { set: "blind", id: "p66" },
        statement: "Bursting balloon k earns nums[left]·nums[k]·nums[right] (its current neighbors). Maximize total coins.",
        hint: "Instead of which balloon to burst first, decide which balloon is burst LAST in a range — then its neighbors are the fixed boundaries.",
        state: "dp[l][r] = max coins bursting all balloons strictly inside (l, r)",
        transition: "dp[l][r] = max over k of nums[l]·nums[k]·nums[r] + dp[l][k] + dp[k][r]",
        base: "dp with adjacent boundaries = 0", answer: "dp[0][n-1] (padded)",
        time: "O(n³)", space: "O(n²)",
        code: `def maxCoins(nums):
    nums = [1] + nums + [1]
    n = len(nums)
    dp = [[0]*n for _ in range(n)]
    for length in range(2, n):
        for l in range(n - length):
            r = l + length
            for k in range(l + 1, r):
                dp[l][r] = max(dp[l][r],
                    nums[l]*nums[k]*nums[r] + dp[l][k] + dp[k][r])
    return dp[0][n - 1]`,
        walk: "Thinking forward is messy because bursting changes neighbors. Choosing the <i>last</i> balloon k in a range fixes its neighbors as the padded boundaries l and r, splitting the range into two independent subproblems.",
        trace: ["nums=[3,1,5,8] → padded [1,3,1,5,8,1]", "DP over increasing lengths", "answer 167"],
      },
      {
        title: "Minimum Cost to Cut a Stick", difficulty: "Hard", link: { set: "blind", id: "p71" },
        statement: "A stick of length n has given cut positions. Each cut costs the length of the piece being cut. Minimize the total cost.",
        hint: "The cost of a cut is the current segment length; choose which cut to make FIRST in a segment.",
        state: "dp[i][j] = min cost to make all cuts between boundary cuts i and j",
        transition: "dp[i][j] = min over k of (cuts[j]-cuts[i]) + dp[i][k] + dp[k][j]",
        base: "adjacent boundaries = 0", answer: "dp[0][m-1]",
        time: "O(m³)", space: "O(m²)",
        code: `def minCost(n, cuts):
    cuts = [0] + sorted(cuts) + [n]
    m = len(cuts)
    dp = [[0]*m for _ in range(m)]
    for length in range(2, m):
        for i in range(m - length):
            j = i + length
            dp[i][j] = min(cuts[j] - cuts[i] + dp[i][k] + dp[k][j]
                           for k in range(i + 1, j))
    return dp[0][m - 1]`,
        walk: "Padding with 0 and n turns the cut positions into interval boundaries. The first cut in a segment costs the whole segment length and splits it into two independent segments.",
        trace: ["n=7, cuts=[1,3,4,5]", "DP over intervals of increasing length", "answer 16"],
      },
      {
        title: "Longest Palindromic Subsequence", difficulty: "Medium",
        statement: "Return the length of the longest subsequence of s that is a palindrome.",
        hint: "If the ends match, they wrap a smaller palindrome; otherwise drop one end.",
        state: "dp[i][j] = LPS length within s[i..j]",
        transition: "match ends: dp[i+1][j-1] + 2 · else: max(dp[i+1][j], dp[i][j-1])",
        base: "dp[i][i] = 1", answer: "dp[0][n-1]",
        time: "O(n²)", space: "O(n²)",
        code: `def longestPalindromeSubseq(s):
    n = len(s)
    dp = [[0]*n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i+1][j-1] + 2
            else:
                dp[i][j] = max(dp[i+1][j], dp[i][j-1])
    return dp[0][n - 1]`,
        walk: "This is interval DP on a single string. Matching outer characters add 2 around the best inner palindrome; otherwise we discard whichever end helps less. Iterating i downward keeps inner ranges ready.",
        trace: ["s='bbbab'", "'bbbb' is a palindromic subsequence", "answer 4"],
      },
    ],
  },

  {
    id: "stocks", name: "State-Machine DP (Stocks)", color: "var(--c-network)",
    tagline: "Model a few states (holding, not holding, cooldown) and how each day transitions between them.",
    intuition: "When the problem has a small set of situations you can be in, give each a variable and write how today's value derives from yesterday's. The answer is the best 'not holding' state at the end.",
    recognize: ["Buy/sell with rules (cooldown, fee, k transactions)", "You're always in one of a few discrete states", "Transitions depend on the previous day's states"],
    approach: [
      "Enumerate the states (e.g. <code>hold</code>, <code>free</code>, <code>cooldown</code>).",
      "Write each state's new value from yesterday's states.",
      "Update them together for each day.",
      "Return the best non-holding state.",
    ],
    viz: {
      type: "mermaid", caption: "Stock state machine: move between 'not holding' and 'holding' each day (cooldown/fee variants add a state).",
      code: `graph LR
  free["not holding"] -->|buy| hold["holding"]
  hold -->|sell| free
  hold -->|hold| hold
  free -->|rest| free`,
    },
    problems: [
      {
        title: "Best Time to Buy and Sell Stock", difficulty: "Easy", link: { set: "microsoft", id: "m13" },
        statement: "Buy on one day and sell on a later day at most once. Maximize the profit.",
        hint: "Track the lowest price seen so far; the best profit is today's price minus that minimum.",
        state: "min_price so far, best profit so far",
        transition: "profit = max(profit, price − min_price)",
        base: "min_price = ∞, profit = 0", answer: "profit",
        time: "O(n)", space: "O(1)",
        code: `def maxProfit(prices):
    min_price = float('inf')
    profit = 0
    for p in prices:
        min_price = min(min_price, p)
        profit = max(profit, p - min_price)
    return profit`,
        walk: "The single-transaction case reduces to \"biggest jump after the running minimum.\" It's the base case of the whole stock family.",
        trace: ["prices=[7,1,5,3,6,4]", "buy at 1, sell at 6", "answer 5"],
      },
      {
        title: "Buy and Sell Stock with Cooldown", difficulty: "Medium",
        statement: "Unlimited transactions, but after you sell you must rest one day before buying again.",
        hint: "Three states: holding, just-sold, and resting.",
        state: "hold, sold, rest",
        transition: "sold = hold + p · hold = max(hold, rest − p) · rest = max(rest, prev_sold)",
        base: "hold = −∞, sold = rest = 0", answer: "max(sold, rest)",
        time: "O(n)", space: "O(1)",
        code: `def maxProfit(prices):
    hold, sold, rest = float('-inf'), 0, 0
    for p in prices:
        prev_sold = sold
        sold = hold + p             # sell today
        hold = max(hold, rest - p)  # keep holding, or buy from rest
        rest = max(rest, prev_sold) # cooldown after selling
    return max(sold, rest)`,
        walk: "The cooldown is captured by only allowing a buy from the <code>rest</code> state, and <code>rest</code> can only follow a <code>sold</code> day — so you can't buy the day after selling.",
        trace: ["prices=[1,2,3,0,2]", "buy,sell,cooldown,buy,sell", "answer 3"],
      },
      {
        title: "Buy and Sell Stock with Transaction Fee", difficulty: "Medium",
        statement: "Unlimited transactions, but each sale costs a fixed fee. Maximize profit.",
        hint: "Two states: cash (not holding) and hold (holding).",
        state: "cash, hold",
        transition: "cash = max(cash, hold + p − fee) · hold = max(hold, cash − p)",
        base: "cash = 0, hold = −∞", answer: "cash",
        time: "O(n)", space: "O(1)",
        code: `def maxProfit(prices, fee):
    cash, hold = 0, float('-inf')
    for p in prices:
        cash = max(cash, hold + p - fee)
        hold = max(hold, cash - p)
    return cash`,
        walk: "cash is your best balance while not holding; hold is your best balance while holding a share. Selling pays the fee once. Ending on cash guarantees no unsold share.",
        trace: ["prices=[1,3,2,8,4,9], fee=2", "buy 1 sell 8 (−2), buy 4 sell 9 (−2)", "answer 8"],
      },
    ],
  },

  {
    id: "tree", name: "Tree DP", color: "var(--c-interview)",
    tagline: "A DFS returns a small tuple of states per subtree; parents combine their children's results.",
    intuition: "Instead of an array, the 'positions' are tree nodes. Post-order DFS computes each subtree's states, then the parent folds them together — often returning one value upward while tracking a global best.",
    recognize: ["\"rob the tree\", subtree constraints", "A node's answer depends on choices in its children", "Return multiple states (include/exclude) per node"],
    approach: [
      "Decide the states each subtree must report (e.g. <code>(rob, skip)</code>).",
      "Recurse into children first (post-order).",
      "Combine children's states at the current node.",
      "Return the node's states; read the answer at the root (or a global).",
    ],
    viz: {
      type: "mermaid", caption: "Tree DP: DFS returns (rob, skip) for each subtree; the parent combines them.",
      code: `graph TD
  a((3)) --> b((2))
  a --> c((3))
  b --> d((3))
  c --> e((1))`,
    },
    problems: [
      {
        title: "House Robber III", difficulty: "Medium",
        statement: "Houses form a binary tree. You can't rob a node and its direct child on the same night. Maximize the loot.",
        hint: "Each subtree reports two numbers: best if you rob its root, best if you don't.",
        state: "dfs(node) = (rob_this, skip_this)",
        transition: "rob = val + skipLeft + skipRight · skip = max(left) + max(right)",
        base: "None → (0, 0)", answer: "max(dfs(root))",
        time: "O(n)", space: "O(h)",
        code: `def rob(root):
    def dfs(node):
        if not node:
            return (0, 0)
        l = dfs(node.left)
        r = dfs(node.right)
        rob = node.val + l[1] + r[1]   # rob node → skip children
        skip = max(l) + max(r)         # skip node → best of children
        return (rob, skip)
    return max(dfs(root))`,
        walk: "Returning both options avoids recomputation: if you rob a node you must use its children's 'skip' values; if you skip it, each child is free to do whatever's best. The root's max of the two is the answer.",
        trace: ["rob a node → must skip its children", "skip a node → take each child's best", "combine bottom-up → max at root"],
      },
      {
        title: "Binary Tree Maximum Path Sum", difficulty: "Hard", link: { set: "blind", id: "p70" },
        statement: "Find the maximum sum of any path (it may start and end at any nodes, not necessarily through the root).",
        hint: "Each node returns its best downward gain; the best path 'through' it is node + left gain + right gain.",
        state: "dfs(node) = best gain of a downward path starting at node",
        transition: "gain = node.val + max(leftGain, rightGain) · update global with node + left + right",
        base: "None → 0; clamp negative gains to 0", answer: "global best",
        time: "O(n)", space: "O(h)",
        code: `def maxPathSum(root):
    best = float('-inf')
    def dfs(node):
        nonlocal best
        if not node:
            return 0
        l = max(dfs(node.left), 0)
        r = max(dfs(node.right), 0)
        best = max(best, node.val + l + r)   # path bending at node
        return node.val + max(l, r)          # extend one side upward
    dfs(root)
    return best`,
        walk: "A negative subtree only hurts, so we clamp gains to 0. The best path through a node uses both sides, but a node can only pass ONE side up to its parent — that split is the crux.",
        trace: ["negative gains clamped to 0", "best path bends through some node", "answer = global maximum"],
      },
    ],
  },

];

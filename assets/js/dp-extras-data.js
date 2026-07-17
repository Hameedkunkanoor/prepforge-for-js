/* =====================================================================
   DP EXTRAS — alternative formulations (top-down memoization, space
   optimization, or an O(n²) variant) for representative problems, keyed
   by the global DP problem number (1-26). Rendered by dp-mode.js under
   the main solution as "Other ways to write it".
   ===================================================================== */
window.DP_EXTRAS = {
  1: [{
    label: "Top-down (memoization)",
    note: "The same recurrence as a cached recursion — often the easiest way to <i>start</i>: write the natural recursion, then add @lru_cache.",
    code: `from functools import lru_cache
def climbStairs(n):
    @lru_cache(None)
    def ways(i):
        if i <= 1:
            return 1
        return ways(i - 1) + ways(i - 2)
    return ways(n)`,
  }],
  4: [
    {
      label: "Top-down (memoization)",
      note: "Recurse from the target cell back toward the origin; @lru_cache stores each (r, c) once.",
      code: `from functools import lru_cache
def uniquePaths(m, n):
    @lru_cache(None)
    def paths(r, c):
        if r == 0 or c == 0:
            return 1
        return paths(r - 1, c) + paths(r, c - 1)
    return paths(m - 1, n - 1)`,
    },
    {
      label: "Space-optimized · O(n)",
      note: "You only ever read the row above, so keep a single rolling row instead of the full grid.",
      code: `def uniquePaths(m, n):
    row = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            row[c] += row[c - 1]   # row[c] (above) + row[c-1] (left)
    return row[-1]`,
    },
  ],
  7: [{
    label: "Top-down (memoization)",
    note: "State = (item index, remaining capacity). Each item is a take/skip branch; the cache collapses the exponential recursion.",
    code: `from functools import lru_cache
def knapsack(weights, values, W):
    @lru_cache(None)
    def best(i, cap):
        if i == len(weights):
            return 0
        skip = best(i + 1, cap)
        take = 0
        if weights[i] <= cap:
            take = values[i] + best(i + 1, cap - weights[i])
        return max(skip, take)
    return best(0, W)`,
  }],
  10: [{
    label: "Top-down (memoization)",
    note: "Ask \"fewest coins for amount a\" recursively; ∞ marks unreachable amounts.",
    code: `from functools import lru_cache
def coinChange(coins, amount):
    @lru_cache(None)
    def fewest(a):
        if a == 0:
            return 0
        if a < 0:
            return float('inf')
        return min((fewest(a - c) + 1 for c in coins), default=float('inf'))
    res = fewest(amount)
    return res if res != float('inf') else -1`,
  }],
  13: [{
    label: "Space-optimized · O(n)",
    note: "Each cell needs only the previous row and the current row so far — keep two 1D arrays.",
    code: `def longestCommonSubsequence(a, b):
    prev = [0] * (len(b) + 1)
    for i in range(1, len(a) + 1):
        cur = [0] * (len(b) + 1)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1] + 1
            else:
                cur[j] = max(prev[j], cur[j - 1])
        prev = cur
    return prev[-1]`,
  }],
  14: [{
    label: "Space-optimized · O(n)",
    note: "Only the previous row is needed; seed each new row's first cell with the deletion cost i.",
    code: `def minDistance(a, b):
    n = len(b)
    prev = list(range(n + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * n
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[-1]`,
  }],
  16: [{
    label: "Alternative · O(n²) DP",
    note: "The classic dp[i] = longest chain ending at i. Slower than patience sorting, but the state is more intuitive if you're deriving it fresh.",
    code: `def lengthOfLIS(nums):
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
  }],
  19: [{
    label: "Top-down (memoization)",
    note: "dp(l, r) = best coins from the open interval (l, r); pick the last balloon k and cache each range.",
    code: `from functools import lru_cache
def maxCoins(nums):
    nums = [1] + nums + [1]
    @lru_cache(None)
    def dp(l, r):
        if l + 1 == r:
            return 0
        return max(nums[l] * nums[k] * nums[r] + dp(l, k) + dp(k, r)
                   for k in range(l + 1, r))
    return dp(0, len(nums) - 1)`,
  }],
  23: [{
    label: "Top-down (memoization)",
    note: "State = (day, holding?). Selling jumps two days ahead to enforce the cooldown.",
    code: `from functools import lru_cache
def maxProfit(prices):
    @lru_cache(None)
    def dp(i, holding):
        if i >= len(prices):
            return 0
        rest = dp(i + 1, holding)
        if holding:
            act = prices[i] + dp(i + 2, False)   # sell, then cooldown
        else:
            act = -prices[i] + dp(i + 1, True)    # buy
        return max(rest, act)
    return dp(0, False)`,
  }],
  25: [{
    label: "It's already top-down",
    note: "Tree DP is naturally a memoized recursion: the DFS visits each node exactly once and returns its states, so there's no separate bottom-up table. That's why tree DP problems are usually easier to write recursively than to tabulate.",
  }],
};

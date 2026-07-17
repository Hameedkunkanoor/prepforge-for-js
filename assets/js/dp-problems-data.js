/* =====================================================================
   DP PROBLEMS — a runnable, auto-graded Playground collection mirroring
   the 26 worked problems in the DP section (dp-data.js). Same order, so
   dp-mode.js can link each card to set=dp&id=dp<N>.
   Schema matches the Playground: tests=[[call, expected]], hints=[...].
   ===================================================================== */
window.DP_PROBLEMS = [
  {
    num: 1, id: "dp1", title: "Climbing Stairs", category: "Linear DP", difficulty: "Easy",
    statement: "You can climb 1 or 2 steps at a time. How many distinct ways are there to reach the top of n stairs?",
    idea: "dp[i] = dp[i-1] + dp[i-2] — Fibonacci. Collapses to two rolling variables.",
    tests: [["climbStairs(2)", "2"], ["climbStairs(4)", "5"], ["climbStairs(1)", "1"]],
    hints: ["Your final move was a single step (from n-1) or a double step (from n-2).", "dp[i] = ways to reach step i.", "dp[i] = dp[i-1] + dp[i-2]; base dp[0]=dp[1]=1."],
    code: `def climbStairs(n):
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
    time: "O(n)", space: "O(1)",
    explanation: "The last move came from i-1 or i-2, so the counts add — exactly Fibonacci. Two rolling variables replace the array.",
    trace: ["n=4", "(a,b): 1,1 → 1,2 → 2,3 → 3,5 → 5,8", "return 5"],
  },
  {
    num: 2, id: "dp2", title: "House Robber", category: "Linear DP", difficulty: "Medium",
    statement: "Houses in a row hold money; you can't rob two adjacent houses. Maximize the total robbed.",
    idea: "dp[i] = max(dp[i-1], dp[i-2] + nums[i]) — skip or rob.",
    tests: [["rob([2,7,9,3,1])", "12"], ["rob([2,1,1,2])", "4"], ["rob([5])", "5"]],
    hints: ["At each house: skip it (keep best), or rob it (best excluding the neighbor).", "Track best-up-to-here and best-up-to-previous.", "dp[i] = max(dp[i-1], dp[i-2] + nums[i])."],
    code: `def rob(nums):
    prev, cur = 0, 0
    for n in nums:
        prev, cur = cur, max(cur, prev + n)
    return cur`,
    time: "O(n)", space: "O(1)",
    explanation: "cur is the best up to the current house; prev is the best up to the house before it, so robbing now stays legal. Each step slides the window.",
    trace: ["nums=[2,7,9,3,1]", "cur: 2 → 7 → 11 → 11 → 12", "answer 12"],
  },
  {
    num: 3, id: "dp3", title: "Maximum Subarray (Kadane)", category: "Linear DP", difficulty: "Medium",
    statement: "Find the contiguous subarray with the largest sum and return that sum.",
    idea: "dp[i] = max(nums[i], dp[i-1] + nums[i]) — extend or restart.",
    tests: [["maxSubArray([-2,1,-3,4,-1,2,1,-5,4])", "6"], ["maxSubArray([1])", "1"], ["maxSubArray([5,4,-1,7,8])", "23"]],
    hints: ["At i you either extend the previous subarray or start fresh at i.", "dp[i] = best sum ending exactly at i.", "Answer = max over all dp[i]."],
    code: `def maxSubArray(nums):
    cur = best = nums[0]
    for n in nums[1:]:
        cur = max(n, cur + n)
        best = max(best, cur)
    return best`,
    time: "O(n)", space: "O(1)",
    explanation: "If the running sum goes negative it can only hurt what follows, so drop it and restart. The global best captures answers that end mid-array.",
    trace: ["nums=[-2,1,-3,4,-1,2,1,-5,4]", "cur: -2,1,-2,4,3,5,6,1,5", "best = 6"],
  },
  {
    num: 4, id: "dp4", title: "Unique Paths", category: "Grid DP", difficulty: "Medium",
    statement: "A robot at the top-left of an m×n grid moves only right or down. How many unique paths reach the bottom-right?",
    idea: "dp[r][c] = dp[r-1][c] + dp[r][c-1]; edges = 1.",
    tests: [["uniquePaths(3, 7)", "28"], ["uniquePaths(3, 2)", "3"]],
    hints: ["You enter each cell from above or from the left.", "First row and column have exactly one path.", "dp[r][c] = dp[r-1][c] + dp[r][c-1]."],
    code: `def uniquePaths(m, n):
    dp = [[1]*n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r-1][c] + dp[r][c-1]
    return dp[-1][-1]`,
    time: "O(m·n)", space: "O(m·n)",
    explanation: "Edges are straight lines (1 path). Each interior cell sums the two ways of arriving — Pascal's triangle.",
    trace: ["3×3 grid", "edges=1; dp[1][1]=2; dp[1][2]=3", "dp[2][2]=6"],
  },
  {
    num: 5, id: "dp5", title: "Minimum Path Sum", category: "Grid DP", difficulty: "Medium",
    statement: "Given a grid of non-negative numbers, find a right/down path from top-left to bottom-right that minimizes the sum.",
    idea: "dp[r][c] = grid[r][c] + min(up, left).",
    tests: [["minPathSum([[1,3,1],[1,5,1],[4,2,1]])", "7"], ["minPathSum([[1,2,3],[4,5,6]])", "12"]],
    hints: ["The cheapest way into a cell is the cheaper entry plus this cell's cost.", "Seed the first row/column cumulatively.", "dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])."],
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
    time: "O(m·n)", space: "O(m·n)",
    explanation: "Same shape as Unique Paths, but take the cheaper predecessor and add the current cell. Infinity on missing edges keeps the min clean.",
    trace: ["grid=[[1,3,1],[1,5,1],[4,2,1]]", "path 1→3→1→1→1", "answer 7"],
  },
  {
    num: 6, id: "dp6", title: "Unique Paths II (obstacles)", category: "Grid DP", difficulty: "Medium",
    statement: "Same as Unique Paths, but some cells contain obstacles (1) you cannot enter. Count the paths.",
    idea: "Obstacle cell = 0 paths; otherwise the usual sum.",
    tests: [["uniquePathsWithObstacles([[0,0,0],[0,1,0],[0,0,0]])", "2"], ["uniquePathsWithObstacles([[0,1],[0,0]])", "1"]],
    hints: ["An obstacle contributes 0 paths.", "Start cell is 1 only if it's free.", "dp[r][c] = (up if free) + (left if free)."],
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
    time: "O(m·n)", space: "O(m·n)",
    explanation: "The recurrence is identical; obstacles force a cell to 0, blocking every path through it.",
    trace: ["3×3 with center obstacle", "center → 0", "answer 2"],
  },
  {
    num: 7, id: "dp7", title: "0/1 Knapsack (max value)", category: "0/1 Knapsack", difficulty: "Medium",
    statement: "Given item weights and values and capacity W, choose items (each at most once) to maximize total value within W.",
    idea: "dp[w] = max(dp[w], dp[w-wt] + val); iterate capacity backward.",
    tests: [["knapsack([1,3,4],[1,4,5],5)", "6"], ["knapsack([2,3,4],[3,4,5],5)", "7"]],
    hints: ["For each item: skip, or take it (if it fits) and add its value.", "Compress to dp[w] over capacity.", "Iterate w high → low so each item is used once."],
    code: `def knapsack(weights, values, W):
    dp = [0] * (W + 1)
    for wt, val in zip(weights, values):
        for w in range(W, wt - 1, -1):
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[W]`,
    time: "O(n·W)", space: "O(W)",
    explanation: "The backward capacity loop guarantees dp[w-wt] refers to a state without the current item, so each item is used at most once.",
    trace: ["W=5, items (1,1),(3,4),(4,5)", "take (1,1)+(4,5)=6", "dp[5]=6"],
  },
  {
    num: 8, id: "dp8", title: "Partition Equal Subset Sum", category: "0/1 Knapsack", difficulty: "Medium",
    statement: "Can the array be partitioned into two subsets with equal sum?",
    idea: "Reachable-subset-sum to total/2 (boolean knapsack).",
    tests: [["canPartition([1,5,11,5])", "True"], ["canPartition([1,2,3,5])", "False"]],
    hints: ["Possible iff some subset sums to total/2.", "dp[s] = can a subset reach sum s?", "dp[s] = dp[s] or dp[s-num], backward."],
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
    time: "O(n·sum)", space: "O(sum)",
    explanation: "Odd total is impossible. Otherwise ask a subset-sum question: can we build exactly total/2? The boolean array marks reachable sums.",
    trace: ["nums=[1,5,11,5], target=11", "{11} reaches 11", "True"],
  },
  {
    num: 9, id: "dp9", title: "Target Sum", category: "0/1 Knapsack", difficulty: "Medium",
    statement: "Assign + or − to each number so the expression equals target. Count the number of ways.",
    idea: "Count subsets summing to P = (sum + target) / 2.",
    tests: [["findTargetSumWays([1,1,1,1,1], 3)", "5"], ["findTargetSumWays([1], 1)", "1"]],
    hints: ["P (the +'d set) satisfies P = (sum + target)/2.", "dp[s] = number of subsets summing to s.", "dp[s] += dp[s-num], backward."],
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
    time: "O(n·sum)", space: "O(sum)",
    explanation: "A reduction turns signs into a subset-count problem. Counting means we add ways instead of OR-ing, still backward for 0/1 semantics.",
    trace: ["nums=[1,1,1,1,1], target=3 → P=4", "count subsets summing to 4", "answer 5"],
  },
  {
    num: 10, id: "dp10", title: "Coin Change (fewest coins)", category: "Unbounded Knapsack", difficulty: "Medium",
    statement: "Given coin denominations and an amount, return the fewest coins needed, or -1 if impossible.",
    idea: "dp[a] = min(dp[a], dp[a-c] + 1).",
    tests: [["coinChange([1,2,5], 11)", "3"], ["coinChange([2], 3)", "-1"], ["coinChange([1], 0)", "0"]],
    hints: ["Best over using one coin c plus optimal for a−c.", "Initialize to infinity (amount+1).", "Unreachable stays at infinity → -1."],
    code: `def coinChange(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != amount + 1 else -1`,
    time: "O(amount·coins)", space: "O(amount)",
    explanation: "amount+1 acts as infinity. If dp[amount] never improves, it's unreachable. Greedy fails for arbitrary coin sets — hence DP.",
    trace: ["coins=[1,2,5], amount=11", "11 = 5+5+1", "answer 3"],
  },
  {
    num: 11, id: "dp11", title: "Coin Change II (count combinations)", category: "Unbounded Knapsack", difficulty: "Medium",
    statement: "Count the number of combinations of coins that make up the amount. Order does not matter.",
    idea: "Coins OUTER, amount INNER → combinations. dp[a] += dp[a-c].",
    tests: [["change(5, [1,2,5])", "4"], ["change(3, [2])", "0"], ["change(10, [10])", "1"]],
    hints: ["Put coins in the OUTER loop so {1,2} and {2,1} count once.", "dp[a] = ways to make amount a.", "dp[0] = 1."],
    code: `def change(amount, coins):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for c in coins:                 # coins OUTER
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]`,
    time: "O(amount·coins)", space: "O(amount)",
    explanation: "Finishing each coin's loop before the next fixes coin order, so permutations of one multiset collapse into a single combination.",
    trace: ["amount=5, coins=[1,2,5]", "{5},{2,2,1},{2,1,1,1},{1×5}", "answer 4"],
  },
  {
    num: 12, id: "dp12", title: "Combination Sum IV (count permutations)", category: "Unbounded Knapsack", difficulty: "Medium",
    statement: "Count the number of ordered sequences (permutations allowed) of numbers that sum to the target.",
    idea: "Amount OUTER, nums INNER → permutations. dp[a] += dp[a-num].",
    tests: [["combinationSum4([1,2,3], 4)", "7"], ["combinationSum4([9], 3)", "0"]],
    hints: ["Amount OUTER so different orders count separately.", "dp[a] = ordered ways to sum to a.", "This is the only change from Coin Change II."],
    code: `def combinationSum4(nums, target):
    dp = [0] * (target + 1)
    dp[0] = 1
    for a in range(1, target + 1):   # amount OUTER
        for num in nums:
            if num <= a:
                dp[a] += dp[a - num]
    return dp[target]`,
    time: "O(target·nums)", space: "O(target)",
    explanation: "Swapping loop order flips the meaning from combinations to permutations — the key loop-order lesson.",
    trace: ["nums=[1,2,3], target=4", "(1,3) and (3,1) both count", "answer 7"],
  },
  {
    num: 13, id: "dp13", title: "Longest Common Subsequence", category: "String DP", difficulty: "Medium",
    statement: "Return the length of the longest common subsequence of two strings (in order, not necessarily contiguous).",
    idea: "match: dp[i-1][j-1]+1; else max(dp[i-1][j], dp[i][j-1]).",
    tests: [["longestCommonSubsequence('abcde', 'ace')", "3"], ["longestCommonSubsequence('abc', 'abc')", "3"], ["longestCommonSubsequence('abc', 'def')", "0"]],
    hints: ["If last chars match, add 1 to the LCS of both shorter prefixes.", "Else drop one char from one side.", "dp over prefixes A[:i], B[:j]."],
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
    time: "O(m·n)", space: "O(m·n)",
    explanation: "A match shrinks both prefixes (diagonal). A mismatch drops whichever side gives the better result.",
    trace: ["a='abcde', b='ace'", "matches a, c, e", "answer 3"],
  },
  {
    num: 14, id: "dp14", title: "Edit Distance", category: "String DP", difficulty: "Hard",
    statement: "Minimum insertions, deletions, or replacements to turn word A into word B.",
    idea: "match: diagonal; else 1 + min(up, left, diagonal).",
    tests: [["minDistance('horse', 'ros')", "3"], ["minDistance('intention', 'execution')", "5"]],
    hints: ["Matching chars cost nothing.", "Else 1 + best of delete/insert/replace.", "Base: turning a prefix into '' costs its length."],
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
    time: "O(m·n)", space: "O(m·n)",
    explanation: "up = delete, left = insert, diagonal = replace. Base row/column are pure insertions/deletions.",
    trace: ["a='horse', b='ros'", "horse→rorse→rose→ros", "answer 3"],
  },
  {
    num: 15, id: "dp15", title: "Distinct Subsequences", category: "String DP", difficulty: "Hard",
    statement: "Count how many distinct subsequences of s equal t.",
    idea: "dp[i][j] = dp[i-1][j] + (dp[i-1][j-1] if s[i-1]==t[j-1]).",
    tests: [["numDistinct('rabbbit', 'rabbit')", "3"], ["numDistinct('babgbag', 'bag')", "5"]],
    hints: ["You can always skip s[i].", "If it matches t[j], you may also use it.", "Empty t has exactly one subsequence."],
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
    time: "O(m·n)", space: "O(m·n)",
    explanation: "Every char of s can be skipped; a match also counts subsequences consuming both. The empty target has one subsequence.",
    trace: ["s='rabbbit', t='rabbit'", "3 ways to pick the b's", "answer 3"],
  },
  {
    num: 16, id: "dp16", title: "Longest Increasing Subsequence", category: "Subsequence / LIS", difficulty: "Medium",
    statement: "Return the length of the longest strictly increasing subsequence.",
    idea: "Patience sorting: tails[k] = smallest tail of a length-(k+1) subsequence.",
    tests: [["lengthOfLIS([10,9,2,5,3,7,101,18])", "4"], ["lengthOfLIS([0,1,0,3,2,3])", "4"], ["lengthOfLIS([7,7,7,7])", "1"]],
    hints: ["Keep the smallest possible tail for every length.", "Binary-search where each number fits.", "Length of tails is the LIS length."],
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
    time: "O(n log n)", space: "O(n)",
    explanation: "tails stays sorted; replacing the first element ≥ x keeps options minimal without changing achievable lengths. Its length is the LIS length.",
    trace: ["nums=[10,9,2,5,3,7,101,18]", "tails → [2,3,7,18]", "answer 4"],
  },
  {
    num: 17, id: "dp17", title: "Number of Longest Increasing Subsequences", category: "Subsequence / LIS", difficulty: "Medium",
    statement: "Count how many longest strictly increasing subsequences the array has.",
    idea: "Track length[i] and count[i] for chains ending at i.",
    tests: [["findNumberOfLIS([1,3,5,4,7])", "2"], ["findNumberOfLIS([2,2,2,2,2])", "5"]],
    hints: ["Store both the best length ending at i and how many achieve it.", "Longer chain → reset count; equal chain → add count.", "Sum counts over all maximal-length endings."],
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
    time: "O(n²)", space: "O(n)",
    explanation: "A longer chain resets the count to that predecessor's count; an equally long one adds it. Summing over maximal endings gives the total.",
    trace: ["nums=[1,3,5,4,7]", "1,3,5,7 and 1,3,4,7", "answer 2"],
  },
  {
    num: 18, id: "dp18", title: "Longest Arithmetic Subsequence", category: "Subsequence / LIS", difficulty: "Medium",
    statement: "Return the length of the longest subsequence with a constant common difference.",
    idea: "dp[i][d] = length of arithmetic subseq ending at i with difference d.",
    tests: [["longestArithSeqLength([3,6,9,12])", "4"], ["longestArithSeqLength([9,4,7,2,10])", "3"], ["longestArithSeqLength([20,1,15,3,10,5,8])", "4"]],
    hints: ["The difference is part of the state.", "Use a dict per index keyed by difference.", "dp[i][d] = dp[j][d] + 1 for j<i with d = nums[i]-nums[j]."],
    code: `def longestArithSeqLength(nums):
    dp = [{} for _ in nums]
    best = 0
    for i in range(len(nums)):
        for j in range(i):
            d = nums[i] - nums[j]
            dp[i][d] = dp[j].get(d, 1) + 1
            best = max(best, dp[i][d])
    return best`,
    time: "O(n²)", space: "O(n²)",
    explanation: "Storing a dictionary at each index tracks chains by difference. Extending a difference-d chain ending at j gives one ending at i.",
    trace: ["nums=[3,6,9,12]", "difference 3 → length 4", "answer 4"],
  },
  {
    num: 19, id: "dp19", title: "Burst Balloons", category: "Interval DP", difficulty: "Hard",
    statement: "Bursting balloon k earns nums[left]·nums[k]·nums[right] (its current neighbors). Maximize total coins.",
    idea: "Choose the LAST balloon k in a range: nums[l]·nums[k]·nums[r] + dp[l][k] + dp[k][r].",
    tests: [["maxCoins([3,1,5,8])", "167"], ["maxCoins([1,5])", "10"]],
    hints: ["Forward is messy (bursting changes neighbors).", "Decide which balloon is burst LAST in a range.", "Then its neighbors are the fixed boundaries l and r."],
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
    time: "O(n³)", space: "O(n²)",
    explanation: "The last balloon k in a range has the padded boundaries as neighbors, splitting the range into two independent subproblems.",
    trace: ["nums=[3,1,5,8] → padded", "DP over increasing lengths", "answer 167"],
  },
  {
    num: 20, id: "dp20", title: "Minimum Cost to Cut a Stick", category: "Interval DP", difficulty: "Hard",
    statement: "A stick of length n has given cut positions. Each cut costs the length of the piece being cut. Minimize total cost.",
    idea: "Choose the FIRST cut k in a segment: (cuts[j]-cuts[i]) + dp[i][k] + dp[k][j].",
    tests: [["minCost(7, [1,3,4,5])", "16"], ["minCost(9, [5,6,1,4,2])", "22"]],
    hints: ["The cost of a cut is the current segment length.", "Pad the cuts with 0 and n, then sort.", "Try which cut to make first in each interval."],
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
    time: "O(m³)", space: "O(m²)",
    explanation: "Padding turns cut positions into interval boundaries. The first cut costs the whole segment and splits it into two independent segments.",
    trace: ["n=7, cuts=[1,3,4,5]", "DP over intervals", "answer 16"],
  },
  {
    num: 21, id: "dp21", title: "Longest Palindromic Subsequence", category: "Interval DP", difficulty: "Medium",
    statement: "Return the length of the longest subsequence of s that is a palindrome.",
    idea: "match ends: dp[i+1][j-1]+2; else max(dp[i+1][j], dp[i][j-1]).",
    tests: [["longestPalindromeSubseq('bbbab')", "4"], ["longestPalindromeSubseq('cbbd')", "2"]],
    hints: ["If the ends match, they wrap a smaller palindrome.", "Otherwise drop one end.", "Iterate i downward so inner ranges are ready."],
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
    time: "O(n²)", space: "O(n²)",
    explanation: "Interval DP on one string: matching outer characters add 2 around the best inner palindrome; else discard the weaker end.",
    trace: ["s='bbbab'", "'bbbb' is palindromic", "answer 4"],
  },
  {
    num: 22, id: "dp22", title: "Best Time to Buy and Sell Stock", category: "State Machine", difficulty: "Easy",
    statement: "Buy on one day and sell on a later day at most once. Maximize the profit.",
    idea: "Track the lowest price so far; profit = max(profit, price − min).",
    tests: [["maxProfit([7,1,5,3,6,4])", "5"], ["maxProfit([7,6,4,3,1])", "0"]],
    hints: ["Biggest jump after the running minimum.", "Track min_price and best profit.", "This is the base case of the stock family."],
    code: `def maxProfit(prices):
    min_price = float('inf')
    profit = 0
    for p in prices:
        min_price = min(min_price, p)
        profit = max(profit, p - min_price)
    return profit`,
    time: "O(n)", space: "O(1)",
    explanation: "The single-transaction case reduces to the largest rise after the running minimum.",
    trace: ["prices=[7,1,5,3,6,4]", "buy 1, sell 6", "answer 5"],
  },
  {
    num: 23, id: "dp23", title: "Buy and Sell Stock with Cooldown", category: "State Machine", difficulty: "Medium",
    statement: "Unlimited transactions, but after you sell you must rest one day before buying again. Maximize profit.",
    idea: "Three states: hold, sold, rest.",
    tests: [["maxProfit([1,2,3,0,2])", "3"], ["maxProfit([1])", "0"]],
    hints: ["Track holding, just-sold, and resting.", "You may only buy from the rest state.", "rest can only follow a sold day."],
    code: `def maxProfit(prices):
    hold, sold, rest = float('-inf'), 0, 0
    for p in prices:
        prev_sold = sold
        sold = hold + p             # sell today
        hold = max(hold, rest - p)  # keep holding, or buy from rest
        rest = max(rest, prev_sold) # cooldown after selling
    return max(sold, rest)`,
    time: "O(n)", space: "O(1)",
    explanation: "The cooldown is captured by only allowing a buy from rest, and rest can only follow sold — so you can't buy the day after selling.",
    trace: ["prices=[1,2,3,0,2]", "buy,sell,cooldown,buy,sell", "answer 3"],
  },
  {
    num: 24, id: "dp24", title: "Buy and Sell Stock with Transaction Fee", category: "State Machine", difficulty: "Medium",
    statement: "Unlimited transactions, but each sale costs a fixed fee. Maximize profit.",
    idea: "Two states: cash (not holding), hold (holding).",
    tests: [["maxProfit([1,3,2,8,4,9], 2)", "8"], ["maxProfit([1,3,7,5,10,3], 3)", "6"]],
    hints: ["cash = best while not holding; hold = best while holding.", "Selling pays the fee once.", "End on cash to avoid an unsold share."],
    code: `def maxProfit(prices, fee):
    cash, hold = 0, float('-inf')
    for p in prices:
        cash = max(cash, hold + p - fee)
        hold = max(hold, cash - p)
    return cash`,
    time: "O(n)", space: "O(1)",
    explanation: "cash tracks your balance while not holding, hold while holding a share; the fee is paid on sale. Ending on cash guarantees no open position.",
    trace: ["prices=[1,3,2,8,4,9], fee=2", "buy 1 sell 8, buy 4 sell 9", "answer 8"],
  },
  {
    num: 25, id: "dp25", title: "House Robber III", category: "Tree DP", difficulty: "Medium",
    statement: "Houses form a binary tree. You can't rob a node and its direct child. Maximize the loot. (TreeNode is provided.)",
    idea: "dfs(node) returns (rob_this, skip_this).",
    tests: [
      ["rob(TreeNode(3, TreeNode(2, None, TreeNode(3)), TreeNode(3, None, TreeNode(1))))", "7"],
      ["rob(TreeNode(3, TreeNode(4, TreeNode(1), TreeNode(3)), TreeNode(5, None, TreeNode(1))))", "9"],
    ],
    hints: ["Each subtree reports two numbers: rob its root, or don't.", "Rob node → use children's skip values.", "Skip node → each child is free to do best."],
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
    time: "O(n)", space: "O(h)",
    explanation: "Returning both options avoids recomputation. Rob uses children's skip; skip lets each child do whatever's best. The root's max is the answer.",
    trace: ["rob a node → skip its children", "skip a node → best of children", "max at root"],
  },
  {
    num: 26, id: "dp26", title: "Binary Tree Maximum Path Sum", category: "Tree DP", difficulty: "Hard",
    statement: "Find the maximum sum of any node-to-node path (it need not pass through the root). (TreeNode is provided.)",
    idea: "Node returns best downward gain; global best = node + left + right.",
    tests: [
      ["maxPathSum(TreeNode(1, TreeNode(2), TreeNode(3)))", "6"],
      ["maxPathSum(TreeNode(-10, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7))))", "42"],
    ],
    hints: ["Clamp negative subtree gains to 0.", "Best path through a node uses both sides.", "A node can only extend ONE side up to its parent."],
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
    time: "O(n)", space: "O(h)",
    explanation: "Negative gains are clamped to 0. The best path through a node uses both sides, but only one side can be passed upward — that split is the crux.",
    trace: ["clamp negatives to 0", "best path bends through some node", "answer = global best"],
  },
];

/* =====================================================================
   PROBLEMS — 80 high-frequency FAANG/Uber/Stripe/Salesforce interview
   problems. Each entry: statement, approach, Python solution, complexity,
   a clear explanation, and a step-by-step trace.
   Rendered by problems.js with Prism highlighting + filters.
   ===================================================================== */
window.PROBLEMS = [
  {
    num: 1, id: "p1", title: "Two Sum", category: "Hashing", difficulty: "Easy",
    statement: "Given an array of integers, return indices of two numbers that add up to a target.",
    link: "https://leetcode.com/problems/two-sum/",
    idea: "One-pass hash map: store each number's index and check if its complement was already seen.",
    code: `def twoSum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i`,
    time: "O(n)", space: "O(n)",
    explanation: "As you scan, you ask: 'have I already seen the number that completes this pair?'. The map stores value→index, so the complement lookup is O(1). You return the moment a complement exists, guaranteeing the first valid pair.",
    trace: ["nums=[2,7,11], target=9", "i=0 n=2: need 7, not in seen → seen={2:0}", "i=1 n=7: need 2, 2 in seen → return [0,1]"],
  },
  {
    num: 2, id: "p2", title: "Product of Array Except Self", category: "Array", difficulty: "Medium",
    statement: "Return an array where each element is the product of all others (no division).",
    link: "https://leetcode.com/problems/product-of-array-except-self/",
    idea: "Two passes: prefix products left→right, then suffix products right→left, multiplied into the result.",
    code: `def productExceptSelf(nums):
    res = [1]*len(nums)
    p = 1
    for i in range(len(nums)):
        res[i] = p
        p *= nums[i]
    s = 1
    for i in range(len(nums)-1,-1,-1):
        res[i] *= s
        s *= nums[i]
    return res`,
    time: "O(n)", space: "O(1)",
    explanation: "res[i] = (product of everything left of i) × (product of everything right of i). The first pass fills res with left products; the second pass multiplies in right products using a running suffix. Output array doesn't count as extra space.",
    trace: ["nums=[1,2,3,4]", "left pass → res=[1,1,2,6]", "right pass s: i=3 res=6·1; i=2 res=2·4=8; i=1 res=1·12=12; i=0 res=1·24=24", "result=[24,12,8,6]"],
  },
  {
    num: 3, id: "p3", title: "Longest Consecutive Sequence", category: "Hashing", difficulty: "Medium",
    statement: "Find the length of the longest run of consecutive integers.",
    link: "https://leetcode.com/problems/longest-consecutive-sequence/",
    idea: "Put all numbers in a set; only start counting from sequence beginnings (n-1 absent) to keep it O(n).",
    code: `def longestConsecutive(nums):
    s = set(nums)
    best = 0
    for n in s:
        if n-1 not in s:
            cur, length = n, 1
            while cur+1 in s:
                cur += 1
                length += 1
            best = max(best, length)
    return best`,
    time: "O(n)", space: "O(n)",
    explanation: "A number is the start of a run only if n-1 isn't present. From each start we walk upward while the next value exists. Each number is visited at most twice, so it's linear despite the nested loop.",
    trace: ["nums=[100,4,200,1,3,2] → set", "1 is a start (0 absent): 1,2,3,4 → length 4", "100 start: alone → 1; 200 start: alone → 1", "best=4"],
  },
  {
    num: 4, id: "p4", title: "Container With Most Water", category: "Two Pointers", difficulty: "Medium",
    statement: "Given heights, find the maximum water area between two lines.",
    link: "https://leetcode.com/problems/container-with-most-water/",
    idea: "Two pointers at the ends; area is limited by the shorter line, so move the shorter pointer inward.",
    code: `def maxArea(height):
    l, r = 0, len(height)-1
    ans = 0
    while l < r:
        ans = max(ans, min(height[l], height[r]) * (r-l))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return ans`,
    time: "O(n)", space: "O(1)",
    explanation: "Width shrinks each step, so the only way to find a bigger area is a taller boundary. Moving the shorter line is the only move that could help — moving the taller one can never increase the min height.",
    trace: ["height=[1,8,6,2,5,4,8,3,7]", "l=0,r=8 → min(1,7)*8=8; move l", "l=1,r=8 → min(8,7)*7=49; move r", "...max stays 49 → answer 49"],
  },
  {
    num: 5, id: "p5", title: "Trapping Rain Water", category: "Two Pointers", difficulty: "Hard",
    statement: "Compute how much rainwater is trapped between bars.",
    link: "https://leetcode.com/problems/trapping-rain-water/",
    idea: "Two pointers tracking left-max and right-max; the smaller side bounds the water at that index.",
    code: `def trap(height):
    l, r = 0, len(height)-1
    lm = rm = 0
    res = 0
    while l < r:
        if height[l] < height[r]:
            lm = max(lm, height[l])
            res += lm - height[l]
            l += 1
        else:
            rm = max(rm, height[r])
            res += rm - height[r]
            r -= 1
    return res`,
    time: "O(n)", space: "O(1)",
    explanation: "Water above a bar = min(maxLeft, maxRight) − height. Whichever side has the smaller running max is the true bound there, so we safely process that side and add trapped water.",
    trace: ["height=[0,1,0,2,1,0,3]", "left smaller: update lm, add lm-h each step", "as l advances past dips, water accumulates", "total trapped reported at the end"],
  },
  {
    num: 6, id: "p6", title: "Longest Substring Without Repeating Characters", category: "Sliding Window", difficulty: "Medium",
    statement: "Length of the longest substring with all-unique characters.",
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    idea: "Sliding window with a map of last-seen index; jump the left edge past any repeat.",
    code: `def lengthOfLongestSubstring(s):
    seen, l, res = {}, 0, 0
    for r, c in enumerate(s):
        if c in seen and seen[c] >= l:
            l = seen[c] + 1
        seen[c] = r
        res = max(res, r-l+1)
    return res`,
    time: "O(n)", space: "O(n)",
    explanation: "The window [l..r] always holds unique chars. When c repeats inside the window, jump l just past its previous index. Window size r−l+1 is tracked as the answer.",
    trace: ["s='abcabcbb'", "r=0..2 'abc' → res=3", "r=3 'a' seen@0≥l → l=1; window 'bca'", "continues; max length stays 3 → answer 3"],
  },
  {
    num: 7, id: "p7", title: "Minimum Window Substring", category: "Sliding Window", difficulty: "Hard",
    statement: "Smallest substring of s containing all characters of t.",
    link: "https://leetcode.com/problems/minimum-window-substring/",
    idea: "Expand right to cover all needed chars, then contract left while still valid; track the best window.",
    code: `from collections import Counter

def minWindow(s, t):
    need = Counter(t)
    missing = len(t)
    l = start = end = 0
    for r, c in enumerate(s, 1):
        if need[c] > 0:
            missing -= 1
        need[c] -= 1
        if missing == 0:
            while l < r and need[s[l]] < 0:
                need[s[l]] += 1
                l += 1
            if end == 0 or r-l < end-start:
                start, end = l, r
            need[s[l]] += 1
            missing += 1
            l += 1
    return s[start:end]`,
    time: "O(n)", space: "O(k)",
    explanation: "need counts remaining required chars; missing hits 0 when the window is valid. We then shrink from the left past surplus chars, record the smallest valid window, and release one required char to keep searching.",
    trace: ["s='ADOBECODEBANC', t='ABC'", "first valid window 'ADOBEC'", "later windows shrink: 'BANC' (len 4)", "answer 'BANC'"],
  },
  {
    num: 8, id: "p8", title: "Valid Parentheses", category: "Stack", difficulty: "Easy",
    statement: "Check if a string of brackets is correctly matched and nested.",
    link: "https://leetcode.com/problems/valid-parentheses/",
    idea: "Push opens onto a stack; on a close, the top must be the matching open.",
    code: `def isValid(s):
    stack = []
    mp = {')':'(', ']':'[', '}':'{'}
    for c in s:
        if c in mp:
            if not stack or stack.pop() != mp[c]:
                return False
        else:
            stack.append(c)
    return not stack`,
    time: "O(n)", space: "O(n)",
    explanation: "A stack enforces last-opened-first-closed nesting. Each close must match the most recent open; leftover opens at the end mean it's invalid.",
    trace: ["s='([])'", "'(' push → ['(']; '[' push → ['(','[' ]", "']' pop '[' matches; ')' pop '(' matches", "stack empty → True"],
  },
  {
    num: 9, id: "p9", title: "Merge Two Sorted Lists", category: "Linked List", difficulty: "Easy",
    statement: "Merge two sorted linked lists into one sorted list.",
    link: "https://leetcode.com/problems/merge-two-sorted-lists/",
    idea: "Use a dummy head; always attach the smaller current node and advance.",
    code: `def mergeTwoLists(l1, l2):
    dummy = cur = ListNode(0)
    while l1 and l2:
        if l1.val < l2.val:
            cur.next, l1 = l1, l1.next
        else:
            cur.next, l2 = l2, l2.next
        cur = cur.next
    cur.next = l1 or l2
    return dummy.next`,
    time: "O(n+m)", space: "O(1)",
    explanation: "A dummy node avoids special-casing the head. Splice the smaller of the two fronts each step; when one list ends, attach the remaining tail of the other.",
    trace: ["l1=1→3, l2=2→4", "pick 1 → pick 2 → pick 3 → pick 4", "remaining attached", "result 1→2→3→4"],
  },
  {
    num: 10, id: "p10", title: "Remove Nth Node From End", category: "Linked List", difficulty: "Medium",
    statement: "Remove the nth node from the end of a linked list.",
    link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    idea: "Two pointers n+1 apart; when fast hits the end, slow sits just before the target.",
    code: `def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n+1):
        fast = fast.next
    while fast:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next`,
    time: "O(n)", space: "O(1)",
    explanation: "Advancing fast by n+1 first creates a fixed gap. Moving both until fast is None leaves slow right before the node to delete, so a single pointer rewire removes it.",
    trace: ["list 1→2→3→4→5, n=2", "fast advances 3 steps; gap set", "both move until fast=None → slow at 3", "slow.next=5 → list 1→2→3→5"],
  },
  {
    num: 11, id: "p11", title: "Search in Rotated Sorted Array", category: "Binary Search", difficulty: "Medium",
    statement: "Search a target in a rotated sorted array.",
    link: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    idea: "Binary search; one half is always sorted — decide which and whether target lies inside it.",
    code: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target:
            return m
        if nums[l] <= nums[m]:
            if nums[l] <= target < nums[m]:
                r = m - 1
            else:
                l = m + 1
        else:
            if nums[m] < target <= nums[r]:
                l = m + 1
            else:
                r = m - 1
    return -1`,
    time: "O(log n)", space: "O(1)",
    explanation: "Even rotated, at least one side of mid is sorted. Detect the sorted side, and if target falls within its range, search there; otherwise search the other side.",
    trace: ["nums=[4,5,6,7,0,1,2], target=0", "m=3 (7): left sorted, 0 not in [4,7) → go right", "m=5 (1): right side, 0 in (1,2]? no → left", "find 0 at index 4"],
  },
  {
    num: 12, id: "p12", title: "Find Minimum in Rotated Sorted Array", category: "Binary Search", difficulty: "Medium",
    statement: "Find the minimum element in a rotated sorted array.",
    link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    idea: "Binary search comparing mid with the right end to locate the rotation point.",
    code: `def findMin(nums):
    l, r = 0, len(nums) - 1
    while l < r:
        m = (l + r) // 2
        if nums[m] > nums[r]:
            l = m + 1
        else:
            r = m
    return nums[l]`,
    time: "O(log n)", space: "O(1)",
    explanation: "If nums[m] > nums[r], the min is to the right of m. Otherwise it's at m or left. Converges on the smallest (rotation pivot).",
    trace: ["nums=[4,5,6,7,0,1,2]", "m=3 (7)>2 → l=4", "m=5 (1)≤2 → r=5; m=4 (0)≤1 → r=4", "l==r=4 → min 0"],
  },
  {
    num: 13, id: "p13", title: "Median of Two Sorted Arrays", category: "Binary Search", difficulty: "Hard",
    statement: "Find the median of two sorted arrays in logarithmic time.",
    link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    idea: "Binary search a partition of the smaller array so left halves ≤ right halves.",
    code: `def findMedianSortedArrays(a, b):
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    l, r = 0, m
    while l <= r:
        i = (l + r) // 2
        j = (m + n + 1) // 2 - i
        L1 = a[i-1] if i else float('-inf')
        R1 = a[i] if i < m else float('inf')
        L2 = b[j-1] if j else float('-inf')
        R2 = b[j] if j < n else float('inf')
        if L1 <= R2 and L2 <= R1:
            if (m + n) % 2:
                return max(L1, L2)
            return (max(L1, L2) + min(R1, R2)) / 2
        elif L1 > R2:
            r = i - 1
        else:
            l = i + 1`,
    time: "O(log(min(m,n)))", space: "O(1)",
    explanation: "We partition both arrays so the combined left half has the right size and every left element ≤ every right element. Binary search adjusts the cut in the smaller array until the cross conditions hold.",
    trace: ["a=[1,3], b=[2]", "partition i=1,j=1: L1=1,R1=3,L2=2,R2=inf", "1≤inf and 2≤3 ✓; total odd → max(1,2)=2", "median 2"],
  },
  {
    num: 14, id: "p14", title: "Binary Tree Level Order Traversal", category: "Tree", difficulty: "Medium",
    statement: "Return the level-order (BFS) traversal of a binary tree.",
    link: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    idea: "BFS with a queue, processing one full level per outer iteration.",
    code: `from collections import deque

def levelOrder(root):
    if not root:
        return []
    res, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        res.append(level)
    return res`,
    time: "O(n)", space: "O(n)",
    explanation: "Capturing len(q) at the start of each loop fixes how many nodes belong to the current level. We drain exactly those, collecting their values and queuing their children for the next level.",
    trace: ["tree 3 / 9,20 / _,_,15,7", "level [3]; queue 9,20", "level [9,20]; queue 15,7", "level [15,7] → [[3],[9,20],[15,7]]"],
  },
  {
    num: 15, id: "p15", title: "Validate Binary Search Tree", category: "Tree", difficulty: "Medium",
    statement: "Check whether a binary tree is a valid BST.",
    link: "https://leetcode.com/problems/validate-binary-search-tree/",
    idea: "DFS passing down (low, high) bounds each node must satisfy.",
    code: `def isValidBST(root):
    def dfs(node, low, high):
        if not node:
            return True
        if not (low < node.val < high):
            return False
        return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)
    return dfs(root, float('-inf'), float('inf'))`,
    time: "O(n)", space: "O(h)",
    explanation: "Each node must lie strictly within an allowed range. Going left tightens the upper bound to the node's value; going right tightens the lower bound. A violation anywhere fails the whole tree.",
    trace: ["tree 5 / 1,4 / _,_,3,6", "5 ok in (-inf,inf)", "right child 4 must be >5 → 4 not >5", "returns False"],
  },
  {
    num: 16, id: "p16", title: "Diameter of Binary Tree", category: "Tree", difficulty: "Easy",
    statement: "Return the length of the longest path between any two nodes.",
    link: "https://leetcode.com/problems/diameter-of-binary-tree/",
    idea: "DFS returning height; the diameter at a node is leftHeight + rightHeight.",
    code: `def diameterOfBinaryTree(root):
    ans = 0
    def dfs(node):
        nonlocal ans
        if not node:
            return 0
        l = dfs(node.left)
        r = dfs(node.right)
        ans = max(ans, l + r)
        return 1 + max(l, r)
    dfs(root)
    return ans`,
    time: "O(n)", space: "O(h)",
    explanation: "The longest path through a node uses its left and right subtree heights. We compute heights bottom-up and update a global max with l+r at every node.",
    trace: ["tree 1 / 2,3 / 4,5", "leaves height 0", "node2: l=1,r=1 → diameter 2", "answer 2 (edges 4→2→5)"],
  },
  {
    num: 17, id: "p17", title: "Number of Islands", category: "Graph", difficulty: "Medium",
    statement: "Count connected groups of '1's in a grid.",
    link: "https://leetcode.com/problems/number-of-islands/",
    idea: "Scan the grid; each unvisited '1' starts a DFS flood-fill that sinks the whole island.",
    code: `def numIslands(grid):
    def dfs(r, c):
        if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]) or grid[r][c] == '0':
            return
        grid[r][c] = '0'
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)

    count = 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == '1':
                dfs(r,c)
                count += 1
    return count`,
    time: "O(mn)", space: "O(mn)",
    explanation: "Every land cell is visited once. When we hit unvisited land we increment the count and flood-fill (mark '0') all connected land so it isn't counted again.",
    trace: ["grid with two separate land blobs", "first '1' → dfs sinks blob A; count=1", "next unvisited '1' → sinks blob B; count=2", "answer 2"],
  },
  {
    num: 18, id: "p18", title: "Clone Graph", category: "Graph", difficulty: "Medium",
    statement: "Return a deep copy of a connected undirected graph.",
    link: "https://leetcode.com/problems/clone-graph/",
    idea: "DFS with a map from original node → its clone to avoid infinite loops on cycles.",
    code: `def cloneGraph(node):
    if not node:
        return None
    mp = {}
    def dfs(n):
        if n in mp:
            return mp[n]
        copy = Node(n.val)
        mp[n] = copy
        for nei in n.neighbors:
            copy.neighbors.append(dfs(nei))
        return copy
    return dfs(node)`,
    time: "O(V + E)", space: "O(V)",
    explanation: "The map both caches clones and marks visited nodes. We create a node's clone before recursing into neighbors, so cycles resolve to the already-created copy.",
    trace: ["nodes 1-2-3-4 in a square", "clone 1, recurse to 2, 3, 4", "back-edges hit map → reuse clones", "deep copy returned"],
  },
  {
    num: 19, id: "p19", title: "Course Schedule", category: "Graph", difficulty: "Medium",
    statement: "Determine if all courses can be finished given prerequisites.",
    link: "https://leetcode.com/problems/course-schedule/",
    idea: "Detect a cycle in the prerequisite graph using DFS with visiting/visited states.",
    code: `from collections import defaultdict

def canFinish(numCourses, prerequisites):
    graph = defaultdict(list)
    for a,b in prerequisites:
        graph[a].append(b)
    visiting, visited = set(), set()

    def dfs(c):
        if c in visiting:
            return False
        if c in visited:
            return True
        visiting.add(c)
        for p in graph[c]:
            if not dfs(p):
                return False
        visiting.remove(c)
        visited.add(c)
        return True

    return all(dfs(i) for i in range(numCourses))`,
    time: "O(V + E)", space: "O(V)",
    explanation: "A course is finishable if its prerequisites form no cycle. 'visiting' marks the current DFS path; revisiting a node on the path means a cycle (impossible). 'visited' caches safe nodes.",
    trace: ["prereqs 0→1, 1→0 (cycle)", "dfs(0) marks visiting{0}, recurse 1", "dfs(1) recurse 0 → 0 in visiting → False", "canFinish False"],
  },
  {
    num: 20, id: "p20", title: "Word Search", category: "Backtracking", difficulty: "Medium",
    statement: "Check if a word can be formed by adjacent cells in a grid.",
    link: "https://leetcode.com/problems/word-search/",
    idea: "DFS backtracking from each cell, marking visited cells temporarily.",
    code: `def exist(board, word):
    R, C = len(board), len(board[0])

    def dfs(r, c, i):
        if i == len(word):
            return True
        if r<0 or c<0 or r>=R or c>=C or board[r][c] != word[i]:
            return False
        tmp = board[r][c]
        board[r][c] = '#'
        found = dfs(r+1,c,i+1) or dfs(r-1,c,i+1) or dfs(r,c+1,i+1) or dfs(r,c-1,i+1)
        board[r][c] = tmp
        return found

    for r in range(R):
        for c in range(C):
            if dfs(r,c,0):
                return True
    return False`,
    time: "O(mn · 4ᵏ)", space: "O(k)",
    explanation: "From each starting cell, we try to match word[i] and recurse into the four neighbors for word[i+1]. Marking the cell '#' prevents reuse within one path; we restore it on backtrack.",
    trace: ["find 'SEE' in board", "match S, mark, go to E", "match E, go to E → i==len → True", "word found"],
  },
  {
    num: 21, id: "p21", title: "Word Break", category: "Dynamic Programming", difficulty: "Medium",
    statement: "Can the string be segmented into a sequence of dictionary words?",
    link: "https://leetcode.com/problems/word-break/",
    idea: "DP where dp[i] is True if s[:i] is breakable; extend by checking dictionary words ending at i.",
    code: `def wordBreak(s, wordDict):
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s)+1):
        for w in wordDict:
            if i >= len(w) and dp[i-len(w)] and s[i-len(w):i] == w:
                dp[i] = True
    return dp[-1]`,
    time: "O(n·m·k)", space: "O(n)",
    explanation: "dp[i] is true if some word ends exactly at i and the prefix before it (dp[i-len(w)]) is also breakable. dp[0]=True seeds the empty prefix.",
    trace: ["s='leetcode', dict=[leet,code]", "dp[4] true via 'leet' (dp[0])", "dp[8] true via 'code' (dp[4])", "dp[-1]=True"],
  },
  {
    num: 22, id: "p22", title: "Decode Ways", category: "Dynamic Programming", difficulty: "Medium",
    statement: "Count ways to decode a digit string into letters (A=1..Z=26).",
    link: "https://leetcode.com/problems/decode-ways/",
    idea: "DP like climbing stairs: each position can take one digit (1–9) or two digits (10–26).",
    code: `def numDecodings(s):
    if not s or s[0] == '0':
        return 0
    dp = [0] * (len(s) + 1)
    dp[0] = dp[1] = 1
    for i in range(2, len(s)+1):
        if s[i-1] != '0':
            dp[i] += dp[i-1]
        if 10 <= int(s[i-2:i]) <= 26:
            dp[i] += dp[i-2]
    return dp[-1]`,
    time: "O(n)", space: "O(n)",
    explanation: "dp[i] sums the ways using a valid single digit (adds dp[i-1]) and a valid two-digit pair 10–26 (adds dp[i-2]). Leading zeros and invalid pairs contribute nothing.",
    trace: ["s='226'", "dp[1]=1; dp[2]: '2'+'22' → 2", "dp[3]: '6'(dp2=2)+'26'(dp1=1)=3", "answer 3"],
  },
  {
    num: 23, id: "p23", title: "Coin Change", category: "Dynamic Programming", difficulty: "Medium",
    statement: "Fewest coins to make a target amount (or -1).",
    link: "https://leetcode.com/problems/coin-change/",
    idea: "Bottom-up DP: dp[a] = min coins for amount a, trying each coin.",
    code: `def coinChange(coins, amount):
    dp = [amount+1] * (amount+1)
    dp[0] = 0
    for i in range(1, amount+1):
        for c in coins:
            if i >= c:
                dp[i] = min(dp[i], dp[i-c] + 1)
    return dp[amount] if dp[amount] != amount+1 else -1`,
    time: "O(n·amount)", space: "O(amount)",
    explanation: "dp[a] is the best of using one coin c plus the optimal for a−c. Initializing to amount+1 acts as 'infinity'; if it never improves, the amount is unreachable.",
    trace: ["coins=[1,2,5], amount=11", "dp[5]=1, dp[10]=2, dp[11]=min via 5+? ", "11=5+5+1 → 3 coins", "answer 3"],
  },
  {
    num: 24, id: "p24", title: "House Robber", category: "Dynamic Programming", difficulty: "Medium",
    statement: "Max sum of non-adjacent houses.",
    link: "https://leetcode.com/problems/house-robber/",
    idea: "Track best-including-prev and best-excluding-prev; roll forward.",
    code: `def rob(nums):
    prev1 = prev2 = 0
    for n in nums:
        prev1, prev2 = max(prev2+n, prev1), prev1
    return prev1`,
    time: "O(n)", space: "O(1)",
    explanation: "At each house you either skip it (keep prev1) or rob it (prev2 + n, since prev2 excludes the adjacent house). Two rolling variables replace the DP array.",
    trace: ["nums=[2,7,9,3,1]", "→2 →7 →11(2+9) →11 →12(11+1)", "best so far rolls", "answer 12"],
  },
  {
    num: 25, id: "p25", title: "Jump Game", category: "Greedy", difficulty: "Medium",
    statement: "Can you reach the last index given max jump lengths?",
    link: "https://leetcode.com/problems/jump-game/",
    idea: "Track the farthest reachable index; if you ever stand beyond it, you're stuck.",
    code: `def canJump(nums):
    reach = 0
    for i, n in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + n)
    return True`,
    time: "O(n)", space: "O(1)",
    explanation: "reach is the best index reachable so far. If the current index exceeds reach, no jump could have landed here. Otherwise extend reach by i+nums[i].",
    trace: ["nums=[2,3,1,1,4]", "i0 reach=2; i1 reach=4; i2..4 ≤ reach", "never blocked", "True"],
  },
  {
    num: 26, id: "p26", title: "Merge Intervals", category: "Intervals", difficulty: "Medium",
    statement: "Merge all overlapping intervals.",
    link: "https://leetcode.com/problems/merge-intervals/",
    idea: "Sort by start; merge into the last result interval when they overlap.",
    code: `def merge(intervals):
    intervals.sort()
    res = []
    for s,e in intervals:
        if not res or res[-1][1] < s:
            res.append([s,e])
        else:
            res[-1][1] = max(res[-1][1], e)
    return res`,
    time: "O(n log n)", space: "O(n)",
    explanation: "After sorting by start, overlapping intervals are adjacent. If the current start is beyond the last end, start a new interval; otherwise extend the last end.",
    trace: ["[[1,3],[2,6],[8,10]]", "add [1,3]; [2,6] overlaps → [1,6]", "[8,10] no overlap → add", "[[1,6],[8,10]]"],
  },
  {
    num: 27, id: "p27", title: "Insert Interval", category: "Intervals", difficulty: "Medium",
    statement: "Insert a new interval into a sorted list and merge.",
    link: "https://leetcode.com/problems/insert-interval/",
    idea: "Three phases: intervals before, overlapping (merge), and after.",
    code: `def insert(intervals, newInterval):
    res = []
    for i in intervals:
        if i[1] < newInterval[0]:
            res.append(i)
        elif i[0] > newInterval[1]:
            res.append(newInterval)
            newInterval = i
        else:
            newInterval = [min(i[0], newInterval[0]), max(i[1], newInterval[1])]
    res.append(newInterval)
    return res`,
    time: "O(n)", space: "O(n)",
    explanation: "Intervals entirely left of new are appended; intervals entirely right trigger placing the (merged) new interval first; overlapping ones expand new. The final append flushes the pending interval.",
    trace: ["[[1,3],[6,9]], new=[2,5]", "[1,3] overlaps → new=[1,5]", "[6,9] is right → append [1,5], new=[6,9]", "[[1,5],[6,9]]"],
  },
  {
    num: 28, id: "p28", title: "Unique Paths", category: "Dynamic Programming", difficulty: "Medium",
    statement: "Count paths from top-left to bottom-right moving only right/down.",
    link: "https://leetcode.com/problems/unique-paths/",
    idea: "DP grid where each cell sums the cell above and the cell to the left.",
    code: `def uniquePaths(m, n):
    dp = [[1]*n for _ in range(m)]
    for i in range(1,m):
        for j in range(1,n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[-1][-1]`,
    time: "O(mn)", space: "O(mn)",
    explanation: "Every cell is reached only from above or from the left, so its path count is the sum of those two. The first row/column are all 1 (single straight path).",
    trace: ["3×3 grid", "row/col of 1s; dp[1][1]=2; dp[1][2]=3", "dp[2][2]=dp[1][2]+dp[2][1]=6", "answer 6"],
  },
  {
    num: 29, id: "p29", title: "Climbing Stairs", category: "Dynamic Programming", difficulty: "Easy",
    statement: "Count ways to climb n stairs taking 1 or 2 steps.",
    link: "https://leetcode.com/problems/climbing-stairs/",
    idea: "Fibonacci: ways(n) = ways(n-1) + ways(n-2).",
    code: `def climbStairs(n):
    a, b = 1, 1
    for _ in range(n-1):
        a, b = b, a+b
    return b`,
    time: "O(n)", space: "O(1)",
    explanation: "The last move is either a 1-step (from n-1) or a 2-step (from n-2), so counts add. Two rolling variables compute the Fibonacci sequence.",
    trace: ["n=4", "1,1 → 1,2 → 2,3 → 3,5", "b=5", "answer 5"],
  },
  {
    num: 30, id: "p30", title: "Group Anagrams", category: "Hashing", difficulty: "Medium",
    statement: "Group words that are anagrams of each other.",
    link: "https://leetcode.com/problems/group-anagrams/",
    idea: "Use the sorted characters (as a tuple) as a hash key.",
    code: `from collections import defaultdict

def groupAnagrams(strs):
    d = defaultdict(list)
    for s in strs:
        d[tuple(sorted(s))].append(s)
    return list(d.values())`,
    time: "O(n·k log k)", space: "O(n·k)",
    explanation: "Anagrams share the same multiset of letters, so their sorted form is identical. Bucketing by that sorted key groups them.",
    trace: ["['eat','tea','tan','nat']", "'eat','tea'→key aet; 'tan','nat'→key ant", "two buckets", "[['eat','tea'],['tan','nat']]"],
  },
  {
    num: 31, id: "p31", title: "Spiral Matrix", category: "Matrix", difficulty: "Medium",
    statement: "Return all matrix elements in spiral order.",
    link: "https://leetcode.com/problems/spiral-matrix/",
    idea: "Repeatedly take the top row, then rotate the rest counter-clockwise.",
    code: `def spiralOrder(matrix):
    res = []
    while matrix:
        res += matrix.pop(0)
        matrix = list(zip(*matrix))[::-1]
    return res`,
    time: "O(mn)", space: "O(mn)",
    explanation: "Pop the first row, then rotate the remaining matrix so the next row to read becomes the new top. zip(*m)[::-1] rotates 90° counter-clockwise.",
    trace: ["[[1,2,3],[4,5,6],[7,8,9]]", "take 1,2,3; rotate", "take 6,9; rotate; take 8,7; ...", "→1,2,3,6,9,8,7,4,5"],
  },
  {
    num: 32, id: "p32", title: "Subsets", category: "Backtracking", difficulty: "Medium",
    statement: "Return the power set of distinct integers.",
    link: "https://leetcode.com/problems/subsets/",
    idea: "DFS that records the current path and extends with each later element.",
    code: `def subsets(nums):
    res = []
    def dfs(i, path):
        res.append(path)
        for j in range(i, len(nums)):
            dfs(j+1, path+[nums[j]])
    dfs(0, [])
    return res`,
    time: "O(2ⁿ)", space: "O(n)",
    explanation: "Every node in the recursion tree is itself a valid subset, so we record on entry. Iterating j from i avoids duplicates and produces every combination.",
    trace: ["nums=[1,2]", "[] → [1] → [1,2]; back → [2]", "all paths recorded", "[[],[1],[1,2],[2]]"],
  },
  {
    num: 33, id: "p33", title: "Permutations", category: "Backtracking", difficulty: "Medium",
    statement: "Return all permutations of distinct integers.",
    link: "https://leetcode.com/problems/permutations/",
    idea: "DFS building a path, tracking used indices.",
    code: `def permute(nums):
    res = []
    def dfs(path, used):
        if len(path) == len(nums):
            res.append(path)
            return
        for i in range(len(nums)):
            if i in used: 
                continue
            dfs(path+[nums[i]], used|{i})
    dfs([], set())
    return res`,
    time: "O(n · n!)", space: "O(n)",
    explanation: "At each depth we try every unused element. When the path reaches full length it's a complete permutation. The used set prevents reusing an index.",
    trace: ["nums=[1,2,3]", "1→2→3, 1→3→2, 2→1→3, ...", "6 complete paths", "all permutations"],
  },
  {
    num: 34, id: "p34", title: "Kth Largest Element in an Array", category: "Heap", difficulty: "Medium",
    statement: "Find the kth largest element.",
    link: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    idea: "A size-k min-heap keeps the k largest; its root is the answer.",
    code: `import heapq

def findKthLargest(nums, k):
    return heapq.nlargest(k, nums)[-1]`,
    time: "O(n log k)", space: "O(k)",
    explanation: "nlargest maintains the top-k via a heap; the kth largest is the smallest of those, i.e. the last element of the returned list.",
    trace: ["nums=[3,2,1,5,6,4], k=2", "top-2 → [6,5]", "last element", "answer 5"],
  },
  {
    num: 35, id: "p35", title: "Top K Frequent Elements", category: "Heap", difficulty: "Medium",
    statement: "Return the k most frequent elements.",
    link: "https://leetcode.com/problems/top-k-frequent-elements/",
    idea: "Count frequencies, then take the k items with the largest counts via a heap.",
    code: `from collections import Counter
import heapq

def topKFrequent(nums, k):
    cnt = Counter(nums)
    return [x for x,_ in heapq.nlargest(k, cnt.items(), key=lambda x: x[1])]`,
    time: "O(n log k)", space: "O(n)",
    explanation: "Counter gives value→frequency. nlargest with a count key selects the k highest-frequency entries; we strip the values out of the (value,count) pairs.",
    trace: ["nums=[1,1,1,2,2,3], k=2", "counts {1:3,2:2,3:1}", "top-2 by count → 1,2", "[1,2]"],
  },
  {
    num: 36, id: "p36", title: "Binary Tree Right Side View", category: "Tree", difficulty: "Medium",
    statement: "Return the node values visible from the right side.",
    link: "https://leetcode.com/problems/binary-tree-right-side-view/",
    idea: "DFS visiting right child first; record the first node seen at each depth.",
    code: `def rightSideView(root):
    res = []
    def dfs(node, depth):
        if not node:
            return
        if depth == len(res):
            res.append(node.val)
        dfs(node.right, depth+1)
        dfs(node.left, depth+1)
    dfs(root, 0)
    return res`,
    time: "O(n)", space: "O(h)",
    explanation: "By recursing right before left, the first node encountered at each new depth is the rightmost. We add it only when depth equals the current result length.",
    trace: ["tree 1 / 2,3 / _,5,_,4", "depth0→1, depth1→3 (right first), depth2→4", "rightmost per level", "[1,3,4]"],
  },
  {
    num: 37, id: "p37", title: "Serialize and Deserialize Binary Tree", category: "Design", difficulty: "Hard",
    statement: "Encode a tree to a string and decode it back.",
    link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    idea: "Pre-order DFS with '#' markers for nulls; rebuild by consuming tokens in the same order.",
    code: `def serialize(root):
    res = []
    def dfs(node):
        if not node:
            res.append('#')
            return
        res.append(str(node.val))
        dfs(node.left)
        dfs(node.right)
    dfs(root)
    return ",".join(res)

def deserialize(data):
    vals = iter(data.split(","))
    def dfs():
        v = next(vals)
        if v == '#':
            return None
        node = TreeNode(int(v))
        node.left = dfs()
        node.right = dfs()
        return node
    return dfs()`,
    time: "O(n)", space: "O(n)",
    explanation: "Pre-order with explicit null markers uniquely encodes the structure. Deserialization consumes tokens in the exact same order, rebuilding left then right subtrees recursively.",
    trace: ["tree 1 / 2,3", "serialize → '1,2,#,#,3,#,#'", "deserialize reads 1, builds left 2, right 3", "tree restored"],
  },
  {
    num: 38, id: "p38", title: "Maximum Depth of Binary Tree", category: "Tree", difficulty: "Easy",
    statement: "Find the maximum depth (height) of a binary tree.",
    link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    idea: "Depth = 1 + max(depth(left), depth(right)).",
    code: `def maxDepth(root):
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))`,
    time: "O(n)", space: "O(h)",
    explanation: "A null subtree has depth 0; any node adds 1 to the deeper of its two children. Recursion naturally computes the height bottom-up.",
    trace: ["tree 3 / 9,20 / _,_,15,7", "depth(9)=1, depth(20)=2", "1+max(1,2)=3", "answer 3"],
  },
  {
    num: 39, id: "p39", title: "Symmetric Tree", category: "Tree", difficulty: "Easy",
    statement: "Check if a tree is a mirror image of itself.",
    link: "https://leetcode.com/problems/symmetric-tree/",
    idea: "Compare left subtree with right subtree mirrored.",
    code: `def isSymmetric(root):
    def mirror(a, b):
        if not a and not b:
            return True
        if not a or not b:
            return False
        return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)
    return mirror(root, root)`,
    time: "O(n)", space: "O(h)",
    explanation: "Two trees mirror if their roots match and the left of one mirrors the right of the other. We recurse with crossed children (a.left vs b.right).",
    trace: ["tree 1 / 2,2 / 3,4,4,3", "mirror(2,2): vals equal", "outer 3==3, inner 4==4", "True"],
  },
  {
    num: 40, id: "p40", title: "Flatten Binary Tree to Linked List", category: "Tree", difficulty: "Medium",
    statement: "Flatten a binary tree into a right-pointing linked list in pre-order.",
    link: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
    idea: "Recursively flatten left and right, then splice left subtree between node and right subtree.",
    code: `def flatten(root):
    if not root:
        return
    flatten(root.left)
    flatten(root.right)
    tmp = root.right
    root.right = root.left
    root.left = None
    cur = root
    while cur.right:
        cur = cur.right
    cur.right = tmp
`,
    time: "O(n)", space: "O(h)",
    explanation: "After both subtrees are flattened, move the left chain to the right, null the left, then walk to its tail and attach the original right chain — preserving pre-order.",
    trace: ["tree 1 / 2,5 / 3,4,_,6", "flatten subtrees", "1→2→3→4→5→6 via right pointers", "left pointers nulled"],
  },
  {
    num: 41, id: "p41", title: "Trapping Rain Water (revisit)", category: "Two Pointers", difficulty: "Hard",
    statement: "Compute trapped rainwater — a second pass to cement the two-pointer pattern.",
    link: "https://leetcode.com/problems/trapping-rain-water/",
    idea: "Two pointers with running left/right maxima bound the water at each index.",
    code: `def trap(height):
    l, r = 0, len(height)-1
    lm = rm = 0
    res = 0
    while l < r:
        if height[l] < height[r]:
            lm = max(lm, height[l])
            res += lm - height[l]
            l += 1
        else:
            rm = max(rm, height[r])
            res += rm - height[r]
            r -= 1
    return res`,
    time: "O(n)", space: "O(1)",
    explanation: "Identical pattern to #5: process the side with the smaller running max because that side's bound is final. Revisiting cements the technique.",
    trace: ["height=[4,2,0,3,2,5]", "right side smaller at times; accumulate rm-h", "dips fill up to the bounding wall", "trapped water summed"],
  },
  {
    num: 42, id: "p42", title: "Minimum Window Substring (revisit)", category: "Sliding Window", difficulty: "Hard",
    statement: "Smallest window containing all of t — reinforcing the variable window pattern.",
    link: "https://leetcode.com/problems/minimum-window-substring/",
    idea: "Grow to validity (missing==0), then shrink while still valid, tracking the smallest.",
    code: `from collections import Counter

def minWindow(s, t):
    need = Counter(t)
    missing = len(t)
    l = start = end = 0
    for r, c in enumerate(s, 1):
        if need[c] > 0:
            missing -= 1
        need[c] -= 1
        if missing == 0:
            while l < r and need[s[l]] < 0:
                need[s[l]] += 1
                l += 1
            if end == 0 or r-l < end-start:
                start, end = l, r
            need[s[l]] += 1
            missing += 1
            l += 1
    return s[start:end]`,
    time: "O(n)", space: "O(k)",
    explanation: "Same engine as #7. Negative need counts mean surplus chars we can drop from the left. We record the minimal valid window before releasing a required char.",
    trace: ["s='aab', t='ab'", "window 'aab' valid; shrink leading 'a'", "best 'ab'", "answer 'ab'"],
  },
  {
    num: 43, id: "p43", title: "Sliding Window Maximum", category: "Sliding Window", difficulty: "Hard",
    statement: "Return the maximum of each window of size k.",
    link: "https://leetcode.com/problems/sliding-window-maximum/",
    idea: "Monotonic decreasing deque of indices; the front is always the window max.",
    code: `from collections import deque

def maxSlidingWindow(nums, k):
    dq, res = deque(), []
    for i,n in enumerate(nums):
        while dq and nums[dq[-1]] < n:
            dq.pop()
        dq.append(i)
        if dq[0] == i-k:
            dq.popleft()
        if i >= k-1:
            res.append(nums[dq[0]])
    return res`,
    time: "O(n)", space: "O(k)",
    explanation: "We keep indices whose values are decreasing; smaller values can never be a future max while a larger newer value exists. The front holds the current max; we pop it when it slides out of the window.",
    trace: ["nums=[1,3,-1,-3,5], k=3", "windows maxima: 3, 3, 5", "deque front tracks max index", "[3,3,5]"],
  },
  {
    num: 44, id: "p44", title: "LRU Cache", category: "Design", difficulty: "Medium",
    statement: "Design a cache with O(1) get/put and least-recently-used eviction.",
    link: "https://leetcode.com/problems/lru-cache/",
    idea: "OrderedDict: move accessed keys to the end; evict from the front when over capacity.",
    code: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cache = OrderedDict()
        self.cap = capacity

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)`,
    time: "O(1)", space: "O(capacity)",
    explanation: "OrderedDict preserves insertion/access order. move_to_end marks a key as most-recently-used; popitem(last=False) removes the oldest when capacity is exceeded.",
    trace: ["cap=2; put 1,1; put 2,2", "get 1 → moves 1 to MRU", "put 3 → evicts 2 (LRU)", "get 2 → -1"],
  },
  {
    num: 45, id: "p45", title: "Find Median from Data Stream", category: "Heap", difficulty: "Hard",
    statement: "Maintain the median as numbers stream in.",
    link: "https://leetcode.com/problems/find-median-from-data-stream/",
    idea: "Two heaps: a max-heap for the lower half, a min-heap for the upper half, kept balanced.",
    code: `import heapq

class MedianFinder:
    def __init__(self):
        self.small = []  # max heap (negated)
        self.large = []  # min heap

    def addNum(self, num):
        heapq.heappush(self.small, -num)
        heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self):
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2`,
    time: "O(log n)", space: "O(n)",
    explanation: "small holds the lower half (as a max-heap), large the upper half. Each insert funnels through both heaps to keep them ordered and balanced, so the median is a heap top (or the average of two tops).",
    trace: ["add 1,2,3", "small=[-2,-1], large=[3] → median 2", "add 4 → balanced", "median (2+3)/2 style as sizes change"],
  },
  {
    num: 46, id: "p46", title: "Kth Largest Element (revisit)", category: "Heap", difficulty: "Medium",
    statement: "Return the kth largest element — reinforce heap selection.",
    link: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    idea: "Heap-based selection of the top k; the kth largest is the smallest of them.",
    code: `import heapq

def findKthLargest(nums, k):
    return heapq.nlargest(k, nums)[-1]`,
    time: "O(n log k)", space: "O(k)",
    explanation: "Same as #34. For very large arrays a size-k min-heap (push/pop) keeps memory at O(k) while scanning once.",
    trace: ["nums=[3,2,3,1,2,4,5,5,6], k=4", "top-4 → [6,5,5,4]", "last", "answer 4"],
  },
  {
    num: 47, id: "p47", title: "Set Matrix Zeroes", category: "Matrix", difficulty: "Medium",
    statement: "If a cell is 0, set its entire row and column to 0 — in place.",
    link: "https://leetcode.com/problems/set-matrix-zeroes/",
    idea: "Use the first row/column as marker storage; handle them separately.",
    code: `def setZeroes(matrix):
    rows, cols = len(matrix), len(matrix[0])
    row0 = any(matrix[0][j] == 0 for j in range(cols))
    col0 = any(matrix[i][0] == 0 for i in range(rows))

    for i in range(1, rows):
        for j in range(1, cols):
            if matrix[i][j] == 0:
                matrix[i][0] = matrix[0][j] = 0

    for i in range(1, rows):
        for j in range(1, cols):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0

    if row0:
        for j in range(cols): matrix[0][j] = 0
    if col0:
        for i in range(rows): matrix[i][0] = 0`,
    time: "O(mn)", space: "O(1)",
    explanation: "We reuse row 0 and column 0 as flags: a zero in cell (i,j) marks matrix[i][0] and matrix[0][j]. A second pass zeroes flagged cells. The originals of row0/col0 are tracked separately to avoid self-pollution.",
    trace: ["[[1,1,1],[1,0,1],[1,1,1]]", "mark row1,col1 via first row/col", "zero flagged cells", "middle cross becomes 0"],
  },
  {
    num: 48, id: "p48", title: "Rotate Array", category: "Array", difficulty: "Medium",
    statement: "Rotate the array to the right by k steps.",
    link: "https://leetcode.com/problems/rotate-array/",
    idea: "Slice the last k elements to the front (or reverse three times for O(1) space).",
    code: `def rotate(nums, k):
    k %= len(nums)
    nums[:] = nums[-k:] + nums[:-k]`,
    time: "O(n)", space: "O(1)",
    explanation: "k mod n handles k larger than the length. The last k elements move to the front and the rest follow. nums[:] mutates the list in place.",
    trace: ["nums=[1,2,3,4,5], k=2", "last 2 = [4,5]; rest=[1,2,3]", "[4,5]+[1,2,3]", "[4,5,1,2,3]"],
  },
  {
    num: 49, id: "p49", title: "Binary Tree Right Side View (revisit)", category: "Tree", difficulty: "Medium",
    statement: "Right view of a tree — reinforce depth-first level tracking.",
    link: "https://leetcode.com/problems/binary-tree-right-side-view/",
    idea: "DFS right-first, recording the first node at each new depth.",
    code: `def rightSideView(root):
    res = []
    def dfs(node, depth):
        if not node:
            return
        if depth == len(res):
            res.append(node.val)
        dfs(node.right, depth+1)
        dfs(node.left, depth+1)
    dfs(root, 0)
    return res`,
    time: "O(n)", space: "O(h)",
    explanation: "Same approach as #36. The depth==len(res) check ensures only the first (rightmost) node per level is captured.",
    trace: ["balanced tree", "rightmost per level chosen", "left nodes only show if no right at that depth", "right-side list"],
  },
  {
    num: 50, id: "p50", title: "Serialize and Deserialize Binary Tree (revisit)", category: "Design", difficulty: "Hard",
    statement: "Serialize a tree (pre-order). Pair with the deserializer from #37.",
    link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    idea: "Pre-order DFS with null markers produces an unambiguous string.",
    code: `def serialize(root):
    res = []
    def dfs(node):
        if not node:
            res.append('#')
            return
        res.append(str(node.val))
        dfs(node.left)
        dfs(node.right)
    dfs(root)
    return ",".join(res)`,
    time: "O(n)", space: "O(n)",
    explanation: "Recording '#' for nulls makes the pre-order sequence reversible. Combine with the recursive deserializer (problem 37) to reconstruct the exact tree.",
    trace: ["tree 5 / 3,8", "→ '5,3,#,#,8,#,#'", "nulls mark leaf boundaries", "string ready to decode"],
  },
  {
    num: 51, id: "p51", title: "Maximum Depth of Binary Tree (revisit)", category: "Tree", difficulty: "Easy",
    statement: "Height of a binary tree — reinforce simple recursion.",
    link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    idea: "1 + max of children depths.",
    code: `def maxDepth(root):
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))`,
    time: "O(n)", space: "O(h)",
    explanation: "Same base recurrence as #38; useful warm-up for tree DFS and recursion stack depth (O(h)).",
    trace: ["skewed tree depth = node count", "balanced tree depth = log n", "recursion returns max+1", "height computed"],
  },
  {
    num: 52, id: "p52", title: "Symmetric Tree (revisit)", category: "Tree", difficulty: "Easy",
    statement: "Mirror check — reinforce paired recursion.",
    link: "https://leetcode.com/problems/symmetric-tree/",
    idea: "Recurse comparing a.left with b.right and a.right with b.left.",
    code: `def isSymmetric(root):
    def mirror(a, b):
        if not a and not b:
            return True
        if not a or not b:
            return False
        return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)
    return mirror(root, root)`,
    time: "O(n)", space: "O(h)",
    explanation: "Same as #39; the crossed comparison is the key idea behind many 'two-tree' problems.",
    trace: ["asymmetric tree", "value mismatch on crossed children", "returns False early", "non-symmetric detected"],
  },
  {
    num: 53, id: "p53", title: "Flatten Binary Tree (revisit)", category: "Tree", difficulty: "Medium",
    statement: "Flatten to a right-skewed list — reinforce post-order rewiring.",
    link: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
    idea: "Flatten children, then move left chain to the right and append old right.",
    code: `def flatten(root):
    if not root:
        return
    flatten(root.left)
    flatten(root.right)
    tmp = root.right
    root.right = root.left
    root.left = None
    cur = root
    while cur.right:
        cur = cur.right
    cur.right = tmp`,
    time: "O(n)", space: "O(h)",
    explanation: "Same as #40; the post-order order (children before parent) is what makes the in-place splice correct.",
    trace: ["any tree", "subtrees flattened first", "left chain spliced before right", "single right-going list"],
  },
  {
    num: 54, id: "p54", title: "Find Peak Element", category: "Binary Search", difficulty: "Medium",
    statement: "Return the index of any peak (greater than its neighbors).",
    link: "https://leetcode.com/problems/find-peak-element/",
    idea: "Binary search toward the higher neighbor — a peak must exist that way.",
    code: `def findPeakElement(nums):
    l, r = 0, len(nums)-1
    while l < r:
        m = (l + r) // 2
        if nums[m] > nums[m+1]:
            r = m
        else:
            l = m + 1
    return l`,
    time: "O(log n)", space: "O(1)",
    explanation: "If nums[m] > nums[m+1] a peak lies at m or to its left; otherwise the ascending slope guarantees a peak to the right. The search narrows to one index.",
    trace: ["nums=[1,2,3,1]", "m=1 (2<3) → l=2", "m=2 (3>1) → r=2", "l==r=2 → index 2"],
  },
  {
    num: 55, id: "p55", title: "Subsets (revisit)", category: "Backtracking", difficulty: "Medium",
    statement: "Power set — reinforce the choose/skip recursion.",
    link: "https://leetcode.com/problems/subsets/",
    idea: "DFS recording each path and extending with later elements.",
    code: `def subsets(nums):
    res = []
    def dfs(i, path):
        res.append(path)
        for j in range(i, len(nums)):
            dfs(j+1, path+[nums[j]])
    dfs(0, [])
    return res`,
    time: "O(2ⁿ)", space: "O(n)",
    explanation: "Same as #32; this 'start index' template is the backbone of combination problems (combine, combination sum, etc.).",
    trace: ["nums=[1,2,3]", "8 subsets generated", "each recursion node is a subset", "power set returned"],
  },
  {
    num: 56, id: "p56", title: "Permutations (revisit)", category: "Backtracking", difficulty: "Medium",
    statement: "All orderings — reinforce used-set recursion.",
    link: "https://leetcode.com/problems/permutations/",
    idea: "DFS trying each unused element at each position.",
    code: `def permute(nums):
    res = []
    def dfs(path, used):
        if len(path) == len(nums):
            res.append(path)
            return
        for i in range(len(nums)):
            if i in used:
                continue
            dfs(path+[nums[i]], used|{i})
    dfs([], set())
    return res`,
    time: "O(n · n!)", space: "O(n)",
    explanation: "Same as #33; contrast with subsets — permutations need a used set (order matters) rather than a start index.",
    trace: ["nums=[1,2,3]", "n! = 6 permutations", "full-length paths recorded", "all orderings"],
  },
  {
    num: 57, id: "p57", title: "Combination Sum II", category: "Backtracking", difficulty: "Medium",
    statement: "Unique combinations summing to target, each number used once.",
    link: "https://leetcode.com/problems/combination-sum-ii/",
    idea: "Sort, DFS from start index, skip duplicate siblings to avoid repeated combos.",
    code: `def combinationSum2(candidates, target):
    candidates.sort()
    res = []
    def dfs(start, path, total):
        if total == target:
            res.append(path)
            return
        if total > target:
            return
        for i in range(start, len(candidates)):
            if i > start and candidates[i] == candidates[i-1]:
                continue
            dfs(i+1, path+[candidates[i]], total+candidates[i])
    dfs(0, [], 0)
    return res`,
    time: "Exponential", space: "O(n)",
    explanation: "Sorting groups duplicates; skipping equal siblings (i>start and equal to previous) prevents duplicate combinations. We pass i+1 so each element is used at most once.",
    trace: ["cands=[1,1,2,5,6], target=8", "skip second '1' at same level", "valid combos like [1,1,6],[2,6]", "no duplicates"],
  },
  {
    num: 58, id: "p58", title: "Gas Station", category: "Greedy", difficulty: "Medium",
    statement: "Find the start index to complete the circular route, or -1.",
    link: "https://leetcode.com/problems/gas-station/",
    idea: "If total gas ≥ total cost, a unique start exists; reset start whenever the tank goes negative.",
    code: `def canCompleteCircuit(gas, cost):
    total = tank = start = 0
    for i in range(len(gas)):
        total += gas[i] - cost[i]
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    return start if total >= 0 else -1`,
    time: "O(n)", space: "O(1)",
    explanation: "A negative running tank means no station up to i can be the start, so we jump start past i. If overall gas covers overall cost, the surviving start completes the loop.",
    trace: ["gas=[1,2,3,4,5], cost=[3,4,5,1,2]", "tank dips early → start moves to 3", "from 3 tank stays ≥0; total≥0", "answer 3"],
  },
  {
    num: 59, id: "p59", title: "Valid Sudoku", category: "Matrix", difficulty: "Medium",
    statement: "Check if a 9×9 Sudoku board is valid (no rule violations).",
    link: "https://leetcode.com/problems/valid-sudoku/",
    idea: "Track seen digits per row, column, and 3×3 box using sets.",
    code: `def isValidSudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == '.':
                continue
            b = (r//3)*3 + c//3
            if v in rows[r] or v in cols[c] or v in boxes[b]:
                return False
            rows[r].add(v)
            cols[c].add(v)
            boxes[b].add(v)
    return True`,
    time: "O(1)", space: "O(1)",
    explanation: "Each digit must be unique within its row, column, and box. The box index (r//3)*3 + c//3 maps a cell to one of nine boxes. Any repeat fails. (Constant since the board is fixed 9×9.)",
    trace: ["scan cells", "place each digit in its row/col/box set", "duplicate found → False", "all unique → True"],
  },
  {
    num: 60, id: "p60", title: "Sudoku Solver", category: "Backtracking", difficulty: "Hard",
    statement: "Fill a Sudoku board to satisfy all constraints.",
    link: "https://leetcode.com/problems/sudoku-solver/",
    idea: "Backtracking: try 1–9 in each empty cell, recurse, undo on failure.",
    code: `def solveSudoku(board):
    def valid(r, c, v):
        for i in range(9):
            if board[r][i] == v or board[i][c] == v:
                return False
            if board[(r//3)*3+i//3][(c//3)*3+i%3] == v:
                return False
        return True

    def dfs():
        for r in range(9):
            for c in range(9):
                if board[r][c] == '.':
                    for v in "123456789":
                        if valid(r, c, v):
                            board[r][c] = v
                            if dfs():
                                return True
                            board[r][c] = '.'
                    return False
        return True

    dfs()`,
    time: "Exponential", space: "O(1)",
    explanation: "Find the next empty cell, try each legal digit, and recurse. If a choice leads to a dead end, undo it ('.') and try the next. Returning True only when the whole board is filled.",
    trace: ["first empty cell", "try '1' if valid → recurse", "dead end → reset, try next digit", "solution fills board"],
  },
  {
    num: 61, id: "p61", title: "Meeting Rooms II", category: "Intervals", difficulty: "Medium",
    statement: "Minimum number of rooms to host all meetings.",
    link: "https://leetcode.com/problems/meeting-rooms-ii/",
    idea: "Sort by start; a min-heap of end times tells how many rooms are in use.",
    code: `import heapq

def minMeetingRooms(intervals):
    intervals.sort()
    heap = []
    for s,e in intervals:
        if heap and heap[0] <= s:
            heapq.heappop(heap)
        heapq.heappush(heap, e)
    return len(heap)`,
    time: "O(n log n)", space: "O(n)",
    explanation: "Process meetings by start time. If the earliest-ending room (heap top) is free by the new start, reuse it (pop). Always push the new end. The heap size is the peak room count.",
    trace: ["[[0,30],[5,10],[15,20]]", "push 30; 5<30 push 10 (2 rooms)", "15≥10 pop, push 20", "max rooms = 2"],
  },
  {
    num: 62, id: "p62", title: "Task Scheduler", category: "Greedy", difficulty: "Medium",
    statement: "Minimum time to run tasks with a cooldown n between same tasks.",
    link: "https://leetcode.com/problems/task-scheduler/",
    idea: "The most frequent task fixes the skeleton; fill gaps, else tasks pack tight.",
    code: `from collections import Counter

def leastInterval(tasks, n):
    freq = Counter(tasks)
    maxf = max(freq.values())
    cnt = sum(1 for v in freq.values() if v == maxf)
    return max(len(tasks), (maxf-1)*(n+1) + cnt)`,
    time: "O(n)", space: "O(1)",
    explanation: "Arrange the most frequent task into (maxf-1) blocks of size n+1, then append the cnt tasks that share the max frequency. If there are enough other tasks to fill gaps, the answer is simply len(tasks).",
    trace: ["tasks=AAABBB, n=2", "maxf=3, cnt=2 → (3-1)*3+2=8", "len=6 < 8", "answer 8"],
  },
  {
    num: 63, id: "p63", title: "Alien Dictionary", category: "Graph", difficulty: "Hard",
    statement: "Derive a character order from a sorted list of alien words.",
    link: "https://leetcode.com/problems/alien-dictionary/",
    idea: "Build a precedence graph from adjacent word pairs, then topological sort.",
    code: `from collections import defaultdict, deque

def alienOrder(words):
    graph = defaultdict(set)
    indeg = {c:0 for w in words for c in w}

    for w1, w2 in zip(words, words[1:]):
        for a,b in zip(w1, w2):
            if a != b:
                if b not in graph[a]:
                    graph[a].add(b)
                    indeg[b] += 1
                break
        else:
            if len(w1) > len(w2):
                return ""

    q = deque([c for c in indeg if indeg[c] == 0])
    res = []
    while q:
        c = q.popleft()
        res.append(c)
        for nei in graph[c]:
            indeg[nei] -= 1
            if indeg[nei] == 0:
                q.append(nei)
    return "".join(res) if len(res) == len(indeg) else ""`,
    time: "O(V + E)", space: "O(V)",
    explanation: "The first differing character between consecutive words gives an ordering edge a→b. A prefix appearing after its extension is invalid. Topological sort yields the alphabet; a leftover (cycle) returns ''.",
    trace: ["words=['wrt','wrf','er']", "t→f, w→e edges", "topo order w,e,r,t,f", "valid ordering"],
  },
  {
    num: 64, id: "p64", title: "Longest Consecutive Sequence (revisit)", category: "Hashing", difficulty: "Medium",
    statement: "Longest run of consecutive integers — reinforce the set-start trick.",
    link: "https://leetcode.com/problems/longest-consecutive-sequence/",
    idea: "Hash set; expand only from sequence starts (n-1 absent).",
    code: `def longestConsecutive(nums):
    s = set(nums)
    best = 0
    for n in s:
        if n-1 not in s:
            cur, length = n, 1
            while cur+1 in s:
                cur += 1
                length += 1
            best = max(best, length)
    return best`,
    time: "O(n)", space: "O(n)",
    explanation: "Same as #3. The 'only start from a run beginning' rule is what keeps the nested while loop amortized O(n).",
    trace: ["nums=[0,3,7,2,5,8,4,6,0,1]", "start 0 → 0..8 length 9", "best=9", "answer 9"],
  },
  {
    num: 65, id: "p65", title: "Edit Distance", category: "Dynamic Programming", difficulty: "Hard",
    statement: "Minimum insert/delete/replace operations to convert word a into b.",
    link: "https://leetcode.com/problems/edit-distance/",
    idea: "2D DP: dp[i][j] = edit distance between prefixes a[:i] and b[:j].",
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
    time: "O(mn)", space: "O(mn)",
    explanation: "Matching characters cost nothing (carry the diagonal). Otherwise take 1 + the best of delete (up), insert (left), or replace (diagonal). Base rows/cols are pure insertions/deletions.",
    trace: ["a='horse', b='ros'", "dp fills by prefixes", "h→'' costs, etc.", "answer 3"],
  },
  {
    num: 66, id: "p66", title: "Burst Balloons", category: "Dynamic Programming", difficulty: "Hard",
    statement: "Maximize coins from bursting balloons (coins = left·k·right).",
    link: "https://leetcode.com/problems/burst-balloons/",
    idea: "Interval DP on which balloon is burst LAST in each range.",
    code: `def maxCoins(nums):
    nums = [1] + nums + [1]
    n = len(nums)
    dp = [[0]*n for _ in range(n)]
    for length in range(2, n):
        for l in range(n-length):
            r = l + length
            for k in range(l+1, r):
                dp[l][r] = max(dp[l][r],
                               nums[l]*nums[k]*nums[r] + dp[l][k] + dp[k][r])
    return dp[0][-1]`,
    time: "O(n³)", space: "O(n²)",
    explanation: "Choosing k as the last balloon burst in (l,r) means its neighbors are the padded boundaries l and r, giving nums[l]*nums[k]*nums[r] plus the two independent subranges. We try every k for every interval.",
    trace: ["nums=[3,1,5,8] padded", "fill by interval length", "best last-burst combos accumulate", "answer 167"],
  },
  {
    num: 67, id: "p67", title: "Word Ladder", category: "Graph", difficulty: "Hard",
    statement: "Shortest transformation length from begin to end, one letter at a time.",
    link: "https://leetcode.com/problems/word-ladder/",
    idea: "BFS over words; neighbors differ by exactly one letter.",
    code: `from collections import deque

def ladderLength(begin, end, wordList):
    wordList = set(wordList)
    q = deque([(begin, 1)])
    while q:
        w, d = q.popleft()
        if w == end:
            return d
        for i in range(len(w)):
            for c in "abcdefghijklmnopqrstuvwxyz":
                nw = w[:i] + c + w[i+1:]
                if nw in wordList:
                    wordList.remove(nw)
                    q.append((nw, d+1))
    return 0`,
    time: "O(n · 26 · L)", space: "O(n)",
    explanation: "BFS guarantees the shortest path. From each word we generate all one-letter variations; those present in the dictionary are unvisited neighbors. Removing words as we enqueue them prevents revisits.",
    trace: ["hit → hot → dot → dog → cog", "each step changes one letter", "BFS finds shortest = 5", "answer 5"],
  },
  {
    num: 68, id: "p68", title: "Palindromic Substrings", category: "Dynamic Programming", difficulty: "Medium",
    statement: "Count palindromic substrings in a string.",
    link: "https://leetcode.com/problems/palindromic-substrings/",
    idea: "Expand around each center (odd and even) and count matches.",
    code: `def countSubstrings(s):
    res = 0
    for i in range(len(s)):
        for l, r in [(i,i), (i,i+1)]:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                res += 1
                l -= 1
                r += 1
    return res`,
    time: "O(n²)", space: "O(1)",
    explanation: "Every palindrome has a center — a single char (odd length) or a gap between two chars (even). Expanding outward while characters match counts each palindrome exactly once.",
    trace: ["s='aaa'", "centers expand: 'a'×3, 'aa'×2, 'aaa'×1", "total 6", "answer 6"],
  },
  {
    num: 69, id: "p69", title: "Find the Duplicate Number", category: "Two Pointers", difficulty: "Medium",
    statement: "Find the one duplicate in [1..n] without modifying the array.",
    link: "https://leetcode.com/problems/find-the-duplicate-number/",
    idea: "Floyd's cycle detection treating values as next-index pointers.",
    code: `def findDuplicate(nums):
    slow = fast = nums[0]
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow`,
    time: "O(n)", space: "O(1)",
    explanation: "Values 1..n acting as pointers form a linked list with a cycle whose entrance is the duplicate. Floyd's tortoise/hare finds the meeting point, then a second walk from the start locates the cycle entry.",
    trace: ["nums=[1,3,4,2,2]", "phase 1: slow/fast meet inside cycle", "phase 2: walk from start to entrance", "duplicate 2"],
  },
  {
    num: 70, id: "p70", title: "Binary Tree Maximum Path Sum", category: "Tree", difficulty: "Hard",
    statement: "Maximum sum of any node-to-node path.",
    link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    idea: "DFS returning the best downward gain; update a global with left+node+right.",
    code: `def maxPathSum(root):
    res = float('-inf')
    def dfs(node):
        nonlocal res
        if not node:
            return 0
        l = max(dfs(node.left), 0)
        r = max(dfs(node.right), 0)
        res = max(res, node.val + l + r)
        return node.val + max(l, r)
    dfs(root)
    return res`,
    time: "O(n)", space: "O(h)",
    explanation: "Negative subtree gains are clamped to 0 (skip them). At each node the best path 'through' it is node + left + right, which updates the global max; but a node can only extend one side upward.",
    trace: ["tree -10 / 9,20 / _,_,15,7", "best through 20 = 20+15+7=42", "global max 42", "answer 42"],
  },
  {
    num: 71, id: "p71", title: "Minimum Cost to Cut a Stick", category: "Dynamic Programming", difficulty: "Hard",
    statement: "Minimum total cost to perform all cuts on a stick.",
    link: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
    idea: "Interval DP over sorted cut positions (with 0 and n as boundaries).",
    code: `def minCost(n, cuts):
    cuts = [0] + sorted(cuts) + [n]
    m = len(cuts)
    dp = [[0]*m for _ in range(m)]
    for length in range(2, m):
        for i in range(m-length):
            j = i + length
            dp[i][j] = min(
                cuts[j] - cuts[i] + dp[i][k] + dp[k][j]
                for k in range(i+1, j)
            )
    return dp[0][-1]`,
    time: "O(n³)", space: "O(n²)",
    explanation: "Cost of a cut equals the current segment length (cuts[j]-cuts[i]). Choosing which cut k to make first in a segment splits it into two independent subproblems; try every k.",
    trace: ["n=7, cuts=[1,3,4,5]", "pad → [0,1,3,4,5,7]", "DP over intervals", "answer 16"],
  },
  {
    num: 72, id: "p72", title: "Regular Expression Matching", category: "Dynamic Programming", difficulty: "Hard",
    statement: "Match a string against a pattern with '.' and '*'.",
    link: "https://leetcode.com/problems/regular-expression-matching/",
    idea: "2D DP: dp[i][j] = does s[:i] match p[:j].",
    code: `def isMatch(s, p):
    dp = [[False]*(len(p)+1) for _ in range(len(s)+1)]
    dp[0][0] = True

    for j in range(2, len(p)+1):
        if p[j-1] == '*':
            dp[0][j] = dp[0][j-2]

    for i in range(1, len(s)+1):
        for j in range(1, len(p)+1):
            if p[j-1] in {s[i-1], '.'}:
                dp[i][j] = dp[i-1][j-1]
            elif p[j-1] == '*':
                dp[i][j] = dp[i][j-2] or \\
                           (p[j-2] in {s[i-1], '.'} and dp[i-1][j])
    return dp[-1][-1]`,
    time: "O(mn)", space: "O(mn)",
    explanation: "A normal/'.' char matches by carrying the diagonal. '*' either drops the pair (zero occurrences → dp[i][j-2]) or consumes one s char if the preceding pattern char matches (dp[i-1][j]).",
    trace: ["s='aab', p='c*a*b'", "c* matches zero c's", "a* matches 'aa', b matches", "True"],
  },
  {
    num: 73, id: "p73", title: "Maximal Rectangle", category: "Stack", difficulty: "Hard",
    statement: "Largest rectangle of 1's in a binary matrix.",
    link: "https://leetcode.com/problems/maximal-rectangle/",
    idea: "Build per-row histograms of consecutive 1's and run largest-rectangle-in-histogram each row.",
    code: `def maximalRectangle(matrix):
    if not matrix:
        return 0
    heights = [0]*len(matrix[0])
    res = 0
    for row in matrix:
        for i,v in enumerate(row):
            heights[i] = heights[i]+1 if v=='1' else 0
        stack = []
        for i,h in enumerate(heights+[0]):
            while stack and heights[stack[-1]] > h:
                H = heights[stack.pop()]
                W = i if not stack else i-stack[-1]-1
                res = max(res, H*W)
            stack.append(i)
    return res`,
    time: "O(mn)", space: "O(n)",
    explanation: "Treat each row as the base of a histogram where column heights accumulate consecutive 1's. The maximal rectangle is the best histogram rectangle over all rows (problem 74's technique).",
    trace: ["matrix rows → heights e.g. [3,1,3,2,2]", "histogram max per row", "track global best", "largest area"],
  },
  {
    num: 74, id: "p74", title: "Largest Rectangle in Histogram", category: "Stack", difficulty: "Hard",
    statement: "Largest rectangle area under a histogram.",
    link: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    idea: "Monotonic increasing stack of indices; pop to compute areas when a shorter bar appears.",
    code: `def largestRectangleArea(heights):
    stack, res = [], 0
    for i,h in enumerate(heights+[0]):
        while stack and heights[stack[-1]] > h:
            H = heights[stack.pop()]
            W = i if not stack else i-stack[-1]-1
            res = max(res, H*W)
        stack.append(i)
    return res`,
    time: "O(n)", space: "O(n)",
    explanation: "We keep a stack of increasing bar indices. When a shorter bar arrives, taller bars can't extend past it, so we pop and compute their maximal width (bounded by the new bar and the previous stack item). A trailing 0 flushes the stack.",
    trace: ["heights=[2,1,5,6,2,3]", "pop 6→area 6, pop 5→area 10", "best 10", "answer 10"],
  },
  {
    num: 75, id: "p75", title: "Median of Two Sorted Arrays (revisit)", category: "Binary Search", difficulty: "Hard",
    statement: "Median in O(log) — reinforce partition binary search (same as #13).",
    link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    idea: "Binary search the partition of the smaller array so left ≤ right across both.",
    code: `def findMedianSortedArrays(a, b):
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    l, r = 0, m
    while l <= r:
        i = (l + r) // 2
        j = (m + n + 1) // 2 - i
        L1 = a[i-1] if i else float('-inf')
        R1 = a[i] if i < m else float('inf')
        L2 = b[j-1] if j else float('-inf')
        R2 = b[j] if j < n else float('inf')
        if L1 <= R2 and L2 <= R1:
            if (m + n) % 2:
                return max(L1, L2)
            return (max(L1, L2) + min(R1, R2)) / 2
        elif L1 > R2:
            r = i - 1
        else:
            l = i + 1`,
    time: "O(log(min(m,n)))", space: "O(1)",
    explanation: "Identical to #13. The crux: find a cut so the combined left half is correctly sized and all left values ≤ all right values; then the median is on the boundary.",
    trace: ["a=[1,2], b=[3,4]", "balanced partition", "even total → average of inner boundary", "median 2.5"],
  },
  {
    num: 76, id: "p76", title: "Count of Smaller Numbers After Self", category: "Dynamic Programming", difficulty: "Hard",
    statement: "For each element, count smaller elements to its right.",
    link: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
    idea: "Modified merge sort: while merging, count right-side elements that slot before each left element.",
    code: `def countSmaller(nums):
    res = [0]*len(nums)
    enum = list(enumerate(nums))

    def sort(arr):
        if len(arr) <= 1:
            return arr
        mid = len(arr)//2
        left, right = sort(arr[:mid]), sort(arr[mid:])
        i = 0
        for l in left:
            while i < len(right) and right[i][1] < l[1]:
                i += 1
            res[l[0]] += i
        return sorted(left+right, key=lambda x: x[1])

    sort(enum)
    return res`,
    time: "O(n log n)", space: "O(n)",
    explanation: "During the merge, for each left element we count how many right-half elements are strictly smaller — those are smaller numbers appearing after it. Carrying original indices lets us record counts in the answer array.",
    trace: ["nums=[5,2,6,1]", "5 has 2 smaller after; 2 has 1; 6 has 1; 1 has 0", "merge-sort counting", "[2,1,1,0]"],
  },
  {
    num: 77, id: "p77", title: "Course Schedule II", category: "Graph", difficulty: "Medium",
    statement: "Return a valid course order, or [] if impossible.",
    link: "https://leetcode.com/problems/course-schedule-ii/",
    idea: "Kahn's topological sort: repeatedly take zero in-degree nodes.",
    code: `from collections import defaultdict, deque

def findOrder(n, prereq):
    g = defaultdict(list)
    indeg = [0]*n
    for a,b in prereq:
        g[b].append(a)
        indeg[a]+=1

    q = deque([i for i in range(n) if indeg[i]==0])
    res=[]
    while q:
        c=q.popleft()
        res.append(c)
        for nei in g[c]:
            indeg[nei]-=1
            if indeg[nei]==0:
                q.append(nei)
    return res if len(res)==n else []`,
    time: "O(V+E)", space: "O(V)",
    explanation: "Start with courses having no prerequisites. Taking a course reduces its dependents' in-degrees; when one hits zero it becomes available. If we can't order all n, a cycle exists.",
    trace: ["n=4, prereq=[[1,0],[2,0],[3,1],[3,2]]", "start 0; then 1,2; then 3", "order [0,1,2,3]", "valid"],
  },
  {
    num: 78, id: "p78", title: "Minimum Number of Refueling Stops", category: "Heap", difficulty: "Hard",
    statement: "Fewest refuels to reach the target.",
    link: "https://leetcode.com/problems/minimum-number-of-refueling-stops/",
    idea: "Greedy with a max-heap: when stranded, refuel from the largest passed station.",
    code: `import heapq

def minRefuelStops(target, fuel, stations):
    heap = []
    i = res = 0
    while fuel < target:
        while i < len(stations) and stations[i][0] <= fuel:
            heapq.heappush(heap, -stations[i][1])
            i += 1
        if not heap:
            return -1
        fuel += -heapq.heappop(heap)
        res += 1
    return res`,
    time: "O(n log n)", space: "O(n)",
    explanation: "Add every reachable station's fuel to a max-heap as 'options'. Whenever you can't reach the target, greedily take the biggest available fuel (one refuel). If no options remain, it's impossible.",
    trace: ["target=100, fuel=10, stations passed", "heap collects passed fuels", "pop largest when stuck", "min stops counted"],
  },
  {
    num: 79, id: "p79", title: "Maximum Product Subarray", category: "Dynamic Programming", difficulty: "Medium",
    statement: "Largest product of a contiguous subarray.",
    link: "https://leetcode.com/problems/maximum-product-subarray/",
    idea: "Track both max and min products (a negative can flip min into max).",
    code: `def maxProduct(nums):
    cur_max = cur_min = res = nums[0]
    for n in nums[1:]:
        tmp = cur_max
        cur_max = max(n, tmp*n, cur_min*n)
        cur_min = min(n, tmp*n, cur_min*n)
        res = max(res, cur_max)
    return res`,
    time: "O(n)", space: "O(1)",
    explanation: "Because a negative number swaps the roles of max and min, we maintain both. At each step the new extremes come from n alone, max*n, or min*n. The running best is the answer.",
    trace: ["nums=[2,3,-2,4]", "max:2,6,-2,4; min tracks negatives", "best=6", "answer 6"],
  },
  {
    num: 80, id: "p80", title: "Longest Valid Parentheses", category: "Stack", difficulty: "Hard",
    statement: "Length of the longest valid parentheses substring.",
    link: "https://leetcode.com/problems/longest-valid-parentheses/",
    idea: "Stack of indices with a base marker; valid length = current index − last unmatched index.",
    code: `def longestValidParentheses(s):
    stack = [-1]
    res = 0
    for i,c in enumerate(s):
        if c == '(':
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                res = max(res, i-stack[-1])
    return res`,
    time: "O(n)", space: "O(n)",
    explanation: "The stack holds indices of unmatched '(' plus a base index. On ')', we pop; if the stack empties, this ')' becomes the new base; otherwise the valid run length is i minus the new stack top.",
    trace: ["s=')()())'", "base -1; index1 '(' push", "index2 ')' → len 2; index4 ')' → len 4 then resets", "answer 4"],
  },
];

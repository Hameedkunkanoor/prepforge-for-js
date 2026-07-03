/* =====================================================================
   MICROSOFT — most frequently asked coding interview questions.
   Same schema as PROBLEMS; practiceable in the Playground.
   ===================================================================== */
window.MS_PROBLEMS = [
  { num: 1, id: "m1", title: "Reverse Linked List", category: "Linked List", difficulty: "Easy",
    statement: "Reverse a singly linked list and return the new head.",
    link: "https://leetcode.com/problems/reverse-linked-list/",
    idea: "Iteratively flip each node's next pointer, tracking prev.",
    code: `def reverseList(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev = head
        head = nxt
    return prev`,
    time: "O(n)", space: "O(1)",
    explanation: "Walk the list carrying prev; for each node, remember its next, point it back to prev, then advance. When head is None, prev is the reversed head.",
    trace: ["1→2→3", "prev: None→1→2→1... flips each link", "return 3→2→1"] },

  { num: 2, id: "m2", title: "Add Two Numbers", category: "Linked List", difficulty: "Medium",
    statement: "Two numbers are stored as linked lists in reverse digit order. Add them and return the sum as a linked list.",
    link: "https://leetcode.com/problems/add-two-numbers/",
    idea: "Elementary addition with a running carry, node by node.",
    code: `def addTwoNumbers(l1, l2):
    dummy = cur = ListNode(0)
    carry = 0
    while l1 or l2 or carry:
        s = carry + (l1.val if l1 else 0) + (l2.val if l2 else 0)
        carry, d = divmod(s, 10)
        cur.next = ListNode(d)
        cur = cur.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next`,
    time: "O(max(m,n))", space: "O(max(m,n))",
    explanation: "Because digits are stored least-significant first, we add aligned nodes plus carry, emit the ones digit, and propagate the carry — exactly like long addition.",
    trace: ["342 + 465 (as 2→4→3, 5→6→4)", "2+5=7, 4+6=0 carry1, 3+4+1=8", "7→0→8 = 807"] },

  { num: 3, id: "m3", title: "Copy List with Random Pointer", category: "Linked List", difficulty: "Medium",
    statement: "Deep-copy a linked list where each node also has a random pointer to any node or null.",
    link: "https://leetcode.com/problems/copy-list-with-random-pointer/",
    idea: "Map original→clone in one pass, then wire next/random in a second pass.",
    code: `def copyRandomList(head):
    if not head:
        return None
    clones = {}
    cur = head
    while cur:
        clones[cur] = Node(cur.val)
        cur = cur.next
    cur = head
    while cur:
        clones[cur].neighbors = None  # placeholder if needed
        clones[cur].next = clones.get(cur.next)
        clones[cur].random = clones.get(cur.random)
        cur = cur.next
    return clones[head]`,
    time: "O(n)", space: "O(n)",
    explanation: "First create every clone and store the original→clone mapping. Then set each clone's next and random by looking up the mapped clone of the original's targets.",
    trace: ["build clones map", "wire next & random via map", "return clone of head"] },

  { num: 4, id: "m4", title: "Valid Anagram", category: "Hashing", difficulty: "Easy",
    statement: "Return True if string t is an anagram of string s.",
    link: "https://leetcode.com/problems/valid-anagram/",
    idea: "Equal length and equal character counts.",
    code: `from collections import Counter

def isAnagram(s, t):
    return len(s) == len(t) and Counter(s) == Counter(t)`,
    time: "O(n)", space: "O(1)",
    explanation: "Anagrams use the same multiset of characters, so comparing their frequency maps (Counter) settles it; the length check is a quick reject.",
    trace: ['s="anagram", t="nagaram"', "same counts", "answer True"] },

  { num: 5, id: "m5", title: "Roman to Integer", category: "Strings", difficulty: "Easy",
    statement: "Convert a Roman numeral string to an integer.",
    link: "https://leetcode.com/problems/roman-to-integer/",
    idea: "Add each symbol; subtract when a smaller value precedes a larger one.",
    code: `def romanToInt(s):
    val = {'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000}
    total = 0
    for i, c in enumerate(s):
        if i + 1 < len(s) and val[c] < val[s[i+1]]:
            total -= val[c]
        else:
            total += val[c]
    return total`,
    time: "O(n)", space: "O(1)",
    explanation: "Roman numerals are additive except when a smaller symbol sits before a larger one (IV, IX), which means subtraction; we detect that by peeking at the next symbol.",
    trace: ['"MCMXCIV"', "M+ , C before M → -, M+, X before C → -, ...", "answer 1994"] },

  { num: 6, id: "m6", title: "String to Integer (atoi)", category: "Strings", difficulty: "Medium",
    statement: "Implement atoi: parse a leading optional sign and digits into a 32-bit clamped integer.",
    link: "https://leetcode.com/problems/string-to-integer-atoi/",
    idea: "Trim spaces, read sign, accumulate digits, clamp to int32.",
    code: `def myAtoi(s):
    s = s.lstrip()
    if not s:
        return 0
    sign = 1
    i = 0
    if s[0] in '+-':
        sign = -1 if s[0] == '-' else 1
        i = 1
    num = 0
    while i < len(s) and s[i].isdigit():
        num = num * 10 + int(s[i])
        i += 1
    num *= sign
    return max(-2**31, min(2**31 - 1, num))`,
    time: "O(n)", space: "O(1)",
    explanation: "Skip whitespace, capture an optional sign, then build the number digit by digit until a non-digit, and finally clamp into the signed 32-bit range.",
    trace: ['"   -42abc"', "trim, sign -, digits 42, stop at a", "answer -42"] },

  { num: 7, id: "m7", title: "Reverse Words in a String", category: "Strings", difficulty: "Medium",
    statement: "Reverse the order of words in a string, collapsing extra spaces.",
    link: "https://leetcode.com/problems/reverse-words-in-a-string/",
    idea: "Split on whitespace (drops empties), reverse, join with single spaces.",
    code: `def reverseWords(s):
    return " ".join(s.split()[::-1])`,
    time: "O(n)", space: "O(n)",
    explanation: "str.split() with no args splits on runs of whitespace and ignores leading/trailing spaces, giving clean words; reverse the list and rejoin with single spaces.",
    trace: ['"  the sky  is "', "words [the,sky,is] → reversed", 'answer "is sky the"'] },

  { num: 8, id: "m8", title: "Rotate Image", category: "Matrix", difficulty: "Medium",
    statement: "Rotate an n×n matrix 90° clockwise in place.",
    link: "https://leetcode.com/problems/rotate-image/",
    idea: "Transpose the matrix, then reverse each row.",
    code: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()`,
    time: "O(n²)", space: "O(1)",
    explanation: "Transposing swaps rows and columns; reversing each row then turns that into a 90° clockwise rotation — all done in place without extra storage.",
    trace: ["[[1,2],[3,4]]", "transpose → [[1,3],[2,4]]; reverse rows", "[[3,1],[4,2]]"] },

  { num: 9, id: "m9", title: "Lowest Common Ancestor of a BST", category: "Tree", difficulty: "Medium",
    statement: "Find the lowest common ancestor of two nodes in a binary search tree.",
    link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    idea: "Walk down: go left if both are smaller, right if both larger, else you're at the split (LCA).",
    code: `def lowestCommonAncestor(root, p, q):
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root`,
    time: "O(h)", space: "O(1)",
    explanation: "BST ordering means the LCA is the first node where p and q fall on different sides (or one equals the node). Descend accordingly until that split point.",
    trace: ["p,q on opposite sides of node", "descend until they diverge", "return that node"] },

  { num: 10, id: "m10", title: "Excel Sheet Column Number", category: "Math", difficulty: "Easy",
    statement: "Convert an Excel column title (A, B, …, Z, AA, …) to its column number.",
    link: "https://leetcode.com/problems/excel-sheet-column-number/",
    idea: "Base-26 with A=1: result = result*26 + value(char).",
    code: `def titleToNumber(s):
    n = 0
    for c in s:
        n = n * 26 + (ord(c) - ord('A') + 1)
    return n`,
    time: "O(n)", space: "O(1)",
    explanation: "Column titles are bijective base-26 with digits 1..26. Process left to right, multiplying the running total by 26 and adding each letter's value.",
    trace: ['"AB"', "A→1; 1*26 + 2", "answer 28"] },

  { num: 11, id: "m11", title: "First Unique Character", category: "Hashing", difficulty: "Easy",
    statement: "Return the index of the first non-repeating character in a string, or -1.",
    link: "https://leetcode.com/problems/first-unique-character-in-a-string/",
    idea: "Count characters, then find the first with count 1.",
    code: `from collections import Counter

def firstUniqChar(s):
    cnt = Counter(s)
    for i, c in enumerate(s):
        if cnt[c] == 1:
            return i
    return -1`,
    time: "O(n)", space: "O(1)",
    explanation: "A frequency pass records how often each character appears; a second pass returns the index of the first character whose count is exactly one.",
    trace: ['"leetcode"', "counts; l appears once first", "answer 0"] },

  { num: 12, id: "m12", title: "Move Zeroes", category: "Arrays", difficulty: "Easy",
    statement: "Move all zeroes to the end of the array in place while keeping the order of non-zeroes.",
    link: "https://leetcode.com/problems/move-zeroes/",
    idea: "Two pointers: write non-zeroes forward, then fill the rest with zeroes.",
    code: `def moveZeroes(nums):
    pos = 0
    for n in nums:
        if n != 0:
            nums[pos] = n
            pos += 1
    for i in range(pos, len(nums)):
        nums[i] = 0`,
    time: "O(n)", space: "O(1)",
    explanation: "A write pointer packs the non-zero values at the front preserving order; whatever slots remain after it are zeroed out.",
    trace: ["[0,1,0,3]", "pack 1,3 at front → [1,3,_,_]; zero rest", "[1,3,0,0]"] },

  { num: 13, id: "m13", title: "Best Time to Buy and Sell Stock", category: "Arrays", difficulty: "Easy",
    statement: "Given daily prices, return the maximum profit from one buy then one later sell.",
    link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    idea: "Track the lowest price so far and the best profit against it.",
    code: `def maxProfit(prices):
    low = float('inf')
    best = 0
    for p in prices:
        low = min(low, p)
        best = max(best, p - low)
    return best`,
    time: "O(n)", space: "O(1)",
    explanation: "For each day, the best sell profit is today's price minus the cheapest price seen so far; we keep the running minimum and the running best profit.",
    trace: ["[7,1,5,3,6,4]", "low→1; best when sell at 6: 6-1=5", "answer 5"] },

  { num: 14, id: "m14", title: "Fizz Buzz", category: "Math", difficulty: "Easy",
    statement: "Return the FizzBuzz sequence 1..n: 'Fizz' for multiples of 3, 'Buzz' for 5, 'FizzBuzz' for both.",
    link: "https://leetcode.com/problems/fizz-buzz/",
    idea: "Build each entry from divisibility by 3 and 5.",
    code: `def fizzBuzz(n):
    out = []
    for i in range(1, n + 1):
        s = ("Fizz" if i % 3 == 0 else "") + ("Buzz" if i % 5 == 0 else "")
        out.append(s or str(i))
    return out`,
    time: "O(n)", space: "O(n)",
    explanation: "Concatenate 'Fizz' and/or 'Buzz' based on divisibility; if neither applies the string is empty, so we fall back to the number itself.",
    trace: ["n=5", "1,2,Fizz,4,Buzz", "answer list"] },

  { num: 15, id: "m15", title: "Compare Version Numbers", category: "Strings", difficulty: "Medium",
    statement: "Compare two version strings like 1.01 and 1.001; return -1, 0, or 1.",
    link: "https://leetcode.com/problems/compare-version-numbers/",
    idea: "Split on dots, compare revision integers position by position, padding with 0.",
    code: `def compareVersion(v1, v2):
    a = v1.split('.')
    b = v2.split('.')
    for i in range(max(len(a), len(b))):
        x = int(a[i]) if i < len(a) else 0
        y = int(b[i]) if i < len(b) else 0
        if x != y:
            return 1 if x > y else -1
    return 0`,
    time: "O(n)", space: "O(n)",
    explanation: "Each dot-separated chunk is an integer, so leading zeros don't matter. Compare aligned revisions, treating missing trailing revisions as 0, and return on the first difference.",
    trace: ['"1.01" vs "1.001"', "1==1, 1==1", "answer 0"] },
];

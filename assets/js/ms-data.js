/* =====================================================================
   MICROSOFT — most frequently asked coding interview questions.
   Each has: statement, test cases, 5 progressive hints, Python solution,
   a line-by-line walkthrough, complexity, explanation and trace.
   ===================================================================== */
window.MS_PROBLEMS = [
  {
    num: 1, id: "m1", title: "Reverse Linked List", category: "Linked List", difficulty: "Easy",
    statement: "Reverse a singly linked list and return the new head.",
    link: "https://leetcode.com/problems/reverse-linked-list/",
    idea: "Iteratively flip each node's next pointer, tracking prev.",
    tests: [["to_list(reverseList(make_list([1,2,3])))", "[3, 2, 1]"], ["to_list(reverseList(make_list([1])))", "[1]"], ["to_list(reverseList(make_list([])))", "[]"]],
    hints: [
      "You must change the direction of every next pointer.",
      "Keep three references as you walk: the previous node, the current node, and the next node.",
      "Before you flip current.next, save current.next first — otherwise you lose the rest of the list.",
      "After flipping, advance: prev = current, current = savedNext.",
      "When current becomes None, prev is the new head — return it.",
    ],
    code: `def reverseList(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev = head
        head = nxt
    return prev`,
    lines: [
      { c: "prev = None", e: "The reversed list starts empty; prev will build up backwards and end as the new head." },
      { c: "while head:", e: "Loop until we've processed every node (head reaches the end, None)." },
      { c: "nxt = head.next", e: "Save the next node BEFORE we overwrite the pointer, or we'd lose the remaining list." },
      { c: "head.next = prev", e: "Flip the link: the current node now points backwards to what came before." },
      { c: "prev = head", e: "Move prev forward — the current node is now the head of the reversed portion." },
      { c: "head = nxt", e: "Advance to the saved next node to continue." },
      { c: "return prev", e: "When the loop ends, prev is the last original node = the new head." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Walk the list carrying prev; for each node remember its next, point it back to prev, then advance. When head is None, prev is the reversed head.",
    trace: ["1→2→3", "flip each link, prev grows: 1, 2→1, 3→2→1", "return 3→2→1"],
  },
  {
    num: 2, id: "m2", title: "Add Two Numbers", category: "Linked List", difficulty: "Medium",
    statement: "Two numbers are stored as linked lists in reverse digit order. Add them and return the sum as a linked list.",
    link: "https://leetcode.com/problems/add-two-numbers/",
    idea: "Elementary addition with a running carry, node by node.",
    tests: [["to_list(addTwoNumbers(make_list([2,4,3]), make_list([5,6,4])))", "[7, 0, 8]"], ["to_list(addTwoNumbers(make_list([0]), make_list([0])))", "[0]"], ["to_list(addTwoNumbers(make_list([9,9]), make_list([1])))", "[0, 0, 1]"]],
    hints: [
      "Digits are stored least-significant first, so the heads line up for addition.",
      "Add corresponding digits plus a carry from the previous position.",
      "Use divmod(total, 10) to split into a carry and the digit to store.",
      "Keep going while either list has nodes OR there is still a carry.",
      "Use a dummy head node so you don't special-case the first digit.",
    ],
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
    lines: [
      { c: "dummy = cur = ListNode(0)", e: "A throwaway head so we can always append to cur without checking for the first node." },
      { c: "carry = 0", e: "Carry from the previous digit's addition, starts at 0." },
      { c: "while l1 or l2 or carry:", e: "Continue while either list has digits left, or a final carry remains." },
      { c: "s = carry + (l1.val if l1 else 0) + (l2.val if l2 else 0)", e: "Sum this column: carry plus each list's digit (0 if that list ended)." },
      { c: "carry, d = divmod(s, 10)", e: "divmod splits the sum into the new carry (tens) and the digit to store (ones)." },
      { c: "cur.next = ListNode(d)", e: "Append the ones digit as a new node." },
      { c: "cur = cur.next", e: "Advance the build pointer." },
      { c: "l1 = l1.next if l1 else None", e: "Advance l1 if it still has nodes." },
      { c: "l2 = l2.next if l2 else None", e: "Advance l2 if it still has nodes." },
      { c: "return dummy.next", e: "Skip the dummy to return the real result head." },
    ],
    time: "O(max(m,n))", space: "O(max(m,n))",
    explanation: "Because digits are least-significant first, we add aligned nodes plus carry, emit the ones digit, and propagate the carry — like long addition.",
    trace: ["342 + 465 as 2→4→3, 5→6→4", "2+5=7; 4+6=0 carry1; 3+4+1=8", "7→0→8 = 807"],
  },
  {
    num: 3, id: "m3", title: "Copy List with Random Pointer", category: "Linked List", difficulty: "Medium",
    statement: "Deep-copy a linked list where each node also has a random pointer to any node or null.",
    link: "https://leetcode.com/problems/copy-list-with-random-pointer/",
    idea: "Map original→clone in one pass, then wire next/random in a second pass.",
    tests: [["'deep copy — see explanation'", "'deep copy'"]],
    hints: [
      "You can't set random pointers on the first pass because targets may not be cloned yet.",
      "First create a clone for every original node.",
      "Store the mapping original → clone in a hash map.",
      "On a second pass, use the map to set each clone's next and random.",
      "map.get(None) returns None, which handles null pointers automatically.",
    ],
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
        clones[cur].next = clones.get(cur.next)
        clones[cur].random = clones.get(cur.random)
        cur = cur.next
    return clones[head]`,
    lines: [
      { c: "if not head: return None", e: "Empty list copies to an empty list." },
      { c: "clones = {}", e: "Maps each original node to its freshly-made clone." },
      { c: "while cur: clones[cur] = Node(cur.val)", e: "Pass 1: create every clone (values only, pointers set later)." },
      { c: "clones[cur].next = clones.get(cur.next)", e: "Pass 2: point the clone's next to the clone of the original's next." },
      { c: "clones[cur].random = clones.get(cur.random)", e: "Same for random; .get returns None for a null target." },
      { c: "return clones[head]", e: "The clone of the original head is the new list's head." },
    ],
    time: "O(n)", space: "O(n)",
    explanation: "First create every clone and store original→clone. Then wire next and random by looking up the mapped clone of each original's targets.",
    trace: ["build clones map", "wire next & random via map", "return clone of head"],
  },
  {
    num: 4, id: "m4", title: "Valid Anagram", category: "Hashing", difficulty: "Easy",
    statement: "Return True if string t is an anagram of string s (same characters, same counts, any order).",
    link: "https://leetcode.com/problems/valid-anagram/",
    idea: "Equal length and equal character counts.",
    tests: [["isAnagram('anagram','nagaram')", "True"], ["isAnagram('rat','car')", "False"], ["isAnagram('a','ab')", "False"]],
    hints: [
      "Two strings can only be anagrams if they have the same length.",
      "Anagrams use exactly the same letters the same number of times.",
      "Count how often each character appears in each string.",
      "Python's collections.Counter builds that frequency map for you.",
      "Compare the two Counters for equality — that's the whole check.",
    ],
    code: `from collections import Counter

def isAnagram(s, t):
    return len(s) == len(t) and Counter(s) == Counter(t)`,
    lines: [
      { c: "from collections import Counter", e: "Counter turns any string into a {char: count} frequency map." },
      { c: "len(s) == len(t)", e: "Quick reject: different lengths can never be anagrams (and short-circuits the costly count)." },
      { c: "Counter(s) == Counter(t)", e: "Both frequency maps equal means every character appears the same number of times — the definition of an anagram." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Anagrams share the same multiset of characters, so comparing frequency maps settles it; the length check is a fast reject.",
    trace: ["s='anagram', t='nagaram'", "counts: a3 n1 g1 r1 m1 — equal", "answer True"],
  },
  {
    num: 5, id: "m5", title: "Roman to Integer", category: "Strings", difficulty: "Easy",
    statement: "Convert a Roman numeral string to an integer.",
    link: "https://leetcode.com/problems/roman-to-integer/",
    idea: "Add each symbol; subtract when a smaller value precedes a larger one.",
    tests: [["romanToInt('III')", "3"], ["romanToInt('LVIII')", "58"], ["romanToInt('MCMXCIV')", "1994"]],
    hints: [
      "Map each Roman symbol to its integer value.",
      "Usually you just add values left to right.",
      "The exception: IV, IX, XL, etc. — a smaller symbol before a larger one.",
      "Detect that by comparing each symbol's value with the NEXT symbol's value.",
      "If current < next, subtract current; otherwise add it.",
    ],
    code: `def romanToInt(s):
    val = {'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000}
    total = 0
    for i, c in enumerate(s):
        if i + 1 < len(s) and val[c] < val[s[i+1]]:
            total -= val[c]
        else:
            total += val[c]
    return total`,
    lines: [
      { c: "val = {...}", e: "Lookup table from each Roman letter to its numeric value." },
      { c: "total = 0", e: "Running result." },
      { c: "for i, c in enumerate(s):", e: "Walk each symbol with its index so we can peek at the next one." },
      { c: "if i+1 < len(s) and val[c] < val[s[i+1]]:", e: "Subtractive case: a smaller symbol immediately before a larger one (IV, IX...)." },
      { c: "total -= val[c]", e: "Subtract in that case." },
      { c: "else: total += val[c]", e: "Otherwise add normally." },
      { c: "return total", e: "The accumulated value is the integer." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Roman numerals are additive except when a smaller symbol precedes a larger one, which means subtraction; peek at the next symbol to detect it.",
    trace: ["'MCMXCIV'", "M+, C before M →-, M+, X before C →-, ...", "1994"],
  },
  {
    num: 6, id: "m6", title: "String to Integer (atoi)", category: "Strings", difficulty: "Medium",
    statement: "Implement atoi: parse a leading optional sign and digits into a 32-bit clamped integer.",
    link: "https://leetcode.com/problems/string-to-integer-atoi/",
    idea: "Trim spaces, read sign, accumulate digits, clamp to int32.",
    tests: [["myAtoi('42')", "42"], ["myAtoi('   -42abc')", "-42"], ["myAtoi('4193 with words')", "4193"]],
    hints: [
      "Handle the pieces in order: whitespace, sign, digits, then stop.",
      "Strip leading spaces first.",
      "Check for a leading '+' or '-' and remember the sign.",
      "Read digits until a non-digit; build the number as num*10 + digit.",
      "Clamp the final value into the signed 32-bit range.",
    ],
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
    lines: [
      { c: "s = s.lstrip()", e: "Remove leading whitespace." },
      { c: "if not s: return 0", e: "Nothing left → value is 0." },
      { c: "if s[0] in '+-':", e: "Optional sign; set sign and skip that character." },
      { c: "while i < len(s) and s[i].isdigit():", e: "Consume consecutive digits, stopping at the first non-digit." },
      { c: "num = num * 10 + int(s[i])", e: "Shift the number left one decimal place and add the new digit." },
      { c: "num *= sign", e: "Apply the sign." },
      { c: "return max(-2**31, min(2**31-1, num))", e: "Clamp into the 32-bit signed integer range." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Skip whitespace, capture an optional sign, build the number digit by digit until a non-digit, then clamp into int32.",
    trace: ["'   -42abc'", "trim, sign -, digits 42, stop at a", "answer -42"],
  },
  {
    num: 7, id: "m7", title: "Reverse Words in a String", category: "Strings", difficulty: "Medium",
    statement: "Reverse the order of words in a string, collapsing extra spaces.",
    link: "https://leetcode.com/problems/reverse-words-in-a-string/",
    idea: "Split on whitespace (drops empties), reverse, join with single spaces.",
    tests: [["reverseWords('the sky is blue')", "'blue is sky the'"], ["reverseWords('  hello world  ')", "'world hello'"], ["reverseWords('a good   example')", "'example good a'"]],
    hints: [
      "Think in terms of whole words, not characters.",
      "How do you split a string into words while ignoring extra spaces?",
      "str.split() with no argument splits on any run of whitespace and drops empties.",
      "Reverse the resulting list of words.",
      "Join them back with a single space.",
    ],
    code: `def reverseWords(s):
    return " ".join(s.split()[::-1])`,
    lines: [
      { c: "s.split()", e: "Split on runs of whitespace, ignoring leading/trailing spaces → clean word list." },
      { c: "[::-1]", e: "Reverse the list of words." },
      { c: '" ".join(...)', e: "Rejoin with single spaces to produce the final string." },
    ],
    time: "O(n)", space: "O(n)",
    explanation: "split() gives clean words regardless of extra spaces; reverse the list and join with single spaces.",
    trace: ["'  the sky  is '", "words [the,sky,is] → reversed", "'is sky the'"],
  },
  {
    num: 8, id: "m8", title: "Rotate Image", category: "Matrix", difficulty: "Medium",
    statement: "Rotate an n×n matrix 90° clockwise in place.",
    link: "https://leetcode.com/problems/rotate-image/",
    idea: "Transpose the matrix, then reverse each row.",
    tests: [["m=[[1,2],[3,4]]; rotate(m); m", "[[3, 1], [4, 2]]"], ["m=[[1,2,3],[4,5,6],[7,8,9]]; rotate(m); m", "[[7, 4, 1], [8, 5, 2], [9, 6, 3]]"]],
    hints: [
      "A 90° clockwise rotation can be built from two simpler operations.",
      "First operation: transpose (swap element [i][j] with [j][i]).",
      "Only swap for j > i so you don't undo the swap.",
      "Second operation: reverse each row.",
      "Do both in place to use O(1) extra space.",
    ],
    code: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()`,
    lines: [
      { c: "n = len(matrix)", e: "Side length of the square matrix." },
      { c: "for j in range(i + 1, n):", e: "Iterate the upper triangle only (j>i) so each pair is swapped once." },
      { c: "matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]", e: "Transpose: mirror across the main diagonal." },
      { c: "for row in matrix: row.reverse()", e: "Reverse each row → transpose + reverse = 90° clockwise." },
    ],
    time: "O(n²)", space: "O(1)",
    explanation: "Transposing swaps rows and columns; reversing each row then yields a clockwise rotation — all in place.",
    trace: ["[[1,2],[3,4]]", "transpose → [[1,3],[2,4]]; reverse rows", "[[3,1],[4,2]]"],
  },
  {
    num: 9, id: "m9", title: "Lowest Common Ancestor of a BST", category: "Tree", difficulty: "Medium",
    statement: "Find the lowest common ancestor of two nodes p and q in a binary search tree.",
    link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    idea: "Walk down: go left if both are smaller, right if both larger, else you're at the split (LCA).",
    tests: [["'walk down BST'", "'the split node'"]],
    hints: [
      "Use the BST ordering property — you don't need to search both subtrees.",
      "If both p and q are smaller than the current node, the LCA is in the left subtree.",
      "If both are larger, it's in the right subtree.",
      "Otherwise they split here (or one equals the node) — this node is the LCA.",
      "Iterate down from the root; no recursion needed.",
    ],
    code: `def lowestCommonAncestor(root, p, q):
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root`,
    lines: [
      { c: "while root:", e: "Descend from the root until we find the split." },
      { c: "if p.val < root.val and q.val < root.val: root = root.left", e: "Both smaller → both live in the left subtree." },
      { c: "elif p.val > root.val and q.val > root.val: root = root.right", e: "Both larger → go right." },
      { c: "else: return root", e: "They diverge here (or one is this node) → this is the lowest common ancestor." },
    ],
    time: "O(h)", space: "O(1)",
    explanation: "BST ordering means the LCA is the first node where p and q fall on different sides; descend until that split.",
    trace: ["p,q on opposite sides of a node", "descend until they diverge", "return that node"],
  },
  {
    num: 10, id: "m10", title: "Excel Sheet Column Number", category: "Math", difficulty: "Easy",
    statement: "Convert an Excel column title (A, B, …, Z, AA, …) to its column number.",
    link: "https://leetcode.com/problems/excel-sheet-column-number/",
    idea: "Base-26 with A=1: result = result*26 + value(char).",
    tests: [["titleToNumber('A')", "1"], ["titleToNumber('AB')", "28"], ["titleToNumber('ZY')", "701"]],
    hints: [
      "This is like reading a number in base 26.",
      "But there's no zero — A is 1, Z is 26.",
      "Convert each letter: ord(c) - ord('A') + 1.",
      "Process left to right, like Horner's method.",
      "result = result * 26 + value(letter).",
    ],
    code: `def titleToNumber(s):
    n = 0
    for c in s:
        n = n * 26 + (ord(c) - ord('A') + 1)
    return n`,
    lines: [
      { c: "n = 0", e: "Running column number." },
      { c: "for c in s:", e: "Process each letter left to right (most significant first)." },
      { c: "n = n * 26 + (ord(c) - ord('A') + 1)", e: "Shift left one base-26 place (×26) and add this letter's value (A=1..Z=26)." },
      { c: "return n", e: "The accumulated value is the column number." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Column titles are bijective base-26 with digits 1..26; multiply the running total by 26 and add each letter's value.",
    trace: ["'AB'", "A→1; 1*26 + 2", "answer 28"],
  },
  {
    num: 11, id: "m11", title: "First Unique Character", category: "Hashing", difficulty: "Easy",
    statement: "Return the index of the first non-repeating character in a string, or -1.",
    link: "https://leetcode.com/problems/first-unique-character-in-a-string/",
    idea: "Count characters, then find the first with count 1.",
    tests: [["firstUniqChar('leetcode')", "0"], ["firstUniqChar('loveleetcode')", "2"], ["firstUniqChar('aabb')", "-1"]],
    hints: [
      "You need to know each character's total count before deciding.",
      "One pass to count all characters.",
      "collections.Counter gives you the frequency map.",
      "Second pass over the string in order.",
      "Return the index of the first character whose count is 1.",
    ],
    code: `from collections import Counter

def firstUniqChar(s):
    cnt = Counter(s)
    for i, c in enumerate(s):
        if cnt[c] == 1:
            return i
    return -1`,
    lines: [
      { c: "cnt = Counter(s)", e: "Frequency of every character in one pass." },
      { c: "for i, c in enumerate(s):", e: "Scan the string in original order to keep 'first'." },
      { c: "if cnt[c] == 1: return i", e: "First character seen exactly once is the answer." },
      { c: "return -1", e: "No unique character exists." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Count characters, then return the index of the first with count 1.",
    trace: ["'leetcode'", "l appears once and is first", "answer 0"],
  },
  {
    num: 12, id: "m12", title: "Move Zeroes", category: "Arrays", difficulty: "Easy",
    statement: "Move all zeroes to the end of the array in place, keeping the order of non-zeroes.",
    link: "https://leetcode.com/problems/move-zeroes/",
    idea: "Two pointers: write non-zeroes forward, then fill the rest with zeroes.",
    tests: [["a=[0,1,0,3,12]; moveZeroes(a); a", "[1, 3, 12, 0, 0]"], ["a=[0,0]; moveZeroes(a); a", "[0, 0]"], ["a=[1,2,3]; moveZeroes(a); a", "[1, 2, 3]"]],
    hints: [
      "Keep the relative order of non-zero numbers.",
      "Use a write pointer for where the next non-zero should go.",
      "Scan the array; copy each non-zero to the write position, then advance it.",
      "After the scan, everything from the write pointer onward should be zero.",
      "Fill those trailing slots with 0.",
    ],
    code: `def moveZeroes(nums):
    pos = 0
    for n in nums:
        if n != 0:
            nums[pos] = n
            pos += 1
    for i in range(pos, len(nums)):
        nums[i] = 0`,
    lines: [
      { c: "pos = 0", e: "Write index for the next non-zero value." },
      { c: "for n in nums:", e: "Scan every value." },
      { c: "if n != 0: nums[pos] = n; pos += 1", e: "Pack non-zeros toward the front, preserving order." },
      { c: "for i in range(pos, len(nums)): nums[i] = 0", e: "Zero out the remaining tail." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "A write pointer packs non-zeros at the front in order; remaining slots are set to zero.",
    trace: ["[0,1,0,3]", "pack 1,3 → [1,3,_,_]; zero rest", "[1,3,0,0]"],
  },
  {
    num: 13, id: "m13", title: "Best Time to Buy and Sell Stock", category: "Arrays", difficulty: "Easy",
    statement: "Given daily prices, return the maximum profit from one buy then one later sell (0 if none).",
    link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    idea: "Track the lowest price so far and the best profit against it.",
    tests: [["maxProfit([7,1,5,3,6,4])", "5"], ["maxProfit([7,6,4,3,1])", "0"], ["maxProfit([1,2])", "1"]],
    hints: [
      "You must buy before you sell.",
      "For each day, the best sale is that price minus the cheapest earlier price.",
      "Track the minimum price seen so far as you scan.",
      "Track the best profit = price - min_so_far.",
      "If prices only fall, profit stays 0.",
    ],
    code: `def maxProfit(prices):
    low = float('inf')
    best = 0
    for p in prices:
        low = min(low, p)
        best = max(best, p - low)
    return best`,
    lines: [
      { c: "low = float('inf')", e: "Cheapest price seen so far; start at infinity so the first price sets it." },
      { c: "best = 0", e: "Best profit; 0 means never sell at a loss." },
      { c: "low = min(low, p)", e: "Update the cheapest buying price up to today." },
      { c: "best = max(best, p - low)", e: "Selling today gives p - low; keep the best seen." },
      { c: "return best", e: "Maximum achievable profit." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "For each day the best profit is today's price minus the cheapest earlier price; track running min and best.",
    trace: ["[7,1,5,3,6,4]", "low→1; sell at 6 → 5", "answer 5"],
  },
  {
    num: 14, id: "m14", title: "Fizz Buzz", category: "Math", difficulty: "Easy",
    statement: "Return the FizzBuzz sequence 1..n: 'Fizz' for multiples of 3, 'Buzz' for 5, 'FizzBuzz' for both.",
    link: "https://leetcode.com/problems/fizz-buzz/",
    idea: "Build each entry from divisibility by 3 and 5.",
    tests: [["fizzBuzz(3)", "['1', '2', 'Fizz']"], ["fizzBuzz(5)", "['1', '2', 'Fizz', '4', 'Buzz']"]],
    hints: [
      "Loop from 1 to n.",
      "Check divisibility by 3 and by 5 separately.",
      "Both divisible → 'FizzBuzz'.",
      "Build the word by concatenating 'Fizz' and/or 'Buzz'.",
      "If neither applies, use the number as a string.",
    ],
    code: `def fizzBuzz(n):
    out = []
    for i in range(1, n + 1):
        s = ("Fizz" if i % 3 == 0 else "") + ("Buzz" if i % 5 == 0 else "")
        out.append(s or str(i))
    return out`,
    lines: [
      { c: "for i in range(1, n + 1):", e: "Numbers 1 through n inclusive." },
      { c: 's = ("Fizz" if i%3==0 else "") + ("Buzz" if i%5==0 else "")', e: "Concatenate Fizz and/or Buzz based on divisibility; both gives 'FizzBuzz'." },
      { c: "out.append(s or str(i))", e: "Empty string is falsy → fall back to the number itself." },
      { c: "return out", e: "The assembled sequence." },
    ],
    time: "O(n)", space: "O(n)",
    explanation: "Concatenate 'Fizz'/'Buzz' by divisibility; empty means neither, so use the number.",
    trace: ["n=5", "1,2,Fizz,4,Buzz", "list"],
  },
  {
    num: 15, id: "m15", title: "Compare Version Numbers", category: "Strings", difficulty: "Medium",
    statement: "Compare two version strings like '1.01' and '1.001'; return -1, 0, or 1.",
    link: "https://leetcode.com/problems/compare-version-numbers/",
    idea: "Split on dots, compare revision integers position by position, padding with 0.",
    tests: [["compareVersion('1.01','1.001')", "0"], ["compareVersion('1.0','1.0.0')", "0"], ["compareVersion('0.1','1.1')", "-1"]],
    hints: [
      "Split each version on '.' into revision chunks.",
      "Compare chunks by numeric value, not as strings (so '01' == '1').",
      "Versions can have different numbers of chunks.",
      "Treat missing trailing chunks as 0.",
      "Return on the first differing revision; if all equal, return 0.",
    ],
    code: `def compareVersion(v1, v2):
    a = v1.split('.')
    b = v2.split('.')
    for i in range(max(len(a), len(b))):
        x = int(a[i]) if i < len(a) else 0
        y = int(b[i]) if i < len(b) else 0
        if x != y:
            return 1 if x > y else -1
    return 0`,
    lines: [
      { c: "a = v1.split('.'); b = v2.split('.')", e: "Break each version into its dot-separated revisions." },
      { c: "for i in range(max(len(a), len(b))):", e: "Iterate as many positions as the longer version has." },
      { c: "x = int(a[i]) if i < len(a) else 0", e: "This revision as an integer; 0 if that version ran out (so 1.0 == 1)." },
      { c: "if x != y: return 1 if x > y else -1", e: "First difference decides the comparison." },
      { c: "return 0", e: "All revisions equal → versions are equal." },
    ],
    time: "O(n)", space: "O(n)",
    explanation: "Each dot chunk is an integer so leading zeros don't matter; compare aligned revisions, padding missing ones with 0, and return on the first difference.",
    trace: ["'1.01' vs '1.001'", "1==1, 1==1", "answer 0"],
  },
];

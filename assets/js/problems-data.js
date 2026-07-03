/* =====================================================================
   PROBLEMS — 80 high-frequency FAANG/Uber/Stripe/Salesforce interview
   problems. Each entry: statement, approach, Python solution, complexity,
   a clear explanation, and a step-by-step trace.
   Rendered by problems.js with Prism highlighting + filters.
   ===================================================================== */
window.PROBLEMS = [
  {
    num: 1, id: "p1", title: "Two Sum", category: "Hashing", difficulty: "Easy",
    tests: [
      ["twoSum([2,7,11,15], 9)", "[0, 1]"],
      ["twoSum([3,2,4], 6)", "[1, 2]"],
      ["twoSum([3,3], 6)", "[0, 1]"],
    ],
    hints: [
      "A brute-force double loop works but is O(n²). Can you avoid re-scanning for the second number?",
      "For each number n, the partner you need is exactly target - n. How could you check if you've already seen it?",
      "A hash map lets you look up 'have I seen this value?' in O(1).",
      "Store each value as you go, mapping value → its index.",
      "Before storing n, check if target - n is already a key; if so you have both indices.",
    ],
    lines: [
      { c: "def twoSum(nums, target):", e: "Take the array and the target sum." },
      { c: "    seen = {}", e: "Map of value → index for numbers already scanned." },
      { c: "    for i, n in enumerate(nums):", e: "Walk the array with both index i and value n." },
      { c: "        if target - n in seen:", e: "Have we already seen the complement that completes this pair?" },
      { c: "            return [seen[target - n], i]", e: "Yes — return the earlier index and the current one." },
      { c: "        seen[n] = i", e: "Otherwise remember this value's index for future lookups." },
    ],
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
    tests: [
      ["productExceptSelf([1,2,3,4])", "[24, 12, 8, 6]"],
      ["productExceptSelf([-1,1,0,-3,3])", "[0, 0, 9, 0, 0]"],
    ],
    hints: [
      "Division would be easy, but it's banned (and breaks on zeros). Think in terms of products of the two sides.",
      "res[i] equals the product of everything to the left of i times everything to the right of i.",
      "Compute the left products in one forward pass, storing them directly in the result array.",
      "Then sweep right-to-left, multiplying in a running product of the right side.",
      "Two passes, one output array, no extra space beyond the result.",
    ],
    lines: [
      { c: "def productExceptSelf(nums):", e: "Return products of all other elements." },
      { c: "    res = [1]*len(nums)", e: "Start every slot at 1 (multiplicative identity)." },
      { c: "    p = 1", e: "Running product of everything to the left." },
      { c: "    for i in range(len(nums)):", e: "First pass, left to right." },
      { c: "        res[i] = p", e: "Store the left product for index i (before including nums[i])." },
      { c: "        p *= nums[i]", e: "Now fold nums[i] into the running left product." },
      { c: "    s = 1", e: "Running product of everything to the right." },
      { c: "    for i in range(len(nums)-1,-1,-1):", e: "Second pass, right to left." },
      { c: "        res[i] *= s", e: "Multiply in the right-side product." },
      { c: "        s *= nums[i]", e: "Fold nums[i] into the running right product." },
      { c: "    return res", e: "Each slot now holds left × right = product of all others." },
    ],
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
    tests: [
      ["longestConsecutive([100,4,200,1,3,2])", "4"],
      ["longestConsecutive([0,3,7,2,5,8,4,6,0,1])", "9"],
      ["longestConsecutive([])", "0"],
    ],
    hints: [
      "Sorting gives O(n log n). Can you reach O(n) using a set for O(1) membership tests?",
      "You only want to count each run once. Which element should trigger the counting?",
      "Start counting a run only from its smallest element — the one where n-1 is NOT in the set.",
      "From a start, walk upward (n+1, n+2, …) while the next value exists, counting length.",
      "Each number is touched at most twice, so the total work stays linear.",
    ],
    lines: [
      { c: "def longestConsecutive(nums):", e: "Find the longest run of consecutive integers." },
      { c: "    s = set(nums)", e: "O(1) membership checks; also dedupes." },
      { c: "    best = 0", e: "Longest run seen so far." },
      { c: "    for n in s:", e: "Consider each distinct value." },
      { c: "        if n-1 not in s:", e: "Only start from a run's beginning to avoid recounting." },
      { c: "            cur, length = n, 1", e: "Begin a new run of length 1 at n." },
      { c: "            while cur+1 in s:", e: "Extend upward while the next integer exists." },
      { c: "                cur += 1", e: "Advance to the next value." },
      { c: "                length += 1", e: "Count it." },
      { c: "            best = max(best, length)", e: "Update the longest run." },
      { c: "    return best", e: "The answer." },
    ],
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
    tests: [
      ["maxArea([1,8,6,2,5,4,8,3,7])", "49"],
      ["maxArea([1,1])", "1"],
    ],
    hints: [
      "Trying every pair is O(n²). Can two pointers from the ends do it in one pass?",
      "Area = shorter of the two lines × the distance between them.",
      "Start wide (both ends). The width only shrinks as you move inward.",
      "Since width decreases, the only chance at a bigger area is a taller boundary.",
      "Always move the pointer at the shorter line — moving the taller one can never help.",
    ],
    lines: [
      { c: "def maxArea(height):", e: "Maximize water between two vertical lines." },
      { c: "    l, r = 0, len(height)-1", e: "Two pointers at the far ends (widest container)." },
      { c: "    ans = 0", e: "Best area so far." },
      { c: "    while l < r:", e: "Until the pointers meet." },
      { c: "        ans = max(ans, min(height[l], height[r]) * (r-l))", e: "Area is bounded by the shorter side times the width." },
      { c: "        if height[l] < height[r]:", e: "The left line is the limiting (shorter) one…" },
      { c: "            l += 1", e: "…so move it inward hoping for a taller line." },
      { c: "        else:", e: "Otherwise the right side is the limit." },
      { c: "            r -= 1", e: "Move the right pointer inward." },
      { c: "    return ans", e: "Largest area found." },
    ],
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
    tests: [
      ["trap([0,1,0,2,1,0,1,3,2,1,2,1])", "6"],
      ["trap([4,2,0,3,2,5])", "9"],
    ],
    hints: [
      "Water above a bar depends on the tallest wall to its left and to its right.",
      "Water on bar i = min(maxLeft, maxRight) − height[i].",
      "Precomputing both maxes uses O(n) space. Two pointers can do O(1) space.",
      "Track running left-max and right-max; process whichever side is currently shorter.",
      "The shorter running max is a guaranteed bound for its side, so it's safe to add its trapped water.",
    ],
    lines: [
      { c: "def trap(height):", e: "Total rainwater trapped between bars." },
      { c: "    l, r = 0, len(height)-1", e: "Two pointers from both ends." },
      { c: "    lm = rm = 0", e: "Highest wall seen so far on the left and right." },
      { c: "    res = 0", e: "Accumulated water." },
      { c: "    while l < r:", e: "Converge inward." },
      { c: "        if height[l] < height[r]:", e: "Left wall is the smaller bound → process left." },
      { c: "            lm = max(lm, height[l])", e: "Update left-max." },
      { c: "            res += lm - height[l]", e: "Water on this bar = left-max minus its height." },
      { c: "            l += 1", e: "Advance left." },
      { c: "        else:", e: "Right wall is the smaller bound → process right." },
      { c: "            rm = max(rm, height[r])", e: "Update right-max." },
      { c: "            res += rm - height[r]", e: "Add trapped water on the right bar." },
      { c: "            r -= 1", e: "Advance right." },
      { c: "    return res", e: "Total trapped water." },
    ],
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
    tests: [
      ["lengthOfLongestSubstring('abcabcbb')", "3"],
      ["lengthOfLongestSubstring('bbbbb')", "1"],
      ["lengthOfLongestSubstring('pwwkew')", "3"],
    ],
    hints: [
      "Think of a window [l..r] that always holds unique characters.",
      "When a character repeats inside the window, the left edge must move.",
      "Remember the last index where each character appeared.",
      "On a repeat, jump l to just past the previous occurrence (but never backward).",
      "The answer is the largest window size r − l + 1 seen.",
    ],
    lines: [
      { c: "def lengthOfLongestSubstring(s):", e: "Longest run of distinct characters." },
      { c: "    seen, l, res = {}, 0, 0", e: "last-seen index map, window left edge, best length." },
      { c: "    for r, c in enumerate(s):", e: "Extend the window to the right, char by char." },
      { c: "        if c in seen and seen[c] >= l:", e: "c repeats and its last position is inside the window." },
      { c: "            l = seen[c] + 1", e: "Shrink from the left to just past that duplicate." },
      { c: "        seen[c] = r", e: "Record c's latest index." },
      { c: "        res = max(res, r-l+1)", e: "Update the best window length." },
      { c: "    return res", e: "Longest unique substring length." },
    ],
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
    tests: [
      ["minWindow('ADOBECODEBANC', 'ABC')", "BANC"],
      ["minWindow('a', 'a')", "a"],
    ],
    hints: [
      "You need the smallest window of s that contains every character of t (with multiplicity).",
      "Count how many of each character t requires; track how many are still missing.",
      "Grow the window on the right until nothing is missing (a valid window).",
      "Then shrink from the left past any surplus characters to minimize it.",
      "Record the best valid window, release one required char, and keep scanning.",
    ],
    lines: [
      { c: "need = Counter(t)", e: "How many of each character we still need." },
      { c: "missing = len(t)", e: "Total characters still to be covered." },
      { c: "l = start = end = 0", e: "Window left edge and best window [start, end)." },
      { c: "for r, c in enumerate(s, 1):", e: "r is a 1-based right edge." },
      { c: "    if need[c] > 0: missing -= 1", e: "This char was genuinely required → one fewer missing." },
      { c: "    need[c] -= 1", e: "Consume it (may go negative = surplus)." },
      { c: "    if missing == 0:", e: "Window now covers all of t." },
      { c: "        while need[s[l]] < 0: ... l += 1", e: "Drop surplus chars from the left to tighten." },
      { c: "        if r-l < end-start: start,end = l,r", e: "Save the smallest valid window." },
      { c: "        need[s[l]] += 1; missing += 1; l += 1", e: "Release one required char and keep searching." },
      { c: "return s[start:end]", e: "Smallest window (empty if none)." },
    ],
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
    tests: [
      ["isValid('()[]{}')", "True"],
      ["isValid('([])')", "True"],
      ["isValid('(]')", "False"],
    ],
    hints: [
      "Brackets must close in reverse order of opening — that's the essence of a stack.",
      "Push every opening bracket onto a stack.",
      "On a closing bracket, the top of the stack must be its matching open.",
      "Keep a map from each closing bracket to its opening counterpart.",
      "At the end the stack must be empty (no unclosed opens).",
    ],
    lines: [
      { c: "def isValid(s):", e: "Check balanced, properly nested brackets." },
      { c: "    stack = []", e: "Holds opens waiting to be closed." },
      { c: "    mp = {')':'(', ']':'[', '}':'{'}", e: "Each close maps to its matching open." },
      { c: "    for c in s:", e: "Scan each character." },
      { c: "        if c in mp:", e: "It's a closing bracket." },
      { c: "            if not stack or stack.pop() != mp[c]:", e: "Nothing to match, or the top isn't the right open." },
      { c: "                return False", e: "Mismatch → invalid." },
      { c: "        else:", e: "It's an opening bracket." },
      { c: "            stack.append(c)", e: "Push it to await its close." },
      { c: "    return not stack", e: "Valid only if every open was closed." },
    ],
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
    tests: [
      ["to_list(mergeTwoLists(make_list([1,3,5]), make_list([2,4,6])))", "[1, 2, 3, 4, 5, 6]"],
      ["to_list(mergeTwoLists(make_list([]), make_list([0])))", "[0]"],
    ],
    hints: [
      "Merge like the final step of merge sort: repeatedly take the smaller front node.",
      "A dummy head node removes the special case for building the first element.",
      "Keep a 'cur' pointer that you always attach the next chosen node to.",
      "Advance only the list you took the node from.",
      "When one list runs out, attach the entire remainder of the other.",
    ],
    lines: [
      { c: "def mergeTwoLists(l1, l2):", e: "Merge two sorted linked lists." },
      { c: "    dummy = cur = ListNode(0)", e: "Dummy simplifies head handling; cur builds the result." },
      { c: "    while l1 and l2:", e: "While both lists still have nodes." },
      { c: "        if l1.val < l2.val:", e: "l1's front is smaller…" },
      { c: "            cur.next, l1 = l1, l1.next", e: "…attach it and advance l1." },
      { c: "        else:", e: "Otherwise l2's front is smaller/equal…" },
      { c: "            cur.next, l2 = l2, l2.next", e: "…attach it and advance l2." },
      { c: "        cur = cur.next", e: "Move the build pointer forward." },
      { c: "    cur.next = l1 or l2", e: "Append whatever list still has nodes." },
      { c: "    return dummy.next", e: "Skip the dummy to get the real head." },
    ],
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
    tests: [
      ["to_list(removeNthFromEnd(make_list([1,2,3,4,5]), 2))", "[1, 2, 3, 5]"],
      ["to_list(removeNthFromEnd(make_list([1]), 1))", "[]"],
    ],
    hints: [
      "Removing the nth-from-end is easy if you can stop one node BEFORE it.",
      "Two pointers with a fixed gap let you find that spot in a single pass.",
      "A dummy node before the head handles the case of deleting the head itself.",
      "Advance a fast pointer n+1 steps first to open the gap.",
      "Move both until fast falls off the end; slow now sits right before the target.",
    ],
    lines: [
      { c: "def removeNthFromEnd(head, n):", e: "Delete the nth node from the end." },
      { c: "    dummy = ListNode(0, head)", e: "Sentinel so deleting the head is uniform." },
      { c: "    fast = slow = dummy", e: "Both pointers start at the sentinel." },
      { c: "    for _ in range(n+1):", e: "Open a gap of n+1 between fast and slow." },
      { c: "        fast = fast.next", e: "Advance fast only." },
      { c: "    while fast:", e: "Now move both in lockstep…" },
      { c: "        fast = fast.next", e: "…until fast walks off the end." },
      { c: "        slow = slow.next", e: "slow lands just before the node to remove." },
      { c: "    slow.next = slow.next.next", e: "Unlink the target node." },
      { c: "    return dummy.next", e: "Return the (possibly new) head." },
    ],
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
    tests: [
      ["search([4,5,6,7,0,1,2], 0)", "4"],
      ["search([4,5,6,7,0,1,2], 3)", "-1"],
      ["search([1], 1)", "0"],
    ],
    hints: [
      "It's still O(log n) — binary search, but the array is rotated.",
      "At any mid, at least one of the two halves is fully sorted.",
      "Compare nums[l] with nums[m] to tell which half is the sorted one.",
      "If the target lies within the sorted half's range, search there.",
      "Otherwise it must be in the other half.",
    ],
    lines: [
      { c: "def search(nums, target):", e: "Find target's index in a rotated sorted array." },
      { c: "    l, r = 0, len(nums) - 1", e: "Standard binary-search bounds." },
      { c: "    while l <= r:", e: "Search while the range is non-empty." },
      { c: "        m = (l + r) // 2", e: "Midpoint." },
      { c: "        if nums[m] == target: return m", e: "Direct hit." },
      { c: "        if nums[l] <= nums[m]:", e: "Left half [l..m] is sorted." },
      { c: "            if nums[l] <= target < nums[m]: r = m - 1", e: "Target is inside the sorted left → go left." },
      { c: "            else: l = m + 1", e: "Else search the right half." },
      { c: "        else:", e: "Otherwise the right half [m..r] is sorted." },
      { c: "            if nums[m] < target <= nums[r]: l = m + 1", e: "Target is inside the sorted right → go right." },
      { c: "            else: r = m - 1", e: "Else search the left half." },
      { c: "    return -1", e: "Not found." },
    ],
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
    tests: [
      ["findMin([3,4,5,1,2])", "1"],
      ["findMin([4,5,6,7,0,1,2])", "0"],
      ["findMin([11,13,15,17])", "11"],
    ],
    hints: [
      "The minimum is the single 'drop' point where the rotation happens.",
      "Binary search can locate that pivot in O(log n).",
      "Compare nums[m] to the rightmost element nums[r] to decide which side holds the min.",
      "If nums[m] > nums[r], the pivot is strictly to the right of m.",
      "Otherwise the min is at m or to its left; never discard m in that case.",
    ],
    lines: [
      { c: "def findMin(nums):", e: "Return the smallest element." },
      { c: "    l, r = 0, len(nums) - 1", e: "Search bounds." },
      { c: "    while l < r:", e: "Shrink until a single element remains." },
      { c: "        m = (l + r) // 2", e: "Midpoint." },
      { c: "        if nums[m] > nums[r]:", e: "Mid is bigger than the right end → pivot is to the right." },
      { c: "            l = m + 1", e: "Discard the left half including m." },
      { c: "        else:", e: "Mid ≤ right end → min is at m or left." },
      { c: "            r = m", e: "Keep m as a candidate." },
      { c: "    return nums[l]", e: "l == r converges on the minimum." },
    ],
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
    tests: [
      ["findMedianSortedArrays([1,3], [2])", "2"],
      ["findMedianSortedArrays([1,2], [3,4])", "2.5"],
    ],
    hints: [
      "Merging is O(m+n); the log requirement forces binary search on a partition.",
      "Cut both arrays so the combined left half has exactly half the elements.",
      "A valid cut has every left element ≤ every right element across both arrays.",
      "Binary search the cut position in the SMALLER array; the other cut is derived.",
      "Once valid: odd total → max of left maxes; even → average of the two middle values.",
    ],
    lines: [
      { c: "if len(a) > len(b): a, b = b, a", e: "Binary search the smaller array for speed." },
      { c: "l, r = 0, m", e: "Search the cut index i in a (0..m)." },
      { c: "i = (l + r) // 2", e: "Elements taken from a into the left half." },
      { c: "j = (m + n + 1) // 2 - i", e: "Complementary cut in b so the left half is the right size." },
      { c: "L1, R1 = a[i-1], a[i]", e: "Border values around a's cut (±inf at edges)." },
      { c: "L2, R2 = b[j-1], b[j]", e: "Border values around b's cut." },
      { c: "if L1 <= R2 and L2 <= R1:", e: "Cross conditions hold → correct partition." },
      { c: "    odd -> max(L1,L2)", e: "Odd total: median is the largest left element." },
      { c: "    even -> (max(L1,L2)+min(R1,R2))/2", e: "Even total: average the two middle values." },
      { c: "elif L1 > R2: r = i - 1", e: "a's left is too big → move the cut left." },
      { c: "else: l = i + 1", e: "Otherwise move the cut right." },
    ],
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
    tests: [
      ["levelOrder(TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7))))", "[[3], [9, 20], [15, 7]]"],
      ["levelOrder(None)", "[]"],
    ],
    hints: [
      "Level order is breadth-first — process nodes nearest the root first.",
      "A queue naturally yields nodes in BFS order.",
      "To group by level, note how many nodes are in the queue at the start of each round.",
      "Drain exactly that many nodes to form one level, enqueuing their children.",
      "Collect each level's values into its own sub-list.",
    ],
    lines: [
      { c: "if not root: return []", e: "Empty tree → no levels." },
      { c: "res, q = [], deque([root])", e: "Result list and a BFS queue seeded with the root." },
      { c: "while q:", e: "Process one level per iteration." },
      { c: "    level = []", e: "Values for the current level." },
      { c: "    for _ in range(len(q)):", e: "Snapshot the count — exactly this level's nodes." },
      { c: "        node = q.popleft()", e: "Take the next node in this level." },
      { c: "        level.append(node.val)", e: "Record its value." },
      { c: "        if node.left: q.append(node.left)", e: "Queue children for the next level." },
      { c: "        if node.right: q.append(node.right)", e: "Same for the right child." },
      { c: "    res.append(level)", e: "Finished level goes into the result." },
      { c: "return res", e: "List of levels." },
    ],
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
    tests: [
      ["isValidBST(TreeNode(2, TreeNode(1), TreeNode(3)))", "True"],
      ["isValidBST(TreeNode(5, TreeNode(1), TreeNode(4, TreeNode(3), TreeNode(6))))", "False"],
    ],
    hints: [
      "Checking only node vs. its direct children is NOT enough — think whole-subtree ranges.",
      "Every node must fall strictly within an allowed (low, high) interval.",
      "Pass those bounds down as you recurse.",
      "Going left tightens the upper bound to the node's value; going right tightens the lower bound.",
      "Any node outside its interval makes the entire tree invalid.",
    ],
    lines: [
      { c: "def dfs(node, low, high):", e: "Node must satisfy low < val < high." },
      { c: "    if not node: return True", e: "Empty subtree is trivially valid." },
      { c: "    if not (low < node.val < high):", e: "Value violates its allowed range…" },
      { c: "        return False", e: "…so the tree isn't a BST." },
      { c: "    return dfs(node.left, low, node.val)", e: "Left subtree's values must be below this node." },
      { c: "       and dfs(node.right, node.val, high)", e: "Right subtree's values must be above it." },
      { c: "return dfs(root, -inf, +inf)", e: "Root may be anything to start." },
    ],
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
    tests: [
      ["diameterOfBinaryTree(TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3)))", "3"],
      ["diameterOfBinaryTree(TreeNode(1, TreeNode(2)))", "1"],
    ],
    hints: [
      "The longest path may not pass through the root at all.",
      "For any node, the longest path through it = left height + right height.",
      "Compute heights bottom-up with a single DFS.",
      "Keep a running maximum of left+right across every node.",
      "Return that maximum (measured in edges).",
    ],
    lines: [
      { c: "ans = 0", e: "Best diameter (in edges) found so far." },
      { c: "def dfs(node):", e: "Returns the height of this subtree." },
      { c: "    if not node: return 0", e: "Empty subtree has height 0." },
      { c: "    l = dfs(node.left)", e: "Height of the left subtree." },
      { c: "    r = dfs(node.right)", e: "Height of the right subtree." },
      { c: "    ans = max(ans, l + r)", e: "Path through this node spans both sides." },
      { c: "    return 1 + max(l, r)", e: "This subtree's height for the parent." },
      { c: "dfs(root); return ans", e: "Largest span over all nodes." },
    ],
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
    tests: [
      ["numIslands([['1','1','0'],['0','1','0'],['0','0','1']])", "2"],
      ["numIslands([['1','1','1'],['1','1','1']])", "1"],
    ],
    hints: [
      "Each island is a connected group of '1' cells (up/down/left/right).",
      "Scan every cell; when you find unvisited land, you've discovered a new island.",
      "Flood-fill that island so you don't count its cells again.",
      "Sink visited land by overwriting '1' with '0'.",
      "The number of flood-fills you launch is the island count.",
    ],
    lines: [
      { c: "def dfs(r, c):", e: "Flood-fill from cell (r, c)." },
      { c: "    if out of bounds or grid[r][c]=='0': return", e: "Stop at edges and water." },
      { c: "    grid[r][c] = '0'", e: "Sink this land so it isn't revisited." },
      { c: "    dfs(up/down/left/right)", e: "Spread to the four neighbors." },
      { c: "count = 0", e: "Islands found so far." },
      { c: "for r in ...: for c in ...:", e: "Scan every cell." },
      { c: "    if grid[r][c] == '1':", e: "Unvisited land = a fresh island." },
      { c: "        dfs(r, c); count += 1", e: "Sink the whole island and tally it." },
      { c: "return count", e: "Total islands." },
    ],
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
    tests: [
      ["cloneGraph(Node(1)).val", "1"],
      ["a=Node(1); b=Node(2); a.neighbors=[b]; b.neighbors=[a]; cloneGraph(a).neighbors[0].val", "2"],
    ],
    hints: [
      "A deep copy means new nodes with the same connections, not shared references.",
      "Cycles will loop forever unless you remember which originals you've already cloned.",
      "Use a map from original node → its clone.",
      "Create a node's clone and record it BEFORE recursing into neighbors.",
      "When a neighbor is already in the map, reuse its clone instead of re-creating it.",
    ],
    lines: [
      { c: "if not node: return None", e: "Empty graph → nothing to copy." },
      { c: "mp = {}", e: "original → clone, also marks visited." },
      { c: "def dfs(n):", e: "Return the clone of node n." },
      { c: "    if n in mp: return mp[n]", e: "Already cloned (handles cycles)." },
      { c: "    copy = Node(n.val)", e: "Make the clone shell." },
      { c: "    mp[n] = copy", e: "Register it before recursing to break cycles." },
      { c: "    for nei in n.neighbors:", e: "Clone each neighbor…" },
      { c: "        copy.neighbors.append(dfs(nei))", e: "…and wire it into the copy." },
      { c: "    return copy", e: "Fully cloned node." },
      { c: "return dfs(node)", e: "Deep copy of the whole graph." },
    ],
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
    tests: [
      ["canFinish(2, [[1,0]])", "True"],
      ["canFinish(2, [[1,0],[0,1]])", "False"],
    ],
    hints: [
      "You can finish all courses iff the prerequisite graph has no cycle.",
      "Model courses as nodes and prerequisites as directed edges.",
      "Detect cycles with DFS using three states: unvisited, visiting, done.",
      "If you reach a node that's currently 'visiting', you've found a cycle on the path.",
      "Cache fully-explored ('done') nodes so you never re-traverse them.",
    ],
    lines: [
      { c: "graph[a].append(b)", e: "Edge a → b: a depends on b." },
      { c: "visiting, visited = set(), set()", e: "Nodes on the current path; nodes proven safe." },
      { c: "def dfs(c):", e: "Returns True if course c is cycle-free." },
      { c: "    if c in visiting: return False", e: "Back-edge onto the current path = cycle." },
      { c: "    if c in visited: return True", e: "Already known safe." },
      { c: "    visiting.add(c)", e: "Enter c on the current DFS path." },
      { c: "    for p in graph[c]:", e: "Explore each prerequisite…" },
      { c: "        if not dfs(p): return False", e: "…a cycle below propagates failure." },
      { c: "    visiting.remove(c); visited.add(c)", e: "Leave the path and mark c done." },
      { c: "return all(dfs(i) for i in range(numCourses))", e: "All courses must be finishable." },
    ],
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
    tests: [
      ["exist([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCCED')", "True"],
      ["exist([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'SEE')", "True"],
      ["exist([['A','B'],['C','D']], 'ABCD')", "False"],
    ],
    hints: [
      "You must walk to adjacent cells, matching the word letter by letter.",
      "Try starting the search from every cell in the grid.",
      "Use DFS: at step i, the current cell must equal word[i], then recurse for word[i+1].",
      "A cell can't be reused within one path — mark it temporarily as visited.",
      "Restore the cell on the way back (backtracking) so other paths can use it.",
    ],
    lines: [
      { c: "def dfs(r, c, i):", e: "Try to match word[i] starting at cell (r, c)." },
      { c: "    if i == len(word): return True", e: "Matched every letter — success." },
      { c: "    if out of bounds or board[r][c] != word[i]: return False", e: "Off-grid or wrong letter." },
      { c: "    tmp = board[r][c]; board[r][c] = '#'", e: "Mark visited so this path can't reuse it." },
      { c: "    found = dfs(4 neighbors, i+1)", e: "Try to extend the match in any direction." },
      { c: "    board[r][c] = tmp", e: "Backtrack: restore the cell." },
      { c: "    return found", e: "Did any direction complete the word?" },
      { c: "for r,c in grid: if dfs(r,c,0): return True", e: "Attempt from every start." },
      { c: "return False", e: "No path spells the word." },
    ],
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
    tests: [
      ["wordBreak('leetcode', ['leet','code'])", "True"],
      ["wordBreak('applepenapple', ['apple','pen'])", "True"],
      ["wordBreak('catsandog', ['cats','dog','sand','and','cat'])", "False"],
    ],
    hints: [
      "Ask: is the whole string breakable? Break it into 'a word' + 'the rest'.",
      "Let dp[i] mean 's[:i] can be segmented into dictionary words'.",
      "dp[0] is True (the empty prefix is trivially segmentable).",
      "dp[i] is True if some dictionary word w ends at i and dp[i-len(w)] is True.",
      "The answer is dp[len(s)].",
    ],
    lines: [
      { c: "dp = [False] * (len(s) + 1)", e: "dp[i]: is s[:i] breakable?" },
      { c: "dp[0] = True", e: "Empty prefix is always breakable." },
      { c: "for i in range(1, len(s)+1):", e: "Consider each prefix length." },
      { c: "    for w in wordDict:", e: "Try each candidate word ending at i." },
      { c: "        if dp[i-len(w)] and s[i-len(w):i] == w:", e: "Rest is breakable AND the tail equals w." },
      { c: "            dp[i] = True", e: "So s[:i] is breakable too." },
      { c: "return dp[-1]", e: "Is the full string segmentable?" },
    ],
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
    tests: [
      ["numDecodings('226')", "3"],
      ["numDecodings('12')", "2"],
      ["numDecodings('06')", "0"],
    ],
    hints: [
      "At each position you either take one digit or two digits — like climbing stairs.",
      "A single digit decodes only if it's 1–9 (not 0).",
      "A two-digit pair decodes only if it's between 10 and 26.",
      "dp[i] = (ways ending in a valid single) + (ways ending in a valid pair).",
      "Watch out for zeros — '0' alone is invalid and kills that path.",
    ],
    lines: [
      { c: "if not s or s[0] == '0': return 0", e: "A leading zero can't start any decoding." },
      { c: "dp = [0] * (len(s) + 1)", e: "dp[i] = ways to decode s[:i]." },
      { c: "dp[0] = dp[1] = 1", e: "Empty string and a valid first digit: one way each." },
      { c: "for i in range(2, len(s)+1):", e: "Fill the rest." },
      { c: "    if s[i-1] != '0': dp[i] += dp[i-1]", e: "Valid single digit extends dp[i-1]." },
      { c: "    if 10 <= int(s[i-2:i]) <= 26: dp[i] += dp[i-2]", e: "Valid pair extends dp[i-2]." },
      { c: "return dp[-1]", e: "Total decodings." },
    ],
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
    tests: [
      ["coinChange([1,2,5], 11)", "3"],
      ["coinChange([2], 3)", "-1"],
      ["coinChange([1], 0)", "0"],
    ],
    hints: [
      "Greedy (biggest coin first) fails for some coin sets — use DP.",
      "Let dp[a] be the fewest coins to make amount a.",
      "dp[0] = 0; everything else starts at 'infinity'.",
      "For each amount, try every coin: dp[a] = min(dp[a], dp[a-c] + 1).",
      "If dp[amount] never improved past infinity, it's unreachable → -1.",
    ],
    lines: [
      { c: "dp = [amount+1] * (amount+1)", e: "amount+1 acts as ∞ (impossible)." },
      { c: "dp[0] = 0", e: "Zero coins make amount 0." },
      { c: "for i in range(1, amount+1):", e: "Build up every amount." },
      { c: "    for c in coins:", e: "Try finishing with coin c." },
      { c: "        if i >= c:", e: "Coin fits within the amount." },
      { c: "            dp[i] = min(dp[i], dp[i-c] + 1)", e: "Best of current vs. using one coin c." },
      { c: "return dp[amount] if dp[amount] != amount+1 else -1", e: "Unreachable stays at ∞ → -1." },
    ],
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
    tests: [
      ["rob([2,7,9,3,1])", "12"],
      ["rob([2,1,1,2])", "4"],
      ["rob([5])", "5"],
    ],
    hints: [
      "You can't rob two adjacent houses — classic pick-or-skip DP.",
      "For each house: either skip it (keep the best so far) or rob it.",
      "If you rob house i, you must add the best total that excluded house i-1.",
      "Track two rolling values: best-through-prev and best-through-prev-prev.",
      "No array needed — just two variables updated each step.",
    ],
    lines: [
      { c: "prev1 = prev2 = 0", e: "prev1 = best up to last house; prev2 = best up to the one before." },
      { c: "for n in nums:", e: "Consider each house's loot n." },
      { c: "    prev1, prev2 = max(prev2+n, prev1), prev1", e: "Rob (prev2+n) or skip (prev1); shift the window." },
      { c: "return prev1", e: "Best achievable total." },
    ],
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
    tests: [
      ["canJump([2,3,1,1,4])", "True"],
      ["canJump([3,2,1,0,4])", "False"],
    ],
    hints: [
      "You don't need the exact path — only whether the end is reachable.",
      "Track the farthest index reachable so far.",
      "Scan left to right, updating reach = max(reach, i + nums[i]).",
      "If you ever stand on an index beyond reach, you're stuck.",
      "Survive the whole scan → the last index is reachable.",
    ],
    lines: [
      { c: "reach = 0", e: "Farthest index we can get to." },
      { c: "for i, n in enumerate(nums):", e: "Walk each position." },
      { c: "    if i > reach: return False", e: "This index is unreachable — stuck." },
      { c: "    reach = max(reach, i + n)", e: "Extend reach using this house's jump." },
      { c: "return True", e: "Reached (or passed) the end." },
    ],
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
    tests: [
      ["merge([[1,3],[2,6],[8,10],[15,18]])", "[[1, 6], [8, 10], [15, 18]]"],
      ["merge([[1,4],[4,5]])", "[[1, 5]]"],
    ],
    hints: [
      "Overlaps are only obvious once intervals are ordered.",
      "Sort the intervals by their start value.",
      "Walk through; compare each interval to the last one you kept.",
      "If the current start is beyond the last end, they don't overlap — start a new one.",
      "Otherwise extend the last interval's end to the max of the two.",
    ],
    lines: [
      { c: "intervals.sort()", e: "Order by start so overlaps sit next to each other." },
      { c: "res = []", e: "Merged output." },
      { c: "for s,e in intervals:", e: "Each interval [s, e]." },
      { c: "    if not res or res[-1][1] < s:", e: "No overlap with the last kept interval." },
      { c: "        res.append([s,e])", e: "Start a fresh interval." },
      { c: "    else:", e: "They overlap…" },
      { c: "        res[-1][1] = max(res[-1][1], e)", e: "…so extend the last end." },
      { c: "return res", e: "Non-overlapping merged intervals." },
    ],
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
    tests: [
      ["insert([[1,3],[6,9]], [2,5])", "[[1, 5], [6, 9]]"],
      ["insert([[1,2],[3,5],[6,7],[8,10],[12,16]], [4,8])", "[[1, 2], [3, 10], [12, 16]]"],
    ],
    hints: [
      "The list is already sorted — you can solve it in one linear pass.",
      "Think of three groups: intervals entirely before, overlapping, entirely after.",
      "Intervals ending before new starts are copied as-is.",
      "Overlapping intervals get absorbed into new by min-start / max-end.",
      "Once you pass new entirely, drop it in and copy the rest.",
    ],
    lines: [
      { c: "for i in intervals:", e: "Scan the sorted intervals." },
      { c: "    if i[1] < newInterval[0]:", e: "i ends before new begins — no overlap." },
      { c: "        res.append(i)", e: "Keep it unchanged." },
      { c: "    elif i[0] > newInterval[1]:", e: "i starts after new ends — new is finalized." },
      { c: "        res.append(newInterval); newInterval = i", e: "Place new, then carry i forward." },
      { c: "    else:", e: "They overlap…" },
      { c: "        newInterval = [min(...), max(...)]", e: "…grow new to cover both." },
      { c: "res.append(newInterval)", e: "Flush the last pending interval." },
      { c: "return res", e: "Merged result." },
    ],
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
    tests: [
      ["uniquePaths(3, 7)", "28"],
      ["uniquePaths(3, 2)", "3"],
    ],
    hints: [
      "You can only move right or down — how do you reach a given cell?",
      "Every cell is entered from the one above it or the one to its left.",
      "So paths(cell) = paths(above) + paths(left).",
      "The entire first row and first column have exactly one path each.",
      "Fill the grid row by row; the bottom-right holds the answer.",
    ],
    lines: [
      { c: "dp = [[1]*n for _ in range(m)]", e: "First row/column start at 1 (one straight path)." },
      { c: "for i in range(1,m):", e: "Skip the first row." },
      { c: "    for j in range(1,n):", e: "Skip the first column." },
      { c: "        dp[i][j] = dp[i-1][j] + dp[i][j-1]", e: "Sum of paths from above and from the left." },
      { c: "return dp[-1][-1]", e: "Paths to the bottom-right cell." },
    ],
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
    tests: [
      ["climbStairs(2)", "2"],
      ["climbStairs(4)", "5"],
      ["climbStairs(1)", "1"],
    ],
    hints: [
      "Your last move was either a single step or a double step.",
      "So ways(n) = ways(n-1) + ways(n-2) — that's Fibonacci.",
      "Base cases: one way to climb 0 or 1 stairs.",
      "You don't need an array; two rolling numbers suffice.",
      "Iterate n-1 times, sliding the pair forward.",
    ],
    lines: [
      { c: "a, b = 1, 1", e: "Ways to reach the previous two steps." },
      { c: "for _ in range(n-1):", e: "Advance up the staircase." },
      { c: "    a, b = b, a+b", e: "Slide forward: new b is the sum of the last two." },
      { c: "return b", e: "Ways to reach step n." },
    ],
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
    tests: [
      ["groupAnagrams(['eat','tea','tan','ate','nat','bat'])", "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]"],
      ["groupAnagrams([''])", "[['']]"],
    ],
    hints: [
      "Anagrams contain exactly the same letters in a different order.",
      "You need a 'signature' that's identical for all anagrams of a word.",
      "Sorting a word's letters gives such a signature.",
      "Bucket words in a hash map keyed by that sorted signature.",
      "Return the buckets' contents.",
    ],
    lines: [
      { c: "d = defaultdict(list)", e: "signature → list of words." },
      { c: "for s in strs:", e: "Each input word." },
      { c: "    d[tuple(sorted(s))].append(s)", e: "Sorted letters form the shared key." },
      { c: "return list(d.values())", e: "Each bucket is one anagram group." },
    ],
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
    tests: [
      ["spiralOrder([[1,2,3],[4,5,6],[7,8,9]])", "[1, 2, 3, 6, 9, 8, 7, 4, 5]"],
      ["spiralOrder([[1,2,3,4],[5,6,7,8],[9,10,11,12]])", "[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]"],
    ],
    hints: [
      "The top row is always the next chunk you can read left-to-right.",
      "After taking it, the problem shrinks to the remaining rows.",
      "Rotate the rest so the next side to read becomes the new top row.",
      "zip(*matrix) transposes; reversing the rows gives a 90° counter-clockwise turn.",
      "Repeat until nothing is left.",
    ],
    lines: [
      { c: "res = []", e: "Collected spiral order." },
      { c: "while matrix:", e: "Until every element is consumed." },
      { c: "    res += matrix.pop(0)", e: "Take the current top row." },
      { c: "    matrix = list(zip(*matrix))[::-1]", e: "Rotate the remainder CCW so the next side is on top." },
      { c: "return res", e: "Full spiral." },
    ],
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
    tests: [
      ["subsets([1,2,3])", "[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]"],
      ["subsets([0])", "[[], [0]]"],
    ],
    hints: [
      "Every element is either in a subset or not — that's 2ⁿ subsets.",
      "Build subsets by a DFS that grows a running 'path'.",
      "Every state of the path is itself a valid subset — record it on entry.",
      "To avoid duplicates, only extend with elements after the current index.",
      "Recurse from j+1 so each element is considered once per branch.",
    ],
    lines: [
      { c: "def dfs(i, path):", e: "Extend subsets using elements from index i onward." },
      { c: "    res.append(path)", e: "The current path is a complete subset." },
      { c: "    for j in range(i, len(nums)):", e: "Pick each remaining element to add next." },
      { c: "        dfs(j+1, path+[nums[j]])", e: "Recurse with it appended, moving past j." },
      { c: "dfs(0, [])", e: "Start from the empty subset." },
      { c: "return res", e: "The full power set." },
    ],
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
    tests: [
      ["permute([1,2,3])", "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]"],
      ["permute([0,1])", "[[0, 1], [1, 0]]"],
    ],
    hints: [
      "A permutation uses every element exactly once in some order.",
      "Build one position at a time via DFS.",
      "Track which indices are already used so you don't repeat them.",
      "When the path length equals n, it's a complete permutation.",
      "Try every unused element at each depth.",
    ],
    lines: [
      { c: "def dfs(path, used):", e: "path = chosen so far; used = their indices." },
      { c: "    if len(path) == len(nums):", e: "Used every element…" },
      { c: "        res.append(path); return", e: "…record this permutation." },
      { c: "    for i in range(len(nums)):", e: "Consider each index." },
      { c: "        if i in used: continue", e: "Skip ones already placed." },
      { c: "        dfs(path+[nums[i]], used|{i})", e: "Choose nums[i] and recurse." },
      { c: "dfs([], set())", e: "Start empty." },
    ],
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
    tests: [
      ["findKthLargest([3,2,1,5,6,4], 2)", "5"],
      ["findKthLargest([3,2,3,1,2,4,5,5,6], 4)", "4"],
    ],
    hints: [
      "Fully sorting is O(n log n) — you only need the k largest.",
      "A size-k min-heap keeps exactly the k largest seen so far.",
      "The smallest of those k is the kth largest overall.",
      "heapq.nlargest(k, nums) returns them in descending order.",
      "The last element of that list is your answer.",
    ],
    lines: [
      { c: "return heapq.nlargest(k, nums)[-1]", e: "Take the top k, then the smallest of them (the kth largest)." },
    ],
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
    tests: [
      ["topKFrequent([1,1,1,2,2,3], 2)", "[1, 2]"],
      ["topKFrequent([1], 1)", "[1]"],
    ],
    hints: [
      "First you need to know how often each value appears.",
      "Counter builds value → frequency in one pass.",
      "Then you want the k entries with the highest counts.",
      "A heap (nlargest) selects the top k by a count key efficiently.",
      "Strip the values out of the (value, count) pairs.",
    ],
    lines: [
      { c: "cnt = Counter(nums)", e: "value → how many times it appears." },
      { c: "heapq.nlargest(k, cnt.items(), key=lambda x: x[1])", e: "Top k (value, count) pairs by count." },
      { c: "return [x for x,_ in ...]", e: "Keep only the values." },
    ],
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
    tests: [
      ["rightSideView(TreeNode(1, TreeNode(2, None, TreeNode(5)), TreeNode(3, None, TreeNode(4))))", "[1, 3, 4]"],
      ["rightSideView(None)", "[]"],
    ],
    hints: [
      "From the right, you see the last (rightmost) node of each level.",
      "A DFS can find it if you control the visiting order.",
      "Visit the right child BEFORE the left child.",
      "Then the first node you reach at each new depth is the rightmost one.",
      "Record a value only when depth equals the current result length.",
    ],
    lines: [
      { c: "def dfs(node, depth):", e: "Traverse tracking the current depth." },
      { c: "    if not node: return", e: "Nothing to see here." },
      { c: "    if depth == len(res):", e: "First node reached at this new depth…" },
      { c: "        res.append(node.val)", e: "…it's the rightmost — record it." },
      { c: "    dfs(node.right, depth+1)", e: "Go right first so it wins the depth." },
      { c: "    dfs(node.left, depth+1)", e: "Then left (fills deeper-only-on-left cases)." },
      { c: "dfs(root, 0); return res", e: "Rightmost value per level." },
    ],
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
    tests: [
      ["serialize(TreeNode(1, TreeNode(2), TreeNode(3)))", "1,2,#,#,3,#,#"],
      ["deserialize('1,2,#,#,3,#,#').val", "1"],
    ],
    hints: [
      "To rebuild a tree you must capture its shape, including missing children.",
      "Use a marker like '#' for null so the structure is unambiguous.",
      "Pre-order (node, left, right) records values in a rebuildable order.",
      "Deserialize by consuming tokens in that SAME order.",
      "An iterator over the tokens lets each recursive call grab the next value.",
    ],
    lines: [
      { c: "serialize: dfs appends str(val) or '#'", e: "Pre-order with explicit null markers." },
      { c: "    dfs(node.left); dfs(node.right)", e: "Left subtree, then right subtree." },
      { c: "return ','.join(res)", e: "A flat, comma-separated encoding." },
      { c: "deserialize: vals = iter(data.split(','))", e: "Stream the tokens in order." },
      { c: "    v = next(vals)", e: "Take the next token." },
      { c: "    if v == '#': return None", e: "Null marker → empty subtree." },
      { c: "    node.left = dfs(); node.right = dfs()", e: "Rebuild children in pre-order." },
      { c: "return dfs()", e: "Reconstructed tree root." },
    ],
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
    tests: [
      ["maxDepth(TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7))))", "3"],
      ["maxDepth(None)", "0"],
    ],
    hints: [
      "Depth is how many levels the tree has.",
      "An empty tree has depth 0.",
      "A node's depth is 1 plus the deeper of its two subtrees.",
      "That translates directly into a tiny recursion.",
      "No extra bookkeeping needed — just recurse and take the max.",
    ],
    lines: [
      { c: "if not root: return 0", e: "Empty subtree contributes no depth." },
      { c: "return 1 + max(maxDepth(root.left), maxDepth(root.right))", e: "This node adds one to its deeper child." },
    ],
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
    tests: [
      ["isSymmetric(TreeNode(1, TreeNode(2, TreeNode(3), TreeNode(4)), TreeNode(2, TreeNode(4), TreeNode(3))))", "True"],
      ["isSymmetric(TreeNode(1, TreeNode(2, None, TreeNode(3)), TreeNode(2, None, TreeNode(3))))", "False"],
    ],
    hints: [
      "Symmetry means the tree equals its own mirror image.",
      "Compare the left subtree against the right subtree.",
      "But mirror them: left-of-one lines up with right-of-other.",
      "Two nodes match if their values are equal and their children mirror.",
      "Recurse with crossed children: (a.left, b.right) and (a.right, b.left).",
    ],
    lines: [
      { c: "def mirror(a, b):", e: "Do subtrees a and b mirror each other?" },
      { c: "    if not a and not b: return True", e: "Both empty → symmetric." },
      { c: "    if not a or not b: return False", e: "One empty, one not → asymmetric." },
      { c: "    return a.val == b.val", e: "Values must match…" },
      { c: "       and mirror(a.left, b.right)", e: "…outer children mirror…" },
      { c: "       and mirror(a.right, b.left)", e: "…and inner children mirror." },
      { c: "return mirror(root, root)", e: "Compare the tree with itself." },
    ],
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
    tests: [
      ["t=TreeNode(1, TreeNode(2), TreeNode(3)); flatten(t); t.right.val", "2"],
      ["t=TreeNode(1, TreeNode(2), TreeNode(3)); flatten(t); t.right.right.val", "3"],
    ],
    hints: [
      "The final list follows pre-order: node, then left chain, then right chain.",
      "Flatten the left and right subtrees first (post-order style).",
      "Move the flattened left chain to the node's right side.",
      "Set the left pointer to None (it's a right-only list now).",
      "Walk to the tail of the moved chain and attach the old right chain.",
    ],
    lines: [
      { c: "if not root: return", e: "Nothing to flatten." },
      { c: "flatten(root.left); flatten(root.right)", e: "Flatten both subtrees first." },
      { c: "tmp = root.right", e: "Stash the (flattened) right chain." },
      { c: "root.right = root.left; root.left = None", e: "Move left chain to the right; clear left." },
      { c: "while cur.right: cur = cur.right", e: "Find the tail of the moved chain." },
      { c: "cur.right = tmp", e: "Append the original right chain → pre-order order." },
    ],
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
    tests: [
      ["trap([4,2,0,3,2,5])", "9"],
      ["trap([0,1,0,2,1,0,1,3,2,1,2,1])", "6"],
    ],
    hints: [
      "Same shape as problem #5 — water on a bar = min(leftMax, rightMax) − height.",
      "Two pointers avoid the O(n) arrays of prefix maxima.",
      "Advance whichever side currently has the smaller running max.",
      "That smaller max is a guaranteed bound, so its trapped water is final.",
      "Accumulate boundedMax − height at each step.",
    ],
    lines: [
      { c: "l, r = 0, len(height)-1", e: "Pointers at both ends." },
      { c: "lm = rm = 0", e: "Running left/right maxima." },
      { c: "if height[l] < height[r]:", e: "Left is the smaller bound → safe to finalize." },
      { c: "    lm = max(lm, height[l]); res += lm - height[l]", e: "Add trapped water on the left bar." },
      { c: "else: rm ...; res += rm - height[r]", e: "Otherwise finalize the right bar." },
      { c: "return res", e: "Total trapped water." },
    ],
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
    tests: [
      ["minWindow('aab', 'ab')", "ab"],
      ["minWindow('ADOBECODEBANC', 'ABC')", "BANC"],
    ],
    hints: [
      "Reinforces the variable-size window from problem #7.",
      "Track how many required characters are still missing.",
      "Expand right until missing hits 0 (a valid window).",
      "Shrink from the left past surplus characters to minimize.",
      "Save the smallest valid window before releasing a required char.",
    ],
    lines: [
      { c: "need = Counter(t); missing = len(t)", e: "Required chars and how many remain." },
      { c: "if need[c] > 0: missing -= 1", e: "Covered one required char." },
      { c: "need[c] -= 1", e: "Consume it (negative = surplus)." },
      { c: "while need[s[l]] < 0: l += 1", e: "Trim surplus from the left." },
      { c: "if r-l < end-start: start,end = l,r", e: "Record the smallest valid window." },
      { c: "return s[start:end]", e: "Minimum window (or empty)." },
    ],
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
    tests: [
      ["maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3)", "[3, 3, 5, 5, 6, 7]"],
      ["maxSlidingWindow([1], 1)", "[1]"],
    ],
    hints: [
      "Recomputing each window's max is O(nk) — aim for O(n).",
      "A value that is smaller than a newer value can never be a future max.",
      "Keep a deque of indices whose values are strictly decreasing.",
      "The deque's front is always the current window's maximum.",
      "Pop the front when its index falls out of the window.",
    ],
    lines: [
      { c: "for i,n in enumerate(nums):", e: "Slide the right edge." },
      { c: "    while dq and nums[dq[-1]] < n:", e: "New value dominates smaller trailing ones…" },
      { c: "        dq.pop()", e: "…so drop them." },
      { c: "    dq.append(i)", e: "Add this index (keeps values decreasing)." },
      { c: "    if dq[0] == i-k: dq.popleft()", e: "Front slid out of the window → evict it." },
      { c: "    if i >= k-1: res.append(nums[dq[0]])", e: "Window full → record its max (the front)." },
      { c: "return res", e: "Maxima of all windows." },
    ],
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
    tests: [
      ["c=LRUCache(2); c.put(1,1); c.put(2,2); c.get(1)", "1"],
      ["c=LRUCache(2); c.put(1,1); c.put(2,2); c.put(3,3); c.get(2)", "-1"],
    ],
    hints: [
      "You need O(1) lookup AND O(1) ordering by recency.",
      "A hash map gives O(1) lookup; a doubly linked list gives O(1) reordering.",
      "Python's OrderedDict combines both for you.",
      "On access, move the key to the 'most recently used' end.",
      "When size exceeds capacity, evict from the 'least recently used' end.",
    ],
    lines: [
      { c: "self.cache = OrderedDict()", e: "Keeps keys in access order." },
      { c: "get: move_to_end(key)", e: "Touching a key marks it most-recently-used." },
      { c: "    return self.cache[key]", e: "(-1 if absent)." },
      { c: "put: if key in cache: move_to_end(key)", e: "Refresh recency on update." },
      { c: "    self.cache[key] = value", e: "Insert/overwrite at the MRU end." },
      { c: "    if len > cap: popitem(last=False)", e: "Evict the least-recently-used entry." },
    ],
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
    tests: [
      ["m=MedianFinder(); m.addNum(1); m.addNum(2); m.findMedian()", "1.5"],
      ["m=MedianFinder(); m.addNum(1); m.addNum(2); m.addNum(3); m.findMedian()", "2"],
    ],
    hints: [
      "The median splits the data into a lower half and an upper half.",
      "Keep the lower half in a max-heap and the upper half in a min-heap.",
      "The two heap tops sit right at the median boundary.",
      "Keep the heaps balanced in size (differ by at most one).",
      "Median is the larger heap's top, or the average of both tops when equal.",
    ],
    lines: [
      { c: "self.small = []  # max-heap (negated)", e: "Lower half; Python heaps are min-heaps so negate." },
      { c: "self.large = []  # min-heap", e: "Upper half." },
      { c: "push num to small, then move its max to large", e: "Funnel keeps values ordered across heaps." },
      { c: "if len(large) > len(small): move one back", e: "Rebalance so small is never smaller." },
      { c: "findMedian: if small bigger -> -small[0]", e: "Odd count → the extra element is the median." },
      { c: "else (-small[0] + large[0]) / 2", e: "Even count → average the two middle tops." },
    ],
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
    tests: [
      ["findKthLargest([3,2,3,1,2,4,5,5,6], 4)", "4"],
      ["findKthLargest([1], 1)", "1"],
    ],
    hints: [
      "Reinforces heap selection from problem #34.",
      "You never need the full sort — only the top k.",
      "A size-k min-heap keeps the k largest as you scan once.",
      "Its root (smallest of the k) is the kth largest overall.",
      "nlargest(k, nums)[-1] gives it directly.",
    ],
    lines: [
      { c: "return heapq.nlargest(k, nums)[-1]", e: "Top k in descending order; take the last = kth largest." },
    ],
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
    tests: [
      ["m=[[1,1,1],[1,0,1],[1,1,1]]; setZeroes(m); m", "[[1, 0, 1], [0, 0, 0], [1, 0, 1]]"],
      ["m=[[0,1,2,0],[3,4,5,2],[1,3,1,5]]; setZeroes(m); m", "[[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]"],
    ],
    hints: [
      "Naively storing which rows/cols to zero costs O(m+n) space.",
      "You can store those flags inside the matrix itself.",
      "Use row 0 and column 0 as the flag storage.",
      "But first remember whether row 0 / col 0 themselves contained a zero.",
      "Second pass zeroes cells flagged by their row-0/col-0 markers, then fix row0/col0.",
    ],
    lines: [
      { c: "row0 = any zero in first row; col0 = any zero in first col", e: "Remember these before overwriting them." },
      { c: "for inner cells: if 0 -> matrix[i][0]=matrix[0][j]=0", e: "Flag this row and column in the borders." },
      { c: "for inner cells: if flagged -> set 0", e: "Zero every flagged cell." },
      { c: "if row0: zero the whole first row", e: "Apply the saved first-row flag." },
      { c: "if col0: zero the whole first column", e: "Apply the saved first-column flag." },
    ],
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
    tests: [
      ["nums=[1,2,3,4,5,6,7]; rotate(nums, 3); nums", "[5, 6, 7, 1, 2, 3, 4]"],
      ["nums=[-1,-100,3,99]; rotate(nums, 2); nums", "[3, 99, -1, -100]"],
    ],
    hints: [
      "Rotating right by k moves the last k elements to the front.",
      "If k ≥ n, only k mod n actually matters.",
      "The result is simply last-k concatenated with the rest.",
      "Assign into nums[:] to mutate the list in place.",
      "For true O(1) space, reverse the whole array then the two parts.",
    ],
    lines: [
      { c: "k %= len(nums)", e: "Collapse rotations larger than the length." },
      { c: "nums[:] = nums[-k:] + nums[:-k]", e: "Last k to the front, rest after; in-place." },
    ],
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
    tests: [
      ["rightSideView(TreeNode(1, TreeNode(2), TreeNode(3)))", "[1, 3]"],
      ["rightSideView(TreeNode(1, TreeNode(2, TreeNode(4), None), None))", "[1, 2, 4]"],
    ],
    hints: [
      "Reinforces problem #36's depth-first right view.",
      "You want the rightmost node at each depth.",
      "Recurse right before left.",
      "The first node seen at a new depth is the rightmost.",
      "Record when depth equals the current result length.",
    ],
    lines: [
      { c: "if depth == len(res): res.append(node.val)", e: "First node at this depth = rightmost." },
      { c: "dfs(node.right, depth+1)", e: "Right first so it claims the depth." },
      { c: "dfs(node.left, depth+1)", e: "Left fills deeper left-only branches." },
    ],
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
    tests: [
      ["serialize(TreeNode(5, TreeNode(3), TreeNode(8)))", "5,3,#,#,8,#,#"],
      ["serialize(None)", "#"],
    ],
    hints: [
      "Reinforces the encoding half of problem #37.",
      "Pre-order records a node before its children.",
      "Emit '#' for every missing child.",
      "Those null markers make the structure unambiguous.",
      "Join tokens with commas for a compact string.",
    ],
    lines: [
      { c: "if not node: res.append('#'); return", e: "Null marker preserves shape." },
      { c: "res.append(str(node.val))", e: "Record the node value." },
      { c: "dfs(node.left); dfs(node.right)", e: "Then left, then right (pre-order)." },
      { c: "return ','.join(res)", e: "Flat, decodable encoding." },
    ],
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
    tests: [
      ["maxDepth(TreeNode(1, TreeNode(2, TreeNode(3), None), None))", "3"],
      ["maxDepth(TreeNode(1))", "1"],
    ],
    hints: [
      "Reinforces the one-line tree recursion of problem #38.",
      "Empty tree → depth 0.",
      "Otherwise 1 + deeper subtree.",
      "The recursion stack depth equals the tree height.",
      "No extra state needed.",
    ],
    lines: [
      { c: "if not root: return 0", e: "Empty subtree adds nothing." },
      { c: "return 1 + max(maxDepth(left), maxDepth(right))", e: "One more than the deeper child." },
    ],
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
    tests: [
      ["isSymmetric(TreeNode(1, TreeNode(2), TreeNode(2)))", "True"],
      ["isSymmetric(TreeNode(1, TreeNode(2, None, TreeNode(3)), TreeNode(2, None, TreeNode(3))))", "False"],
    ],
    hints: [
      "Reinforces the crossed recursion of problem #39.",
      "A tree is symmetric if it mirrors itself.",
      "Compare left subtree to right subtree.",
      "Match values, then recurse with crossed children.",
      "Any mismatch fails immediately.",
    ],
    lines: [
      { c: "if not a and not b: return True", e: "Both empty → mirror." },
      { c: "if not a or not b: return False", e: "Shape mismatch." },
      { c: "a.val == b.val and mirror(a.left,b.right) and mirror(a.right,b.left)", e: "Values equal + crossed children mirror." },
    ],
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
    tests: [
      ["t=TreeNode(1, TreeNode(2), TreeNode(3)); flatten(t); t.right.val", "2"],
      ["t=TreeNode(1, TreeNode(2), None); flatten(t); t.right.val", "2"],
    ],
    hints: [
      "Reinforces the post-order rewiring of problem #40.",
      "Flatten both subtrees before touching this node.",
      "Move the left chain onto the right side.",
      "Null out the left pointer.",
      "Walk to the tail and reattach the original right chain.",
    ],
    lines: [
      { c: "flatten(root.left); flatten(root.right)", e: "Children first (post-order)." },
      { c: "root.right = root.left; root.left = None", e: "Left chain becomes the right chain." },
      { c: "while cur.right: cur = cur.right", e: "Find the tail." },
      { c: "cur.right = tmp", e: "Append the stashed right chain." },
    ],
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
    tests: [
      ["findPeakElement([1,2,3,1])", "2"],
      ["findPeakElement([1,2,1,3,5,6,4])", "5"],
    ],
    hints: [
      "A peak is any element greater than both neighbors; edges count as −∞ outside.",
      "You don't need to scan — O(log n) is possible.",
      "Compare mid with its right neighbor to pick a direction.",
      "If nums[m] > nums[m+1], a peak is at m or to the left.",
      "Otherwise an upward slope guarantees a peak to the right.",
    ],
    lines: [
      { c: "while l < r:", e: "Narrow to a single index." },
      { c: "    m = (l + r) // 2", e: "Midpoint." },
      { c: "    if nums[m] > nums[m+1]:", e: "Descending → peak at m or left." },
      { c: "        r = m", e: "Keep m as a candidate." },
      { c: "    else:", e: "Ascending → peak to the right." },
      { c: "        l = m + 1", e: "Move past m." },
      { c: "return l", e: "Index of a peak." },
    ],
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
    tests: [
      ["subsets([1,2])", "[[], [1], [1, 2], [2]]"],
      ["subsets([1,2,3])", "[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]"],
    ],
    hints: [
      "Reinforces the 'start index' template from problem #32.",
      "Each recursion node is itself a valid subset.",
      "Record the path on entry.",
      "Only extend with elements after the current index.",
      "This same template powers combinations and combination sum.",
    ],
    lines: [
      { c: "res.append(path)", e: "Current path is a subset." },
      { c: "for j in range(i, len(nums)):", e: "Pick each later element." },
      { c: "    dfs(j+1, path+[nums[j]])", e: "Recurse past j to avoid duplicates." },
    ],
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
    tests: [
      ["permute([1,2])", "[[1, 2], [2, 1]]"],
      ["permute([1,2,3])", "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]"],
    ],
    hints: [
      "Reinforces the used-set recursion from problem #33.",
      "Each permutation uses every element once.",
      "Track used indices to avoid repeats.",
      "Complete when the path length equals n.",
      "Try every unused element at each depth.",
    ],
    lines: [
      { c: "if len(path) == len(nums): res.append(path)", e: "Full-length path = a permutation." },
      { c: "if i in used: continue", e: "Skip already-placed indices." },
      { c: "dfs(path+[nums[i]], used|{i})", e: "Choose nums[i] and recurse." },
    ],
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
    tests: [
      ["combinationSum2([10,1,2,7,6,1,5], 8)", "[[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]"],
      ["combinationSum2([2,5,2,1,2], 5)", "[[1, 2, 2], [5]]"],
    ],
    hints: [
      "Each number may be used at most once, and combinations must be unique.",
      "Sort first so equal numbers sit together.",
      "DFS from a start index, passing i+1 so a number isn't reused.",
      "To avoid duplicate combos, skip a number equal to its previous sibling at the same level.",
      "Prune when the running total exceeds the target.",
    ],
    lines: [
      { c: "candidates.sort()", e: "Group duplicates for easy skipping." },
      { c: "if total == target: res.append(path)", e: "Found a valid combination." },
      { c: "if total > target: return", e: "Prune overshoots." },
      { c: "if i > start and c[i] == c[i-1]: continue", e: "Skip duplicate siblings to avoid repeats." },
      { c: "dfs(i+1, path+[c[i]], total+c[i])", e: "Use c[i] once, move past it." },
    ],
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
    tests: [
      ["canCompleteCircuit([1,2,3,4,5], [3,4,5,1,2])", "3"],
      ["canCompleteCircuit([2,3,4], [3,4,3])", "-1"],
    ],
    hints: [
      "If total gas < total cost, the trip is impossible — return -1.",
      "Otherwise a unique valid start is guaranteed to exist.",
      "Track a running tank as you pass each station.",
      "If the tank ever goes negative, no station up to here can be the start.",
      "Jump the candidate start to the next station and reset the tank.",
    ],
    lines: [
      { c: "total = tank = start = 0", e: "Overall balance, running tank, candidate start." },
      { c: "total += gas[i] - cost[i]", e: "Global feasibility accumulator." },
      { c: "tank += gas[i] - cost[i]", e: "Fuel since the current start." },
      { c: "if tank < 0:", e: "Can't reach the next station from this start…" },
      { c: "    start = i + 1; tank = 0", e: "…so restart the attempt after i." },
      { c: "return start if total >= 0 else -1", e: "Feasible only if gas covers cost overall." },
    ],
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
    tests: [
      ["isValidSudoku([['5','3','.','.','7','.','.','.','.'],['6','.','.','1','9','5','.','.','.'],['.','9','8','.','.','.','.','6','.'],['8','.','.','.','6','.','.','.','3'],['4','.','.','8','.','3','.','.','1'],['7','.','.','.','2','.','.','.','6'],['.','6','.','.','.','.','2','8','.'],['.','.','.','4','1','9','.','.','5'],['.','.','.','.','8','.','.','7','9']])", "True"],
    ],
    hints: [
      "You only validate what's filled — skip '.' cells.",
      "Each digit must be unique in its row, its column, and its 3×3 box.",
      "Keep a set per row, per column, and per box.",
      "Map a cell to its box index with (r//3)*3 + c//3.",
      "A repeat in any of the three sets means invalid.",
    ],
    lines: [
      { c: "rows/cols/boxes = nine sets each", e: "Track seen digits per region." },
      { c: "if v == '.': continue", e: "Ignore empty cells." },
      { c: "b = (r//3)*3 + c//3", e: "Which 3×3 box this cell belongs to." },
      { c: "if v in rows[r] or cols[c] or boxes[b]: return False", e: "Duplicate → invalid board." },
      { c: "add v to all three sets", e: "Record the digit." },
      { c: "return True", e: "No conflicts found." },
    ],
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
    hints: [
      "Fill the grid one empty cell at a time, trying digits 1–9.",
      "Only place a digit that's legal in its row, column, and box.",
      "Recurse after placing; if it leads to a solution, you're done.",
      "If a placement dead-ends, undo it (backtrack) and try the next digit.",
      "If no digit fits an empty cell, signal failure up the recursion.",
    ],
    lines: [
      { c: "def valid(r, c, v):", e: "Is digit v legal at (r, c)?" },
      { c: "    check row, column, and 3×3 box for v", e: "Reject if v already appears there." },
      { c: "find next '.' cell", e: "The next blank to fill." },
      { c: "    for v in '123456789':", e: "Try each digit." },
      { c: "        if valid: board[r][c] = v; if dfs(): return True", e: "Place and recurse." },
      { c: "        board[r][c] = '.'", e: "Backtrack on failure." },
      { c: "    return False", e: "No digit fits → dead end." },
      { c: "no blanks left -> return True", e: "Board fully solved." },
    ],
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
    tests: [
      ["minMeetingRooms([[0,30],[5,10],[15,20]])", "2"],
      ["minMeetingRooms([[7,10],[2,4]])", "1"],
    ],
    hints: [
      "You need the peak number of simultaneously-active meetings.",
      "Process meetings in start-time order.",
      "A min-heap of end times tells you when rooms free up.",
      "If the earliest-ending room is free by the new start, reuse it.",
      "The heap's size is the number of rooms in use.",
    ],
    lines: [
      { c: "intervals.sort()", e: "Order by start time." },
      { c: "for s,e in intervals:", e: "Each meeting." },
      { c: "    if heap and heap[0] <= s:", e: "Earliest room frees before this start…" },
      { c: "        heapq.heappop(heap)", e: "…reuse it (remove its end)." },
      { c: "    heapq.heappush(heap, e)", e: "Occupy a room until e." },
      { c: "return len(heap)", e: "Peak concurrent rooms." },
    ],
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
    tests: [
      ["leastInterval(['A','A','A','B','B','B'], 2)", "8"],
      ["leastInterval(['A','A','A','B','B','B'], 0)", "6"],
    ],
    hints: [
      "The most frequent task dictates the minimum timeline.",
      "Picture (maxf-1) blocks, each of length n+1, framed by the max task.",
      "Append one slot for every task that ties the max frequency.",
      "That gives (maxf-1)*(n+1) + (count of max-frequency tasks).",
      "If there are enough other tasks to fill all gaps, the answer is just len(tasks).",
    ],
    lines: [
      { c: "freq = Counter(tasks)", e: "How often each task runs." },
      { c: "maxf = max(freq.values())", e: "Highest frequency." },
      { c: "cnt = # tasks with that max frequency", e: "How many share the peak." },
      { c: "return max(len(tasks), (maxf-1)*(n+1) + cnt)", e: "Skeleton length, or dense packing if gaps fill." },
    ],
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
    tests: [
      ["alienOrder(['wrt','wrf','er','ett','rftt'])", "wertf"],
      ["alienOrder(['z','x'])", "zx"],
    ],
    hints: [
      "Adjacent words in sorted order reveal one ordering constraint each.",
      "The first position where two adjacent words differ gives edge a → b.",
      "Watch the invalid case: a longer word before its own prefix.",
      "Build a directed graph and run a topological sort.",
      "If not every character comes out, there's a cycle → return ''.",
    ],
    lines: [
      { c: "for w1, w2 in adjacent pairs:", e: "Compare consecutive words." },
      { c: "    find first differing a,b -> edge a->b", e: "a precedes b in the alien order." },
      { c: "    else if w1 longer than w2: return ''", e: "Prefix after its extension is invalid." },
      { c: "q = chars with indegree 0", e: "Kahn's topo sort seeds." },
      { c: "pop c, append to res, decrement neighbors", e: "Emit in dependency order." },
      { c: "return ''.join(res) if all chars used else ''", e: "Leftover = cycle → no valid order." },
    ],
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
    tests: [
      ["longestConsecutive([100,4,200,1,3,2])", "4"],
      ["longestConsecutive([0,3,7,2,5,8,4,6,0,1])", "9"],
    ],
    hints: [
      "Reinforces the O(n) set trick from problem #3.",
      "Put everything in a set for O(1) lookups.",
      "Start counting only from a run's beginning (n-1 absent).",
      "Walk upward while n+1 exists.",
      "This 'start only' rule keeps it linear despite the inner loop.",
    ],
    lines: [
      { c: "s = set(nums)", e: "O(1) membership." },
      { c: "if n-1 not in s:", e: "n begins a run." },
      { c: "    while cur+1 in s: extend", e: "Grow the run upward." },
      { c: "    best = max(best, length)", e: "Track the longest." },
    ],
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
    tests: [
      ["minDistance('horse', 'ros')", "3"],
      ["minDistance('intention', 'execution')", "5"],
    ],
    hints: [
      "Think in terms of prefixes: convert a[:i] into b[:j].",
      "Let dp[i][j] be that minimum edit distance.",
      "Empty-to-length-k costs k (all inserts or deletes) — the base row/column.",
      "If the current characters match, no new cost — carry the diagonal.",
      "Otherwise 1 + min(delete, insert, replace).",
    ],
    lines: [
      { c: "dp[i][0] = i; dp[0][j] = j", e: "Turning a prefix into '' costs its length." },
      { c: "if a[i-1] == b[j-1]:", e: "Characters match…" },
      { c: "    dp[i][j] = dp[i-1][j-1]", e: "…no operation; carry the diagonal." },
      { c: "else: dp[i][j] = 1 + min(up, left, diag)", e: "Delete / insert / replace — cheapest wins." },
      { c: "return dp[m][n]", e: "Distance between the full strings." },
    ],
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
    tests: [
      ["maxCoins([3,1,5,8])", "167"],
      ["maxCoins([1,5])", "10"],
    ],
    hints: [
      "Bursting a balloon changes its neighbors — forward thinking is messy.",
      "Instead, decide which balloon in a range is burst LAST.",
      "If k is last in (l, r), its neighbors are exactly the fixed boundaries l and r.",
      "Pad the array with 1's so edges have neighbors.",
      "Interval DP: try every last-burst k for every range length.",
    ],
    lines: [
      { c: "nums = [1] + nums + [1]", e: "Padding gives every balloon neighbors." },
      { c: "for length in range(2, n):", e: "Grow interval sizes." },
      { c: "    for l in ...: r = l + length", e: "Each (l, r) open interval." },
      { c: "        for k in range(l+1, r):", e: "k is burst LAST in (l, r)." },
      { c: "            nums[l]*nums[k]*nums[r] + dp[l][k] + dp[k][r]", e: "Its coins plus both independent subranges." },
      { c: "return dp[0][-1]", e: "Best over the whole padded range." },
    ],
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
    tests: [
      ["ladderLength('hit', 'cog', ['hot','dot','dog','lot','log','cog'])", "5"],
      ["ladderLength('hit', 'cog', ['hot','dot','dog','lot','log'])", "0"],
    ],
    hints: [
      "Words are nodes; an edge connects words differing by one letter.",
      "Shortest transformation = shortest path → use BFS.",
      "Generate neighbors by swapping each position with every letter a–z.",
      "Keep only variations present in the dictionary.",
      "Remove words as you enqueue them to avoid revisiting.",
    ],
    lines: [
      { c: "q = deque([(begin, 1)])", e: "BFS from begin at distance 1." },
      { c: "if w == end: return d", e: "Reached the target — shortest by BFS." },
      { c: "for each position, each letter a-z:", e: "Build one-letter variations." },
      { c: "    nw = w[:i] + c + w[i+1:]", e: "The candidate neighbor word." },
      { c: "    if nw in wordList: remove + enqueue", e: "Visit valid, unseen neighbors." },
      { c: "return 0", e: "End unreachable." },
    ],
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
    tests: [
      ["countSubstrings('abc')", "3"],
      ["countSubstrings('aaa')", "6"],
    ],
    hints: [
      "Every palindrome has a center it grows symmetrically around.",
      "There are two center types: a single char (odd) and a gap between chars (even).",
      "From each center, expand outward while the two sides match.",
      "Count one palindrome for every successful expansion.",
      "2n−1 centers total keeps it simple and O(n²).",
    ],
    lines: [
      { c: "for i in range(len(s)):", e: "Each possible center position." },
      { c: "    for l, r in [(i,i), (i,i+1)]:", e: "Odd center and even center." },
      { c: "        while s[l] == s[r]:", e: "Sides still mirror…" },
      { c: "            res += 1", e: "…another palindrome." },
      { c: "            l -= 1; r += 1", e: "Expand outward." },
      { c: "return res", e: "Total palindromic substrings." },
    ],
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
    tests: [
      ["findDuplicate([1,3,4,2,2])", "2"],
      ["findDuplicate([3,1,3,4,2])", "3"],
    ],
    hints: [
      "You can't modify the array and must use O(1) space — sorting/sets are out.",
      "Treat each value as a pointer to the next index: this forms a linked list.",
      "A duplicate value means two nodes point to the same place → a cycle.",
      "Use Floyd's tortoise & hare to find a point inside the cycle.",
      "Then walk from the start and the meeting point together — they meet at the entrance (the duplicate).",
    ],
    lines: [
      { c: "slow = nums[slow]; fast = nums[nums[fast]]", e: "Phase 1: hare moves twice as fast." },
      { c: "if slow == fast: break", e: "They meet inside the cycle." },
      { c: "slow = nums[0]", e: "Phase 2: reset one pointer to the start." },
      { c: "while slow != fast: advance both by one", e: "They converge at the cycle entrance." },
      { c: "return slow", e: "The entrance value is the duplicate." },
    ],
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
    tests: [
      ["maxPathSum(TreeNode(1, TreeNode(2), TreeNode(3)))", "6"],
      ["maxPathSum(TreeNode(-10, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7))))", "42"],
    ],
    hints: [
      "A path can start and end anywhere — it need not touch the root.",
      "A negative subtree only hurts, so clamp its contribution to 0.",
      "At each node, the best path THROUGH it is node + leftGain + rightGain.",
      "Update a global maximum with that value.",
      "But you can only extend ONE side upward to a parent.",
    ],
    lines: [
      { c: "l = max(dfs(node.left), 0)", e: "Best left gain, ignore if negative." },
      { c: "r = max(dfs(node.right), 0)", e: "Best right gain, ignore if negative." },
      { c: "res = max(res, node.val + l + r)", e: "Path bending through this node." },
      { c: "return node.val + max(l, r)", e: "Upward you may keep only one branch." },
      { c: "return res", e: "Best path sum anywhere." },
    ],
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
    tests: [
      ["minCost(7, [1,3,4,5])", "16"],
      ["minCost(9, [5,6,1,4,2])", "22"],
    ],
    hints: [
      "The order of cuts changes the total cost — it's an optimization.",
      "A cut's cost is the length of the segment it splits.",
      "Add 0 and n as fixed boundaries, and sort the cut positions.",
      "Interval DP: for a segment, choose which cut to make FIRST.",
      "That splits it into two independent subsegments; try every first cut.",
    ],
    lines: [
      { c: "cuts = [0] + sorted(cuts) + [n]", e: "Fixed boundaries around the real cuts." },
      { c: "for length in range(2, m):", e: "Grow interval sizes over cut indices." },
      { c: "    j = i + length", e: "Segment spans cuts[i]..cuts[j]." },
      { c: "    dp[i][j] = min over k of (cuts[j]-cuts[i] + dp[i][k] + dp[k][j])", e: "First cut k costs the segment length plus subproblems." },
      { c: "return dp[0][-1]", e: "Cheapest way to make all cuts." },
    ],
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
    tests: [
      ["isMatch('aa', 'a*')", "True"],
      ["isMatch('aab', 'c*a*b')", "True"],
      ["isMatch('mississippi', 'mis*is*p*.')", "False"],
    ],
    hints: [
      "'.' matches any single char; '*' means zero-or-more of the PREVIOUS char.",
      "Let dp[i][j] mean s[:i] matches p[:j].",
      "A plain char or '.' matches by carrying the diagonal dp[i-1][j-1].",
      "'*' can mean zero occurrences → dp[i][j-2] (drop the pair).",
      "Or one-more occurrence if the preceding pattern char matches s[i-1] → dp[i-1][j].",
    ],
    lines: [
      { c: "dp[0][0] = True", e: "Empty pattern matches empty string." },
      { c: "'*' at start: dp[0][j] = dp[0][j-2]", e: "'x*' can match empty." },
      { c: "if p[j-1] in {s[i-1], '.'}:", e: "Direct char or wildcard match…" },
      { c: "    dp[i][j] = dp[i-1][j-1]", e: "…carry the diagonal." },
      { c: "elif p[j-1] == '*':", e: "Star handling…" },
      { c: "    dp[i][j-2] or (prev matches and dp[i-1][j])", e: "Zero copies, or consume one more char." },
      { c: "return dp[-1][-1]", e: "Full match?" },
    ],
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
    tests: [
      ["maximalRectangle([['1','0','1','0','0'],['1','0','1','1','1'],['1','1','1','1','1'],['1','0','0','1','0']])", "6"],
      ["maximalRectangle([['0']])", "0"],
    ],
    hints: [
      "Reduce the 2D problem to many 1D histogram problems.",
      "For each row, build column heights of consecutive 1's ending at that row.",
      "A 0 resets that column's height to 0.",
      "Run 'largest rectangle in histogram' on each row's heights.",
      "The overall answer is the best across all rows.",
    ],
    lines: [
      { c: "heights[i] = heights[i]+1 if v=='1' else 0", e: "Accumulate/reset per-column bar heights." },
      { c: "for each row, run histogram routine", e: "Largest rectangle under these bars." },
      { c: "    monotonic stack pops on shorter bar", e: "Compute widths when a bar can't extend." },
      { c: "    res = max(res, H*W)", e: "Track the best area." },
      { c: "return res", e: "Largest all-1 rectangle." },
    ],
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
    tests: [
      ["largestRectangleArea([2,1,5,6,2,3])", "10"],
      ["largestRectangleArea([2,4])", "4"],
    ],
    hints: [
      "A bar's rectangle extends left/right until a shorter bar blocks it.",
      "A monotonic increasing stack of indices tracks 'still-extendable' bars.",
      "When a shorter bar arrives, taller bars can't extend past it.",
      "Pop them and compute their width from the surrounding stack indices.",
      "Append a trailing 0 to flush every remaining bar.",
    ],
    lines: [
      { c: "for i,h in enumerate(heights+[0]):", e: "Trailing 0 forces a final flush." },
      { c: "    while stack and heights[stack[-1]] > h:", e: "Current bar is shorter than the stack top…" },
      { c: "        H = heights[stack.pop()]", e: "…so finalize that bar's height." },
      { c: "        W = i if not stack else i-stack[-1]-1", e: "Width spans to the previous shorter bar." },
      { c: "        res = max(res, H*W)", e: "Update best area." },
      { c: "    stack.append(i)", e: "Push this bar's index." },
      { c: "return res", e: "Largest rectangle area." },
    ],
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
    tests: [
      ["findMedianSortedArrays([1,2], [3,4])", "2.5"],
      ["findMedianSortedArrays([1,3], [2])", "2"],
    ],
    hints: [
      "Reinforces the partition search from problem #13.",
      "Binary search the cut in the SMALLER array.",
      "Derive the other cut so the left half is exactly half the total.",
      "A valid cut has every left value ≤ every right value.",
      "Median is a boundary value (odd) or an average of two (even).",
    ],
    lines: [
      { c: "if len(a) > len(b): a, b = b, a", e: "Search the smaller array." },
      { c: "i = mid cut in a; j derived", e: "Left half correctly sized." },
      { c: "if L1 <= R2 and L2 <= R1:", e: "Correct partition found." },
      { c: "    odd -> max(L1,L2); even -> avg", e: "Read the median off the boundary." },
      { c: "else adjust the cut left/right", e: "Binary search continues." },
    ],
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
    tests: [
      ["countSmaller([5,2,6,1])", "[2, 1, 1, 0]"],
      ["countSmaller([-1])", "[0]"],
    ],
    hints: [
      "Brute force is O(n²) — aim for O(n log n).",
      "This is a counting-inversions problem — merge sort fits.",
      "Carry each element's original index through the sort.",
      "While merging, count right-half elements that slot before a left element.",
      "Those are exactly the smaller numbers appearing after it.",
    ],
    lines: [
      { c: "enum = list(enumerate(nums))", e: "Keep original indices attached." },
      { c: "left, right = sort(halves)", e: "Recursively sort each half." },
      { c: "for l in left:", e: "For each left element…" },
      { c: "    while right[i] < l: i += 1", e: "…count smaller right elements." },
      { c: "    res[l.index] += i", e: "Record the count at its original position." },
      { c: "return sorted(left+right)", e: "Merge for the parent call." },
    ],
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
    tests: [
      ["findOrder(2, [[1,0]])", "[0, 1]"],
      ["findOrder(4, [[1,0],[2,0],[3,1],[3,2]])", "[0, 1, 2, 3]"],
      ["findOrder(2, [[1,0],[0,1]])", "[]"],
    ],
    hints: [
      "You need an actual ordering, not just feasibility — topological sort.",
      "Kahn's algorithm processes nodes with zero remaining prerequisites.",
      "Track each course's in-degree (number of prerequisites).",
      "Take a zero-in-degree course, then relax its dependents.",
      "If you can't emit all n courses, a cycle exists → return [].",
    ],
    lines: [
      { c: "g[b].append(a); indeg[a] += 1", e: "Edge b → a; a gains a prerequisite." },
      { c: "q = courses with indeg 0", e: "Start with the unblocked courses." },
      { c: "pop c, append to res", e: "Take a ready course." },
      { c: "for nei in g[c]: indeg[nei] -= 1", e: "One prerequisite satisfied." },
      { c: "    if indeg[nei] == 0: enqueue", e: "Now unblocked → ready." },
      { c: "return res if len==n else []", e: "Incomplete → cycle → impossible." },
    ],
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
    tests: [
      ["minRefuelStops(100, 10, [[10,60],[20,30],[30,30],[60,40]])", "2"],
      ["minRefuelStops(1, 1, [])", "0"],
      ["minRefuelStops(100, 1, [[10,100]])", "-1"],
    ],
    hints: [
      "You want the fewest refuels, so each refuel should add as much fuel as possible.",
      "As you drive, remember every station you could have stopped at.",
      "Store their fuel amounts in a max-heap of 'options'.",
      "When you can't reach the target, pop the biggest option (one refuel).",
      "If you're stranded with no options left, it's impossible.",
    ],
    lines: [
      { c: "while fuel < target:", e: "Keep going until you can reach the target." },
      { c: "    add every station with position <= fuel to heap", e: "Bank all reachable fuel options." },
      { c: "    if not heap: return -1", e: "Stranded — impossible." },
      { c: "    fuel += -heappop(heap)", e: "Refuel from the largest available station." },
      { c: "    res += 1", e: "Count the stop." },
      { c: "return res", e: "Fewest refuels needed." },
    ],
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
    tests: [
      ["maxProduct([2,3,-2,4])", "6"],
      ["maxProduct([-2,0,-1])", "0"],
    ],
    hints: [
      "Unlike max-sum, a big negative can become a big positive later.",
      "So track BOTH the max and the min product ending here.",
      "A negative number swaps the roles of max and min.",
      "New extremes come from n alone, max*n, or min*n.",
      "The running best of the max is the answer.",
    ],
    lines: [
      { c: "cur_max = cur_min = res = nums[0]", e: "Seed with the first element." },
      { c: "tmp = cur_max", e: "Save max before overwriting (min needs it)." },
      { c: "cur_max = max(n, tmp*n, cur_min*n)", e: "Best product ending here." },
      { c: "cur_min = min(n, tmp*n, cur_min*n)", e: "Worst product (may flip to best later)." },
      { c: "res = max(res, cur_max)", e: "Track the global best." },
      { c: "return res", e: "Largest subarray product." },
    ],
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
    tests: [
      ["longestValidParentheses(')()())')", "4"],
      ["longestValidParentheses('(()')", "2"],
    ],
    hints: [
      "You want the longest CONTIGUOUS valid run, not just a count.",
      "A stack of indices lets you measure lengths, not just balance.",
      "Seed the stack with -1 as a base 'last invalid' index.",
      "Push indices of '(' ; on ')', pop.",
      "If the stack empties, this ')' is a new base; else length = i − stack top.",
    ],
    lines: [
      { c: "stack = [-1]", e: "Base marker for measuring lengths." },
      { c: "if c == '(': stack.append(i)", e: "Remember this open's index." },
      { c: "else: stack.pop()", e: "Match against the last open." },
      { c: "    if not stack: stack.append(i)", e: "Unmatched ')' becomes the new base." },
      { c: "    else: res = max(res, i-stack[-1])", e: "Valid run length from the base." },
      { c: "return res", e: "Longest valid substring length." },
    ],
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

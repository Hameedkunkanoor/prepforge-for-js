/* =====================================================================
   PYTHON PRIMER — syntax, data structures, and competitive-programming
   essentials. Rendered by python.js with Prism code highlighting.
   ===================================================================== */
window.PYTHON = [
  {
    id: "py-syntax",
    num: "01",
    cat: "--c-compute",
    title: "Syntax Essentials",
    intro: "The core grammar of Python: variables, control flow, and functions. Indentation defines blocks — no braces.",
    items: [
      {
        title: "Variables & types",
        body: "Python is dynamically typed — no type declarations. Common types: int, float, str, bool, and None. Integers are arbitrary precision (no overflow).",
        code: `x = 10            # int (unbounded precision)
pi = 3.14         # float
name = "Ada"      # str
flag = True       # bool
nothing = None    # null value

a, b = 1, 2       # multiple assignment
a, b = b, a       # swap in one line
big = 2 ** 200    # no overflow`,
      },
      {
        title: "Operators",
        body: "Arithmetic, integer division (//), modulo (%), power (**). Comparison and logical operators read like English.",
        code: `7 / 2    # 3.5  (true division)
7 // 2   # 3    (floor division)
7 % 3    # 1    (modulo)
2 ** 10  # 1024 (power)

x = 5
1 <= x <= 10        # chained comparison → True
x > 0 and x < 100   # logical and / or / not
3 if x > 0 else -3  # ternary expression`,
      },
      {
        title: "Conditionals",
        body: "if / elif / else. Any non-empty value is truthy; 0, '', [], {}, None are falsy.",
        code: `if x > 0:
    sign = "positive"
elif x == 0:
    sign = "zero"
else:
    sign = "negative"

if not nums:        # empty list is falsy
    return []`,
      },
      {
        title: "Loops",
        body: "for iterates over any iterable; while loops on a condition. Use range(start, stop, step). break / continue control flow; loops can have an else clause.",
        code: `for i in range(5):        # 0..4
    print(i)
for i in range(2, 10, 2): # 2,4,6,8
    pass
for ch in "abc":
    pass

while x > 0:
    x -= 1

for n in nums:
    if n == target:
        break
else:                     # runs if no break
    print("not found")`,
      },
      {
        title: "Functions & lambda",
        body: "def defines a function; default args, *args, **kwargs are supported. lambda makes a small anonymous function, handy for sort keys.",
        code: `def add(a, b=0):
    return a + b

def variadic(*args, **kwargs):
    return sum(args)

square = lambda x: x * x

# default mutable args are a trap — use None:
def f(acc=None):
    acc = acc or []`,
      },
    ],
  },

  {
    id: "py-types",
    num: "02",
    cat: "--c-storage",
    title: "Built-in Data Types",
    intro: "Lists, tuples, sets, and dicts cover almost every interview need. Know their mutability and average complexity.",
    items: [
      {
        title: "List — dynamic array",
        body: "Ordered, mutable, indexable. Append/pop at the end are O(1); insert/pop at the front are O(n). Works as a stack out of the box.",
        code: `a = [3, 1, 2]
a.append(4)      # O(1) add to end
a.pop()          # O(1) remove from end → stack
a.insert(0, 9)   # O(n) insert at front
a[0], a[-1]      # first, last
a[1:3]           # slice → [1, 2]
a[::-1]          # reversed copy
a.sort()         # in place, O(n log n)
sorted(a)        # returns new sorted list
len(a)`,
      },
      {
        title: "Tuple — immutable sequence",
        body: "Like a list but cannot change. Hashable, so usable as dict keys / set elements. Great for fixed records and coordinates.",
        code: `p = (3, 4)
x, y = p          # unpack
p[0]              # index
key = (r, c)      # use as dict key
single = (5,)     # one-element tuple needs comma`,
      },
      {
        title: "Set — hash set",
        body: "Unordered, unique elements. Membership test, add, and remove are average O(1). Perfect for 'seen' checks and de-duplication.",
        code: `s = {1, 2, 3}
s.add(4)
s.discard(2)      # no error if missing
3 in s            # O(1) membership
a | b             # union
a & b             # intersection
a - b             # difference
seen = set()      # common DSA pattern`,
      },
      {
        title: "Dict — hash map",
        body: "Key→value map with average O(1) get/set/delete. Insertion order is preserved (Python 3.7+). The workhorse of most solutions.",
        code: `d = {"a": 1, "b": 2}
d["c"] = 3        # set
d.get("x", 0)     # default if missing
"a" in d          # key membership
for k, v in d.items():
    pass
d.keys(); d.values()
freq = {}
freq[x] = freq.get(x, 0) + 1`,
      },
    ],
  },

  {
    id: "py-strings",
    num: "03",
    cat: "--c-data",
    title: "Strings In Depth",
    intro: "Strings are immutable sequences of characters. Build them efficiently and use the rich method set.",
    items: [
      {
        title: "Basics & slicing",
        body: "Index and slice like lists. Strings are immutable — every 'edit' creates a new string, so build with a list + join for performance.",
        code: `s = "hello"
s[0]        # 'h'
s[-1]       # 'o'
s[1:4]      # 'ell'
s[::-1]     # 'olleh' (reverse)
len(s)

# efficient build:
parts = []
for w in words:
    parts.append(w)
result = "".join(parts)   # O(n), not O(n^2)`,
      },
      {
        title: "Useful methods",
        body: "Case, search, split/join, strip, and predicates cover most parsing tasks.",
        code: `s.lower(); s.upper()
s.strip()              # trim whitespace
s.split(",")           # → list
",".join(["a","b"])    # → "a,b"
s.replace("a", "b")
s.startswith("he")
s.find("l")            # index or -1
s.isdigit(); s.isalpha()
ord('a'); chr(97)      # char ↔ code`,
      },
      {
        title: "Counting & frequency",
        body: "collections.Counter turns a string into a character/word frequency map instantly — common in anagram and window problems.",
        code: `from collections import Counter
Counter("aabbbc")     # {'b':3,'a':2,'c':1}
Counter(words)        # word frequencies

# anagram check:
Counter(s) == Counter(t)`,
      },
    ],
  },

  {
    id: "py-ds",
    num: "04",
    cat: "--c-cache",
    title: "Data Structures for DSA",
    intro: "The standard-library structures you reach for in interviews: deque, heap, ordered map, and binary search helpers.",
    items: [
      {
        title: "deque — O(1) both ends",
        body: "collections.deque is a double-ended queue. Use it for BFS queues and sliding-window problems — popleft is O(1) (unlike list).",
        code: `from collections import deque
q = deque()
q.append(1)       # push right
q.appendleft(0)   # push left
q.pop()           # pop right
q.popleft()       # pop left — O(1)

# BFS template:
q = deque([start])
while q:
    node = q.popleft()`,
      },
      {
        title: "heapq — min-heap / priority queue",
        body: "A binary min-heap on a list. push/pop are O(log n); peek is heap[0]. For a max-heap, push negated values. nlargest/nsmallest are handy.",
        code: `import heapq
h = []
heapq.heappush(h, 3)
heapq.heappush(h, 1)
heapq.heappop(h)      # 1 (smallest)
h[0]                  # peek min

# max-heap → negate:
heapq.heappush(h, -x)
-heapq.heappop(h)

heapq.nlargest(k, nums)
heapq.heapify(nums)   # O(n)`,
      },
      {
        title: "Counter / defaultdict / OrderedDict",
        body: "Counter counts; defaultdict auto-creates default values (great for adjacency lists); OrderedDict supports move_to_end for LRU caches.",
        code: `from collections import Counter, defaultdict, OrderedDict
cnt = Counter(nums)
cnt.most_common(2)

graph = defaultdict(list)
graph[u].append(v)        # no KeyError

od = OrderedDict()
od.move_to_end(key)       # LRU trick
od.popitem(last=False)    # evict oldest`,
      },
      {
        title: "bisect — binary search on sorted lists",
        body: "bisect_left / bisect_right find insertion points in O(log n); insort keeps a list sorted. Useful for 'longest increasing subsequence' and range queries.",
        code: `import bisect
a = [1, 3, 5, 7]
bisect.bisect_left(a, 5)   # 2
bisect.bisect_right(a, 5)  # 3
bisect.insort(a, 4)        # a → [1,3,4,5,7]`,
      },
    ],
  },

  {
    id: "py-iter",
    num: "05",
    cat: "--c-messaging",
    title: "Iteration & Comprehensions",
    intro: "Pythonic iteration tools make solutions short and readable — enumerate, zip, and comprehensions are everywhere.",
    items: [
      {
        title: "enumerate & zip",
        body: "enumerate gives index+value; zip pairs multiple iterables. Both avoid manual index bookkeeping.",
        code: `for i, val in enumerate(nums):
    pass
for i, val in enumerate(nums, start=1):
    pass

for a, b in zip(list1, list2):
    pass
pairs = list(zip(keys, values))
rows = list(zip(*matrix))   # transpose`,
      },
      {
        title: "Comprehensions",
        body: "Build lists, sets, and dicts in one expression with optional filtering. Clear and fast.",
        code: `squares = [x*x for x in range(5)]
evens = [x for x in nums if x % 2 == 0]
grid = [[0]*cols for _ in range(rows)]   # 2D init
unique = {x for x in nums}
index = {v: i for i, v in enumerate(nums)}`,
      },
      {
        title: "Generators",
        body: "Generators yield values lazily, saving memory. Useful for streaming and infinite sequences.",
        code: `def squares(n):
    for i in range(n):
        yield i * i

gen = (x*x for x in range(1000000))  # lazy
next(gen)
sum(x for x in nums if x > 0)        # no temp list`,
      },
    ],
  },

  {
    id: "py-cp",
    num: "06",
    cat: "--c-reliab",
    title: "Competitive Programming Toolkit",
    intro: "The extra bits that matter under contest constraints: fast I/O, recursion limits, sentinels, and powerful stdlib modules.",
    items: [
      {
        title: "Fast input / output",
        body: "Default input() is slow for large inputs. Read via sys.stdin and print once with '\\n'.join for big outputs.",
        code: `import sys
input = sys.stdin.readline          # faster input
data = sys.stdin.buffer.read().split()

n = int(input())
arr = list(map(int, input().split()))

out = []
out.append(str(answer))
sys.stdout.write("\\n".join(out))`,
      },
      {
        title: "Recursion limit & infinity",
        body: "Deep recursion (e.g. DFS on big trees) hits Python's limit (~1000). Raise it. Use float('inf') as a sentinel for min/max.",
        code: `import sys
sys.setrecursionlimit(10**6)

INF = float('inf')
NEG = float('-inf')
best = INF
for n in nums:
    best = min(best, n)`,
      },
      {
        title: "itertools & math",
        body: "itertools generates combinations/permutations/accumulations; math has gcd, factorial, isqrt, and combinatorics.",
        code: `from itertools import permutations, combinations, product, accumulate
list(permutations([1,2,3]))
list(combinations([1,2,3], 2))
list(product([0,1], repeat=3))
list(accumulate([1,2,3]))   # prefix sums → [1,3,6]

import math
math.gcd(12, 18)            # 6
math.isqrt(17)             # 4
math.comb(5, 2)            # 10`,
      },
      {
        title: "Memoization",
        body: "functools.lru_cache (or cache) memoizes recursive functions automatically — turns exponential recursion into polynomial DP.",
        code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

# Python 3.9+: from functools import cache; @cache`,
      },
    ],
  },

  {
    id: "py-complexity",
    num: "07",
    cat: "--c-consist",
    title: "Complexity Cheat Sheet",
    intro: "Know the cost of the operations you use. Picking the right structure is half the battle.",
    items: [
      {
        title: "Operation costs",
        body: "Average-case time complexity of common operations. list end-ops are cheap; front-ops are expensive (use deque).",
        code: `# list
append / pop (end)   O(1)
insert / pop (front) O(n)
index access a[i]    O(1)
search (x in list)   O(n)
sort                 O(n log n)

# dict / set
get / set / in       O(1) average

# deque
append/pop both ends O(1)

# heap (heapq)
push / pop           O(log n)
peek (h[0])          O(1)

# bisect on sorted
search               O(log n)
insort               O(n)`,
      },
      {
        title: "Pattern → complexity",
        body: "Rough guide to recognize the intended complexity from the constraints (n) of a problem.",
        code: `n <= 10        # O(n!) / backtracking ok
n <= 20        # O(2^n) bitmask DP
n <= 500       # O(n^3)
n <= 5000      # O(n^2)
n <= 1e6       # O(n) or O(n log n)
n  > 1e7       # O(n) / O(log n) only`,
      },
    ],
  },

  {
    id: "py-patterns",
    num: "08",
    cat: "--c-patterns",
    title: "Common Idioms & Patterns",
    intro: "Reusable snippets that show up across dozens of problems. Memorize these shapes.",
    items: [
      {
        title: "Two pointers & sliding window",
        body: "Shrink/grow a window with two indices — used for subarray/substring problems in O(n).",
        code: `# two pointers (sorted)
l, r = 0, len(a) - 1
while l < r:
    if a[l] + a[r] == target: ...
    elif a[l] + a[r] < target: l += 1
    else: r -= 1

# sliding window
l = 0
for r in range(len(s)):
    # expand with s[r]
    while invalid():
        # shrink from left with s[l]
        l += 1`,
      },
      {
        title: "Grid DFS / BFS",
        body: "Traverse a 2D grid with bounds checks and a 4-direction move set.",
        code: `R, C = len(grid), len(grid[0])
def dfs(r, c):
    if r < 0 or c < 0 or r >= R or c >= C: return
    if grid[r][c] != '1': return
    grid[r][c] = '0'
    for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
        dfs(r+dr, c+dc)`,
      },
      {
        title: "Topological sort (Kahn)",
        body: "Order a DAG by repeatedly removing zero in-degree nodes — used for course scheduling and build orders.",
        code: `from collections import deque, defaultdict
indeg = [0]*n
g = defaultdict(list)
for u, v in edges:
    g[u].append(v); indeg[v] += 1
q = deque(i for i in range(n) if indeg[i] == 0)
order = []
while q:
    u = q.popleft(); order.append(u)
    for v in g[u]:
        indeg[v] -= 1
        if indeg[v] == 0: q.append(v)`,
      },
    ],
  },
];

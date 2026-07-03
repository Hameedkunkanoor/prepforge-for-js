/* =====================================================================
   FRESH 20 — original, never-before-seen practice problems (easy → medium).
   Real-world flavored, self-contained. Same schema as PROBLEMS so they
   render on the Problems page and run in the Playground.
   ===================================================================== */
window.FRESH_PROBLEMS = [
  { num: 1, id: "f1", title: "Elevator Stops", category: "Arrays", difficulty: "Easy",
    statement: "Given the sequence of floors an elevator visits, return the number of stops after removing consecutive duplicates (staying on the same floor is not a new stop).",
    idea: "Count a stop only when the floor differs from the previous one.",
    code: `def elevatorStops(floors):
    stops, prev = 0, None
    for f in floors:
        if f != prev:
            stops += 1
            prev = f
    return stops`,
    time: "O(n)", space: "O(1)",
    explanation: "Walk the list once; increment only when the current floor is different from the last counted floor, which collapses runs of the same floor into one stop.",
    trace: ["floors=[3,3,5,5,2]", "3 new →1; 3 same; 5 new →2; 5 same; 2 new →3", "answer 3"] },

  { num: 2, id: "f2", title: "Thermostat Adjustments", category: "Arrays", difficulty: "Easy",
    statement: "Given the desired temperature for each hour, return the total degrees the thermostat changes across the day (sum of absolute differences between consecutive hours).",
    idea: "Sum |t[i] - t[i-1]| over the sequence.",
    code: `def totalAdjust(temps):
    return sum(abs(temps[i] - temps[i-1]) for i in range(1, len(temps)))`,
    time: "O(n)", space: "O(1)",
    explanation: "Each hour the thermostat moves by the absolute change from the previous target; summing those absolute steps gives the total adjustment.",
    trace: ["temps=[20,22,19]", "|22-20|=2, |19-22|=3", "2+3 = 5"] },

  { num: 3, id: "f3", title: "Password Strength", category: "Strings", difficulty: "Easy",
    statement: "Return a strength score 0–4 equal to how many of these a password contains: a lowercase letter, an uppercase letter, a digit, and a special (non-alphanumeric) character.",
    idea: "Test each of the four character classes and count how many are present.",
    code: `def strength(pw):
    lower = any(c.islower() for c in pw)
    upper = any(c.isupper() for c in pw)
    digit = any(c.isdigit() for c in pw)
    special = any(not c.isalnum() for c in pw)
    return sum([lower, upper, digit, special])`,
    time: "O(n)", space: "O(1)",
    explanation: "Four independent membership checks yield booleans; summing booleans (True=1) counts how many categories the password satisfies.",
    trace: ['pw="Ab3!"', "lower✓ upper✓ digit✓ special✓", "answer 4"] },

  { num: 4, id: "f4", title: "Seating Gaps", category: "Arrays", difficulty: "Easy",
    statement: "A row of seats is given as 0 (empty) and 1 (taken). Return the largest number of consecutive empty seats.",
    idea: "Track a running empty-run length; reset on a taken seat.",
    code: `def maxGap(seats):
    best = cur = 0
    for s in seats:
        cur = cur + 1 if s == 0 else 0
        best = max(best, cur)
    return best`,
    time: "O(n)", space: "O(1)",
    explanation: "A classic max-run scan: grow the current empty streak while seats are 0, reset to 0 on a taken seat, and remember the best streak.",
    trace: ["seats=[1,0,0,1,0]", "runs: 0,1,2,0,1", "best = 2"] },

  { num: 5, id: "f5", title: "Loyalty Points", category: "Arrays", difficulty: "Easy",
    statement: "Each purchase earns floor(amount / 10) loyalty points. Given a list of purchase amounts, return the total points earned.",
    idea: "Integer-divide each amount by 10 and sum.",
    code: `def points(purchases):
    return sum(a // 10 for a in purchases)`,
    time: "O(n)", space: "O(1)",
    explanation: "Points per purchase is the whole number of tens in the amount; integer division by 10 gives that, and we sum across purchases.",
    trace: ["purchases=[25,9,100]", "2 + 0 + 10", "answer 12"] },

  { num: 6, id: "f6", title: "Traffic Light Cycle", category: "Math", difficulty: "Easy",
    statement: "A light shows green for g seconds, then yellow for y, then red for r, repeating forever. Given elapsed seconds t, return the current color.",
    idea: "Take t modulo the cycle length, then bucket it.",
    code: `def light(g, y, r, t):
    t %= (g + y + r)
    if t < g:
        return "green"
    if t < g + y:
        return "yellow"
    return "red"`,
    time: "O(1)", space: "O(1)",
    explanation: "The pattern repeats every g+y+r seconds, so t mod cycle gives the position within one cycle; comparing against the green and yellow boundaries picks the color.",
    trace: ["g=5,y=1,r=3,t=6", "cycle 9 → t=6; 6<5? no; 6<6? no", "answer red"] },

  { num: 7, id: "f7", title: "Book Pages", category: "Simulation", difficulty: "Easy",
    statement: "You read p pages every weekday (Mon–Fri) and none on weekends. Starting on a Monday, how many calendar days until you finish a book of N pages?",
    idea: "Simulate day by day, adding pages only on weekdays.",
    code: `def daysToFinish(N, p):
    days = read = dow = 0   # dow: 0=Mon .. 6=Sun
    while read < N:
        if dow < 5:
            read += p
        days += 1
        dow = (dow + 1) % 7
    return days`,
    time: "O(N/p)", space: "O(1)",
    explanation: "We step through calendar days tracking the day of week; weekdays add p pages, weekends add none. We stop the first day total pages reach N.",
    trace: ["N=30,p=10", "Mon 10, Tue 20, Wed 30", "answer 3 days"] },

  { num: 8, id: "f8", title: "Warehouse Restock", category: "Arrays", difficulty: "Easy",
    statement: "Given current stock and required demand per item (two equal-length lists), return how many items need restocking (stock is strictly less than demand).",
    idea: "Zip the lists and count positions where stock < demand.",
    code: `def restockCount(stock, demand):
    return sum(1 for s, d in zip(stock, demand) if s < d)`,
    time: "O(n)", space: "O(1)",
    explanation: "Pair each item's stock with its demand and count the pairs that fall short — those are the items needing a restock.",
    trace: ["stock=[5,2,8], demand=[3,4,8]", "5<3 no; 2<4 yes; 8<8 no", "answer 1"] },

  { num: 9, id: "f9", title: "Step Streak", category: "Arrays", difficulty: "Easy",
    statement: "Given daily step counts and a goal, return the length of the longest streak of consecutive days that met or exceeded the goal.",
    idea: "Running-streak scan; reset when a day misses the goal.",
    code: `def longestStreak(steps, goal):
    best = cur = 0
    for s in steps:
        cur = cur + 1 if s >= goal else 0
        best = max(best, cur)
    return best`,
    time: "O(n)", space: "O(1)",
    explanation: "Increment the current streak while days hit the goal, reset to zero on a miss, and track the maximum streak seen.",
    trace: ["steps=[8k,10k,12k,3k,9k], goal=9k", "streaks: 0,1,2,0,1", "best = 2"] },

  { num: 10, id: "f10", title: "Coffee Machine", category: "Math", difficulty: "Easy",
    statement: "Each cup needs w ml water, m ml milk and b g beans. Given available water, milk and beans, return the maximum number of cups you can make.",
    idea: "The bottleneck ingredient limits cups; take the min of the three ratios.",
    code: `def maxCups(water, milk, beans, w, m, b):
    return min(water // w, milk // m, beans // b)`,
    time: "O(1)", space: "O(1)",
    explanation: "Each ingredient independently allows a whole number of cups (available // per-cup). You can only make as many as the scarcest ingredient allows — the minimum.",
    trace: ["water1000,milk500,beans300; w200,m100,b50", "min(5,5,6)", "answer 5"] },

  { num: 11, id: "f11", title: "Playlist Balanced", category: "Arrays", difficulty: "Easy",
    statement: "Given a list of song genres in play order, return True if no two adjacent songs share the same genre.",
    idea: "Check every adjacent pair differs.",
    code: `def isBalanced(genres):
    return all(genres[i] != genres[i-1] for i in range(1, len(genres)))`,
    time: "O(n)", space: "O(1)",
    explanation: "A playlist is balanced exactly when every neighboring pair is different; all() short-circuits to False on the first repeat.",
    trace: ['["pop","rock","pop"]', "pop≠rock, rock≠pop", "answer True"] },

  { num: 12, id: "f12", title: "Meeting Overlap Count", category: "Intervals", difficulty: "Easy",
    statement: "Given meetings as [start, end] and a timestamp t, return how many meetings are ongoing at t (start ≤ t < end).",
    idea: "Count intervals that contain t.",
    code: `def ongoing(meetings, t):
    return sum(1 for s, e in meetings if s <= t < e)`,
    time: "O(n)", space: "O(1)",
    explanation: "A meeting is ongoing at t if it has started (s ≤ t) and not yet ended (t < e); count those.",
    trace: ["[[9,10],[9,11],[10,12]], t=9", "9∈[9,10)✓, 9∈[9,11)✓, 9∈[10,12)✗", "answer 2"] },

  { num: 13, id: "f13", title: "Discount Tier", category: "Math", difficulty: "Easy",
    statement: "Return the discount percent for an order total: 20 if total ≥ 200, 10 if ≥ 100, 5 if ≥ 50, otherwise 0.",
    idea: "Check thresholds from highest to lowest.",
    code: `def discount(total):
    for thr, pct in [(200, 20), (100, 10), (50, 5)]:
        if total >= thr:
            return pct
    return 0`,
    time: "O(1)", space: "O(1)",
    explanation: "Testing thresholds top-down returns the first (largest) tier the total qualifies for; if none, the discount is 0.",
    trace: ["total=150", "≥200? no; ≥100? yes", "answer 10"] },

  { num: 14, id: "f14", title: "Parking Fee", category: "Math", difficulty: "Medium",
    statement: "Parking costs $2 for the first 60 minutes, then $1 per additional 30 minutes (rounded up). Given the minutes parked, return the fee.",
    idea: "Flat fee, then ceil the overage in 30-minute blocks.",
    code: `import math

def fee(minutes):
    if minutes <= 60:
        return 2
    extra = minutes - 60
    return 2 + math.ceil(extra / 30)`,
    time: "O(1)", space: "O(1)",
    explanation: "Up to an hour is a flat $2; beyond that, each started 30-minute block adds $1, so we ceil the extra minutes over 30.",
    trace: ["minutes=100", "extra=40 → ceil(40/30)=2", "2 + 2 = $4"] },

  { num: 15, id: "f15", title: "Temperature Anomaly", category: "Arrays", difficulty: "Easy",
    statement: "Return the indices where the temperature rises more than d degrees compared to the previous reading.",
    idea: "Compare consecutive readings; collect indices of big jumps.",
    code: `def anomalies(temps, d):
    return [i for i in range(1, len(temps)) if temps[i] - temps[i-1] > d]`,
    time: "O(n)", space: "O(n)",
    explanation: "Scan neighboring readings; whenever the increase exceeds the threshold d, record that index as an anomaly.",
    trace: ["temps=[20,21,30,29], d=5", "Δ: 1,9,-1 → only 9>5 at i=2", "answer [2]"] },

  { num: 16, id: "f16", title: "Vowel Encoder", category: "Strings", difficulty: "Easy",
    statement: "Replace each vowel with the next vowel in the cycle a→e→i→o→u→a; leave every other character unchanged.",
    idea: "Map each vowel to its successor; pass others through.",
    code: `def encode(s):
    nxt = {'a':'e','e':'i','i':'o','o':'u','u':'a'}
    return ''.join(nxt.get(c, c) for c in s)`,
    time: "O(n)", space: "O(n)",
    explanation: "A lookup table maps each vowel to the next; dict.get returns the character itself when it isn't a vowel, so consonants pass through.",
    trace: ['s="cat"', "c→c, a→e, t→t", 'answer "cet"'] },

  { num: 17, id: "f17", title: "Score Normalization", category: "Arrays", difficulty: "Easy",
    statement: "Scale each raw score to a 0–100 scale given the maximum possible score, returning integers (floor).",
    idea: "Multiply by 100 then integer-divide by the max.",
    code: `def normalize(scores, max_score):
    return [s * 100 // max_score for s in scores]`,
    time: "O(n)", space: "O(n)",
    explanation: "Multiplying before dividing keeps integer precision; s*100//max maps a raw score onto the 0–100 range, floored.",
    trace: ["scores=[40,50], max=50", "4000//50=80, 5000//50=100", "answer [80,100]"] },

  { num: 18, id: "f18", title: "Inventory Merge", category: "Hashing", difficulty: "Easy",
    statement: "Merge two inventories (dicts of item → quantity) by summing quantities for shared items.",
    idea: "Copy the first, then add the second's counts.",
    code: `def merge(a, b):
    out = dict(a)
    for k, v in b.items():
        out[k] = out.get(k, 0) + v
    return out`,
    time: "O(n)", space: "O(n)",
    explanation: "Start from a copy of the first dict, then accumulate each item from the second using get(...,0) so new items start at zero.",
    trace: ['{"pen":2} + {"pen":3,"cup":1}', "pen 2+3=5, cup 0+1=1", '{"pen":5,"cup":1}'] },

  { num: 19, id: "f19", title: "Route Distance", category: "Math", difficulty: "Easy",
    statement: "Given a list of moves as (dx, dy) pairs, return the Manhattan distance from the origin after applying all moves.",
    idea: "Sum the deltas, then take |x| + |y|.",
    code: `def routeDistance(moves):
    x = y = 0
    for dx, dy in moves:
        x += dx
        y += dy
    return abs(x) + abs(y)`,
    time: "O(n)", space: "O(1)",
    explanation: "Accumulate the net horizontal and vertical displacement, then Manhattan distance is the sum of absolute coordinates.",
    trace: ["[(1,2),(-3,1)]", "x=-2, y=3", "|-2|+|3| = 5"] },

  { num: 20, id: "f20", title: "Balanced Split", category: "Arrays", difficulty: "Medium",
    statement: "Return True if the array can be split into two contiguous, non-empty parts whose sums are equal.",
    idea: "Prefix sum: a split at i works when the left sum is half the total.",
    code: `def canSplit(nums):
    total = sum(nums)
    left = 0
    for i in range(len(nums) - 1):
        left += nums[i]
        if left * 2 == total:
            return True
    return False`,
    time: "O(n)", space: "O(1)",
    explanation: "As we extend the left part, its sum equals the right part exactly when it is half the total (left*2==total); we test each split point before the last element.",
    trace: ["nums=[2,3,5]", "total=10; left after i=1 is 5; 5*2==10 ✓", "answer True"] },
];

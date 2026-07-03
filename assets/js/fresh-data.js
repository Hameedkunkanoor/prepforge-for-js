/* =====================================================================
   FRESH 20 — original, never-before-seen practice problems (easy → medium).
   Each has: statement, test cases, 5 hints, Python solution, a line-by-line
   walkthrough, complexity, explanation and trace.
   ===================================================================== */
window.FRESH_PROBLEMS = [
  { num: 1, id: "f1", title: "Elevator Stops", category: "Arrays", difficulty: "Easy",
    statement: "Given the sequence of floors an elevator visits, return the number of stops after removing consecutive duplicates (staying on the same floor is not a new stop).",
    idea: "Count a stop only when the floor differs from the previous one.",
    tests: [["elevatorStops([3,3,5,5,2])", "3"], ["elevatorStops([1,1,1])", "1"], ["elevatorStops([])", "0"]],
    hints: ["Consecutive identical floors are one stop.", "Remember the last floor you counted.", "Only count when the current floor differs from it.", "Update the remembered floor each time you count.", "An empty list has zero stops."],
    code: `def elevatorStops(floors):
    stops, prev = 0, None
    for f in floors:
        if f != prev:
            stops += 1
            prev = f
    return stops`,
    lines: [
      { c: "stops, prev = 0, None", e: "Counter of stops and the last floor we counted (None so the first floor always counts)." },
      { c: "for f in floors:", e: "Walk each visited floor in order." },
      { c: "if f != prev:", e: "Only a different floor is a new stop." },
      { c: "stops += 1; prev = f", e: "Count it and remember this floor." },
      { c: "return stops", e: "Total distinct consecutive stops." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Increment only when the current floor differs from the last counted floor, collapsing runs into one stop.",
    trace: ["[3,3,5,5,2]", "3→1, 5→2, 2→3", "answer 3"] },

  { num: 2, id: "f2", title: "Thermostat Adjustments", category: "Arrays", difficulty: "Easy",
    statement: "Given the desired temperature for each hour, return the total degrees the thermostat changes across the day (sum of absolute differences between consecutive hours).",
    idea: "Sum |t[i] - t[i-1]| over the sequence.",
    tests: [["totalAdjust([20,22,19])", "5"], ["totalAdjust([21])", "0"], ["totalAdjust([10,10,10])", "0"]],
    hints: ["Each hour the thermostat moves by some amount.", "The move is the difference from the previous target.", "Direction doesn't matter, so use absolute value.", "Sum those absolute changes.", "A single reading needs no adjustment."],
    code: `def totalAdjust(temps):
    return sum(abs(temps[i] - temps[i-1]) for i in range(1, len(temps)))`,
    lines: [
      { c: "for i in range(1, len(temps))", e: "Compare each hour with the one before it (start at index 1)." },
      { c: "abs(temps[i] - temps[i-1])", e: "The absolute change between consecutive hours." },
      { c: "sum(...)", e: "Add all the hourly changes for the day's total." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Each hour the thermostat moves by the absolute change from the previous target; summing gives the total.",
    trace: ["[20,22,19]", "|22-20|=2, |19-22|=3", "answer 5"] },

  { num: 3, id: "f3", title: "Password Strength", category: "Strings", difficulty: "Easy",
    statement: "Return a strength score 0–4 equal to how many of these a password contains: a lowercase letter, an uppercase letter, a digit, and a special (non-alphanumeric) character.",
    idea: "Test each of the four character classes and count how many are present.",
    tests: [["strength('Ab3!')", "4"], ["strength('abc')", "1"], ["strength('Abc1')", "3"]],
    hints: ["There are four categories to check.", "Use str methods: islower, isupper, isdigit.", "A special char is one that is not alphanumeric (not isalnum).", "any(...) tells you if at least one char in a class exists.", "Sum the four booleans (True counts as 1)."],
    code: `def strength(pw):
    lower = any(c.islower() for c in pw)
    upper = any(c.isupper() for c in pw)
    digit = any(c.isdigit() for c in pw)
    special = any(not c.isalnum() for c in pw)
    return sum([lower, upper, digit, special])`,
    lines: [
      { c: "lower = any(c.islower() for c in pw)", e: "True if any lowercase letter is present." },
      { c: "upper = any(c.isupper() for c in pw)", e: "True if any uppercase letter is present." },
      { c: "digit = any(c.isdigit() for c in pw)", e: "True if any digit is present." },
      { c: "special = any(not c.isalnum() for c in pw)", e: "True if any non-alphanumeric (special) char is present." },
      { c: "return sum([...])", e: "Booleans sum as 0/1, giving the 0–4 strength score." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Four membership checks yield booleans; summing counts how many categories the password satisfies.",
    trace: ["'Ab3!'", "lower✓ upper✓ digit✓ special✓", "answer 4"] },

  { num: 4, id: "f4", title: "Seating Gaps", category: "Arrays", difficulty: "Easy",
    statement: "A row of seats is given as 0 (empty) and 1 (taken). Return the largest number of consecutive empty seats.",
    idea: "Track a running empty-run length; reset on a taken seat.",
    tests: [["maxGap([1,0,0,1,0])", "2"], ["maxGap([1,1,1])", "0"], ["maxGap([0,0,0])", "3"]],
    hints: ["You want the longest run of zeros.", "Keep a current run length.", "Add one for each empty seat.", "Reset to zero on a taken seat.", "Track the maximum run seen."],
    code: `def maxGap(seats):
    best = cur = 0
    for s in seats:
        cur = cur + 1 if s == 0 else 0
        best = max(best, cur)
    return best`,
    lines: [
      { c: "best = cur = 0", e: "Best run found and the current run length." },
      { c: "cur = cur + 1 if s == 0 else 0", e: "Grow the streak on an empty seat, reset on a taken one." },
      { c: "best = max(best, cur)", e: "Remember the longest streak." },
      { c: "return best", e: "Largest gap of empty seats." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "A max-run scan: grow while seats are 0, reset on a 1, and remember the best streak.",
    trace: ["[1,0,0,1,0]", "runs 0,1,2,0,1", "answer 2"] },

  { num: 5, id: "f5", title: "Loyalty Points", category: "Arrays", difficulty: "Easy",
    statement: "Each purchase earns floor(amount / 10) loyalty points. Given a list of purchase amounts, return the total points earned.",
    idea: "Integer-divide each amount by 10 and sum.",
    tests: [["points([25,9,100])", "12"], ["points([5])", "0"], ["points([10,20,30])", "6"]],
    hints: ["Points per purchase is the number of full tens.", "Integer division // gives whole tens.", "amount // 10 for each purchase.", "Sum across all purchases.", "Amounts under 10 earn nothing."],
    code: `def points(purchases):
    return sum(a // 10 for a in purchases)`,
    lines: [
      { c: "a // 10", e: "Whole number of 10s in each purchase = points for it." },
      { c: "sum(...)", e: "Add points across all purchases." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Points per purchase is the whole number of tens; integer division by 10 gives that, summed across purchases.",
    trace: ["[25,9,100]", "2 + 0 + 10", "answer 12"] },

  { num: 6, id: "f6", title: "Traffic Light Cycle", category: "Math", difficulty: "Easy",
    statement: "A light shows green for g seconds, then yellow for y, then red for r, repeating forever. Given elapsed seconds t, return the current color.",
    idea: "Take t modulo the cycle length, then bucket it.",
    tests: [["light(5,1,3,0)", "'green'"], ["light(5,1,3,5)", "'yellow'"], ["light(5,1,3,8)", "'red'"]],
    hints: ["The pattern repeats every g+y+r seconds.", "Use modulo to find the position in one cycle.", "First g seconds are green.", "Next y seconds are yellow.", "The rest are red."],
    code: `def light(g, y, r, t):
    t %= (g + y + r)
    if t < g:
        return "green"
    if t < g + y:
        return "yellow"
    return "red"`,
    lines: [
      { c: "t %= (g + y + r)", e: "Reduce t to its position within a single cycle." },
      { c: "if t < g: return 'green'", e: "The first g seconds are green." },
      { c: "if t < g + y: return 'yellow'", e: "The next y seconds are yellow." },
      { c: "return 'red'", e: "Everything after is red." },
    ],
    time: "O(1)", space: "O(1)",
    explanation: "The pattern repeats every g+y+r seconds; t mod cycle gives the position, and boundaries pick the color.",
    trace: ["g5,y1,r3,t5", "cycle 9 → t=5; 5<5? no; 5<6? yes", "answer yellow"] },

  { num: 7, id: "f7", title: "Book Pages", category: "Simulation", difficulty: "Easy",
    statement: "You read p pages every weekday (Mon–Fri) and none on weekends. Starting on a Monday, how many calendar days until you finish a book of N pages?",
    idea: "Simulate day by day, adding pages only on weekdays.",
    tests: [["daysToFinish(30,10)", "3"], ["daysToFinish(50,10)", "7"], ["daysToFinish(0,10)", "0"]],
    hints: ["Simulate the calendar day by day.", "Track the day of week (0=Mon..6=Sun).", "Add pages only when the day is a weekday.", "Count every calendar day, weekend or not.", "Stop once pages read reach N."],
    code: `def daysToFinish(N, p):
    days = read = dow = 0
    while read < N:
        if dow < 5:
            read += p
        days += 1
        dow = (dow + 1) % 7
    return days`,
    lines: [
      { c: "days = read = dow = 0", e: "Calendar days elapsed, pages read, and day-of-week (0=Monday)." },
      { c: "while read < N:", e: "Keep going until the book is finished." },
      { c: "if dow < 5: read += p", e: "Weekdays (Mon–Fri) add p pages; weekends add none." },
      { c: "days += 1; dow = (dow + 1) % 7", e: "Advance one calendar day, wrapping the week." },
      { c: "return days", e: "Number of calendar days to finish." },
    ],
    time: "O(N/p)", space: "O(1)",
    explanation: "Step through calendar days tracking the weekday; weekdays add pages, weekends don't. Stop when total reaches N.",
    trace: ["N=30,p=10", "Mon10, Tue20, Wed30", "answer 3"] },

  { num: 8, id: "f8", title: "Warehouse Restock", category: "Arrays", difficulty: "Easy",
    statement: "Given current stock and required demand per item (two equal-length lists), return how many items need restocking (stock is strictly less than demand).",
    idea: "Zip the lists and count positions where stock < demand.",
    tests: [["restockCount([5,2,8],[3,4,8])", "1"], ["restockCount([0,0],[1,1])", "2"], ["restockCount([9,9],[1,1])", "0"]],
    hints: ["Pair each item's stock with its demand.", "zip lets you iterate both lists together.", "An item needs restock when stock < demand.", "Count how many pairs satisfy that.", "Equal stock and demand does NOT need restock."],
    code: `def restockCount(stock, demand):
    return sum(1 for s, d in zip(stock, demand) if s < d)`,
    lines: [
      { c: "zip(stock, demand)", e: "Iterate matching (stock, demand) pairs together." },
      { c: "if s < d", e: "This item falls short and needs a restock." },
      { c: "sum(1 for ...)", e: "Count the shortfall items." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Pair each item's stock with demand and count the pairs that fall short.",
    trace: ["[5,2,8],[3,4,8]", "5<3 no, 2<4 yes, 8<8 no", "answer 1"] },

  { num: 9, id: "f9", title: "Step Streak", category: "Arrays", difficulty: "Easy",
    statement: "Given daily step counts and a goal, return the length of the longest streak of consecutive days that met or exceeded the goal.",
    idea: "Running-streak scan; reset when a day misses the goal.",
    tests: [["longestStreak([8000,10000,12000,3000,9000],9000)", "2"], ["longestStreak([1,2,3],5)", "0"], ["longestStreak([9,9,9],9)", "3"]],
    hints: ["You want the longest run of successful days.", "Keep a current streak length.", "A day meeting the goal extends the streak.", "A miss resets it to zero.", "Track the maximum streak."],
    code: `def longestStreak(steps, goal):
    best = cur = 0
    for s in steps:
        cur = cur + 1 if s >= goal else 0
        best = max(best, cur)
    return best`,
    lines: [
      { c: "best = cur = 0", e: "Longest streak found and the current streak." },
      { c: "cur = cur + 1 if s >= goal else 0", e: "Extend on a good day, reset on a miss." },
      { c: "best = max(best, cur)", e: "Track the best streak seen." },
      { c: "return best", e: "Longest consecutive goal-meeting streak." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Increment while days hit the goal, reset on a miss, track the max.",
    trace: ["...goal 9000", "streaks 0,1,2,0,1", "answer 2"] },

  { num: 10, id: "f10", title: "Coffee Machine", category: "Math", difficulty: "Easy",
    statement: "Each cup needs w ml water, m ml milk and b g beans. Given available water, milk and beans, return the maximum number of cups you can make.",
    idea: "The bottleneck ingredient limits cups; take the min of the three ratios.",
    tests: [["maxCups(1000,500,300,200,100,50)", "5"], ["maxCups(100,100,100,50,50,50)", "2"], ["maxCups(0,500,300,200,100,50)", "0"]],
    hints: ["Each ingredient allows a certain number of cups.", "That's available // per-cup for each.", "You're limited by the scarcest ingredient.", "So take the minimum of the three.", "Integer division gives whole cups."],
    code: `def maxCups(water, milk, beans, w, m, b):
    return min(water // w, milk // m, beans // b)`,
    lines: [
      { c: "water // w", e: "How many cups the water alone allows." },
      { c: "milk // m, beans // b", e: "Same for milk and beans." },
      { c: "min(...)", e: "The scarcest ingredient caps the number of cups." },
    ],
    time: "O(1)", space: "O(1)",
    explanation: "Each ingredient allows a whole number of cups; the minimum is the real limit.",
    trace: ["water1000/200=5, milk5, beans6", "min(5,5,6)", "answer 5"] },

  { num: 11, id: "f11", title: "Playlist Balanced", category: "Arrays", difficulty: "Easy",
    statement: "Given a list of song genres in play order, return True if no two adjacent songs share the same genre.",
    idea: "Check every adjacent pair differs.",
    tests: [["isBalanced(['pop','rock','pop'])", "True"], ["isBalanced(['pop','pop'])", "False"], ["isBalanced(['jazz'])", "True"]],
    hints: ["'Balanced' means neighbors differ.", "Compare each song with the previous one.", "If any pair matches, it's not balanced.", "all(...) is True only if every pair differs.", "A single song is trivially balanced."],
    code: `def isBalanced(genres):
    return all(genres[i] != genres[i-1] for i in range(1, len(genres)))`,
    lines: [
      { c: "range(1, len(genres))", e: "Compare each song with the one before it." },
      { c: "genres[i] != genres[i-1]", e: "Neighbors must differ." },
      { c: "all(...)", e: "True only if every adjacent pair differs." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Balanced exactly when every neighboring pair is different; all() short-circuits on the first repeat.",
    trace: ["['pop','rock','pop']", "pop≠rock, rock≠pop", "answer True"] },

  { num: 12, id: "f12", title: "Meeting Overlap Count", category: "Intervals", difficulty: "Easy",
    statement: "Given meetings as [start, end] and a timestamp t, return how many meetings are ongoing at t (start ≤ t < end).",
    idea: "Count intervals that contain t.",
    tests: [["ongoing([[9,10],[9,11],[10,12]],9)", "2"], ["ongoing([[9,10]],10)", "0"], ["ongoing([[8,12]],10)", "1"]],
    hints: ["A meeting is ongoing if it has started and not ended.", "Started means start <= t.", "Not ended means t < end.", "Count meetings satisfying both.", "Use chained comparison s <= t < e."],
    code: `def ongoing(meetings, t):
    return sum(1 for s, e in meetings if s <= t < e)`,
    lines: [
      { c: "for s, e in meetings", e: "Unpack each meeting's start and end." },
      { c: "s <= t < e", e: "Ongoing: started (s≤t) and not yet ended (t<e)." },
      { c: "sum(1 for ...)", e: "Count the ongoing meetings." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "A meeting is ongoing at t if it has started and not yet ended; count those.",
    trace: ["t=9", "[9,10)✓ [9,11)✓ [10,12)✗", "answer 2"] },

  { num: 13, id: "f13", title: "Discount Tier", category: "Math", difficulty: "Easy",
    statement: "Return the discount percent for an order total: 20 if total ≥ 200, 10 if ≥ 100, 5 if ≥ 50, otherwise 0.",
    idea: "Check thresholds from highest to lowest.",
    tests: [["discount(150)", "10"], ["discount(200)", "20"], ["discount(10)", "0"]],
    hints: ["Higher totals get bigger discounts.", "Check the largest threshold first.", "Return as soon as one matches.", "Order matters: 200 before 100 before 50.", "Below 50 gets nothing."],
    code: `def discount(total):
    for thr, pct in [(200, 20), (100, 10), (50, 5)]:
        if total >= thr:
            return pct
    return 0`,
    lines: [
      { c: "for thr, pct in [(200,20),(100,10),(50,5)]", e: "Tiers from highest threshold to lowest." },
      { c: "if total >= thr: return pct", e: "First tier the total reaches wins." },
      { c: "return 0", e: "Below all thresholds → no discount." },
    ],
    time: "O(1)", space: "O(1)",
    explanation: "Testing thresholds top-down returns the first (largest) tier the total qualifies for.",
    trace: ["total=150", "≥200? no; ≥100? yes", "answer 10"] },

  { num: 14, id: "f14", title: "Parking Fee", category: "Math", difficulty: "Medium",
    statement: "Parking costs $2 for the first 60 minutes, then $1 per additional 30 minutes (rounded up). Given the minutes parked, return the fee.",
    idea: "Flat fee, then ceil the overage in 30-minute blocks.",
    tests: [["fee(100)", "4"], ["fee(60)", "2"], ["fee(61)", "3"]],
    hints: ["The first hour is a flat charge.", "Beyond 60 minutes, charge per 30-minute block.", "A partial block still costs a full dollar (round up).", "Use math.ceil on the extra minutes / 30.", "extra = minutes - 60."],
    code: `import math

def fee(minutes):
    if minutes <= 60:
        return 2
    extra = minutes - 60
    return 2 + math.ceil(extra / 30)`,
    lines: [
      { c: "if minutes <= 60: return 2", e: "Up to an hour is a flat $2." },
      { c: "extra = minutes - 60", e: "Minutes beyond the first hour." },
      { c: "2 + math.ceil(extra / 30)", e: "Each started 30-minute block adds $1 (ceil rounds partial blocks up)." },
    ],
    time: "O(1)", space: "O(1)",
    explanation: "Flat $2 for the hour; beyond that each started 30-minute block adds $1, so ceil the extra over 30.",
    trace: ["minutes=100", "extra 40 → ceil(40/30)=2", "2+2 = $4"] },

  { num: 15, id: "f15", title: "Temperature Anomaly", category: "Arrays", difficulty: "Easy",
    statement: "Return the indices where the temperature rises more than d degrees compared to the previous reading.",
    idea: "Compare consecutive readings; collect indices of big jumps.",
    tests: [["anomalies([20,21,30,29],5)", "[2]"], ["anomalies([1,2,3],5)", "[]"], ["anomalies([0,10,0],5)", "[1]"]],
    hints: ["Compare each reading with the one before.", "You care about rises, so temps[i] - temps[i-1].", "A rise bigger than d is an anomaly.", "Collect those indices.", "Start comparing from index 1."],
    code: `def anomalies(temps, d):
    return [i for i in range(1, len(temps)) if temps[i] - temps[i-1] > d]`,
    lines: [
      { c: "range(1, len(temps))", e: "Compare each reading with the previous one." },
      { c: "temps[i] - temps[i-1] > d", e: "A rise exceeding the threshold d is an anomaly." },
      { c: "[i for ...]", e: "Collect the indices where that happens." },
    ],
    time: "O(n)", space: "O(n)",
    explanation: "Scan neighboring readings; record indices where the increase exceeds d.",
    trace: ["[20,21,30,29],d=5", "Δ 1,9,-1 → 9>5 at i=2", "answer [2]"] },

  { num: 16, id: "f16", title: "Vowel Encoder", category: "Strings", difficulty: "Easy",
    statement: "Replace each vowel with the next vowel in the cycle a→e→i→o→u→a; leave every other character unchanged.",
    idea: "Map each vowel to its successor; pass others through.",
    tests: [["encode('cat')", "'cet'"], ["encode('queue')", "'qaiai'"], ["encode('xyz')", "'xyz'"]],
    hints: ["Only vowels change.", "Build a mapping vowel → next vowel.", "u wraps back to a.", "For non-vowels, keep the character.", "dict.get(c, c) returns c when it's not a key."],
    code: `def encode(s):
    nxt = {'a':'e','e':'i','i':'o','o':'u','u':'a'}
    return ''.join(nxt.get(c, c) for c in s)`,
    lines: [
      { c: "nxt = {'a':'e', ... 'u':'a'}", e: "Each vowel maps to the next; u cycles to a." },
      { c: "nxt.get(c, c)", e: "Replace a vowel; otherwise return the character unchanged." },
      { c: "''.join(...)", e: "Rebuild the transformed string." },
    ],
    time: "O(n)", space: "O(n)",
    explanation: "A lookup maps vowels to their successors; get returns the char itself for non-vowels.",
    trace: ["'cat'", "c→c, a→e, t→t", "answer 'cet'"] },

  { num: 17, id: "f17", title: "Score Normalization", category: "Arrays", difficulty: "Easy",
    statement: "Scale each raw score to a 0–100 scale given the maximum possible score, returning integers (floor).",
    idea: "Multiply by 100 then integer-divide by the max.",
    tests: [["normalize([40,50],50)", "[80, 100]"], ["normalize([0],10)", "[0]"], ["normalize([5,10],20)", "[25, 50]"]],
    hints: ["A score of max should map to 100.", "So the scale factor is 100 / max.", "Multiply before dividing to keep integer precision.", "s * 100 // max.", "Do it for every score."],
    code: `def normalize(scores, max_score):
    return [s * 100 // max_score for s in scores]`,
    lines: [
      { c: "s * 100", e: "Scale up first to preserve integer precision." },
      { c: "// max_score", e: "Divide by the maximum to map onto 0–100 (floored)." },
      { c: "[... for s in scores]", e: "Apply to every score." },
    ],
    time: "O(n)", space: "O(n)",
    explanation: "Multiplying before dividing keeps precision; s*100//max maps a raw score onto 0–100, floored.",
    trace: ["[40,50], max50", "4000//50=80, 5000//50=100", "answer [80,100]"] },

  { num: 18, id: "f18", title: "Inventory Merge", category: "Hashing", difficulty: "Easy",
    statement: "Merge two inventories (dicts of item → quantity) by summing quantities for shared items.",
    idea: "Copy the first, then add the second's counts.",
    tests: [["merge({'pen':2}, {'pen':3,'cup':1})", "{'pen': 5, 'cup': 1}"], ["merge({}, {'a':1})", "{'a': 1}"]],
    hints: ["Start from a copy of the first dict.", "Add each item from the second.", "Shared items should sum their quantities.", "get(k, 0) defaults new items to zero.", "Don't mutate the input dicts."],
    code: `def merge(a, b):
    out = dict(a)
    for k, v in b.items():
        out[k] = out.get(k, 0) + v
    return out`,
    lines: [
      { c: "out = dict(a)", e: "Copy the first inventory so inputs aren't mutated." },
      { c: "for k, v in b.items()", e: "Go through the second inventory." },
      { c: "out[k] = out.get(k, 0) + v", e: "Add quantities; get(...,0) handles new items." },
      { c: "return out", e: "The merged inventory." },
    ],
    time: "O(n)", space: "O(n)",
    explanation: "Copy the first, then accumulate each item from the second using get(...,0) for new keys.",
    trace: ["{'pen':2}+{'pen':3,'cup':1}", "pen 5, cup 1", "answer {'pen':5,'cup':1}"] },

  { num: 19, id: "f19", title: "Route Distance", category: "Math", difficulty: "Easy",
    statement: "Given a list of moves as (dx, dy) pairs, return the Manhattan distance from the origin after applying all moves.",
    idea: "Sum the deltas, then take |x| + |y|.",
    tests: [["routeDistance([(1,2),(-3,1)])", "5"], ["routeDistance([])", "0"], ["routeDistance([(3,-4)])", "7"]],
    hints: ["Track your position as you move.", "Add each dx to x and dy to y.", "Manhattan distance ignores direction.", "It's |x| + |y| from the origin.", "Start at (0,0)."],
    code: `def routeDistance(moves):
    x = y = 0
    for dx, dy in moves:
        x += dx
        y += dy
    return abs(x) + abs(y)`,
    lines: [
      { c: "x = y = 0", e: "Start at the origin." },
      { c: "x += dx; y += dy", e: "Apply each move to the running position." },
      { c: "return abs(x) + abs(y)", e: "Manhattan distance is the sum of absolute coordinates." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "Accumulate net displacement, then Manhattan distance is |x|+|y|.",
    trace: ["[(1,2),(-3,1)]", "x=-2, y=3", "answer 5"] },

  { num: 20, id: "f20", title: "Balanced Split", category: "Arrays", difficulty: "Medium",
    statement: "Return True if the array can be split into two contiguous, non-empty parts whose sums are equal.",
    idea: "Prefix sum: a split at i works when the left sum is half the total.",
    tests: [["canSplit([2,3,5])", "True"], ["canSplit([1,2,3])", "True"], ["canSplit([1,1,1])", "False"]],
    hints: ["You split into a left part and a right part.", "Their sums are equal when each is half the total.", "Track a running left-side sum.", "Compare left*2 with the total to avoid fractions.", "Don't allow an empty right side."],
    code: `def canSplit(nums):
    total = sum(nums)
    left = 0
    for i in range(len(nums) - 1):
        left += nums[i]
        if left * 2 == total:
            return True
    return False`,
    lines: [
      { c: "total = sum(nums)", e: "Sum of the whole array." },
      { c: "for i in range(len(nums) - 1)", e: "Try each split point, leaving the right side non-empty." },
      { c: "left += nums[i]", e: "Extend the left part." },
      { c: "if left * 2 == total: return True", e: "Left equals right exactly when left is half the total." },
      { c: "return False", e: "No balanced split exists." },
    ],
    time: "O(n)", space: "O(1)",
    explanation: "As the left part grows, its sum equals the right exactly when it is half the total; test each split before the last element.",
    trace: ["[2,3,5]", "total 10; left 5 after i=1; 5*2==10", "answer True"] },
];

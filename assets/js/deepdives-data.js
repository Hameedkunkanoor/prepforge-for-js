/* =====================================================================
   DEEP DIVES — full mastery pages. Each topic is a dedicated, chapterized
   article: origin, fundamentals, internals, variants, when/when-not,
   tradeoffs, pitfalls, interview Q&A, and code. Rendered on its own page
   (topic.html?id=...) with a chapter table-of-contents.
   ===================================================================== */
window.DEEPDIVES = [
  /* ===================================================== CACHING ==== */
  {
    id: "dd-cache", cat: "Data & Storage", icon: "⚡", level: "Beginner → Advanced",
    title: "Caching", tagline: "Trade a little freshness for huge speed by keeping hot data close.",
    chapters: [
      { h: "What & why (start here)", p: [
        "A cache is a small, fast store in front of a slower, bigger store. You keep copies of frequently used data so most reads finish in microseconds instead of milliseconds — and your expensive backend is shielded from repeated work.",
        "Caching exists because of a hardware fact: RAM is ~100x faster than disk and a local hop is ~100x faster than a network round trip. If data is read far more than it changes, caching is the biggest, cheapest latency win you can make."],
        bullets: ["RAM ≈ 100ns, SSD ≈ 100µs, network DB ≈ 1–10ms.", "Goal: high hit rate → low latency + less origin load."] },
      { h: "Origin", p: ["CPU caches (1960s) put tiny fast SRAM between processor and RAM. The web reused it: browser caches, Squid (1990s), Memcached (2003), Redis (2009). Same principle at every layer."] },
      { h: "Where caches live", p: ["Caching is a chain; a request can be answered at any layer:"], bullets: ["Browser (HTTP headers)", "CDN/edge", "Reverse-proxy (Varnish/Nginx)", "App in-process (fastest, not shared)", "Distributed (Redis/Memcached, shared)", "DB buffer pool"] },
      { h: "Read patterns", p: ["Cache-aside (lazy): app loads on miss and fills — common, resilient. Read-through: cache loads on miss. Refresh-ahead: refresh hot keys before expiry."], code: `Object get(String k){ Object v=cache.get(k); if(v==null){v=db.load(k);cache.set(k,v,TTL);} return v; }` },
      { h: "Write patterns", bullets: ["Write-through: cache+DB together (fresh, slower).", "Write-back: cache now, DB later (fast, risky).", "Write-around: DB only, cache on read."] },
      { h: "Eviction (the core)", p: ["Finite memory → a policy drops items. LRU = hashmap + doubly linked list (O(1)). LFU by frequency; FIFO; TTL by time."], code: `LinkedHashMap<>(16,.75f,true){ boolean removeEldestEntry(e){ return size()>cap; } }` },
      { h: "Invalidation (the hardest)", p: ["Stale data is the price of speed. Use short TTLs, delete-on-write, and versioned keys (app.v8.js). Decide tolerable staleness per data type."] },
      { h: "Failure modes", bullets: ["Thundering herd on hot-key expiry → single-flight lock / staggered TTL.", "Stampede on cold start → warm cache.", "Penetration (missing keys) → cache negatives / Bloom filter.", "Hot key → replicate / local cache."] },
      { h: "When NOT to cache", bullets: ["Write-heavy, strong-consistency, read-once, tiny datasets."] },
      { h: "Interview Q&A", bullets: ["Redis vs Memcached: types/persistence vs simple cache.", "Consistency: cache-aside + delete + short TTL.", "Scale eviction: LRU per node + consistent hashing."] },
    ],
  },
  { id: "dd-lb", cat: "Networking & Delivery", icon: "⚖️", level: "Beginner → Advanced", title: "Load Balancing", tagline: "One front door spreading traffic across many servers.", chapters: [
    { h: "Why", p: ["One server is limited; run many identical ones. An LB is the single address clients hit, distributing requests and routing around dead nodes — the base of scaling + HA."] },
    { h: "L4 vs L7", bullets: ["L4 TCP: fast, no payload.", "L7 HTTP: route by path/header, TLS, retries — smarter, slower."] },
    { h: "Algorithms", bullets: ["Round-robin, weighted, least-connections, IP/consistent hash, power-of-two-choices."], code: `int next(){int t=0,b=0;for(int i=0;i<w.length;i++){cur[i]+=w[i];t+=w[i];if(cur[i]>cur[b])b=i;}cur[b]-=t;return b;}` },
    { h: "Health checks", p: ["Probe /health; eject failures, rejoin recovered. Liveness vs readiness."] },
    { h: "Global + regional", p: ["Global picks region (geo/latency/Anycast); regional picks node."] },
    { h: "Tradeoffs", bullets: ["Sticky sessions hurt balance; LB is SPOF (redundant); flapping checks."] },
    { h: "Interview Q&A", bullets: ["ALB(L7) vs NLB(L4); scale LB via Anycast; avoid dead nodes via checks."] },
  ]},
  { id: "dd-chash", cat: "Distributed Systems", icon: "🧭", level: "Intermediate", title: "Consistent Hashing", tagline: "Add/remove nodes moving only ~1/N of data.", chapters: [
    { h: "Problem", p: ["hash%N remaps everything when N changes. Consistent hashing moves only a slice."] },
    { h: "How", p: ["Ring 0..2^32; key→first node clockwise; vnodes smooth skew + weight."], code: `String get(String k){var e=ring.ceilingEntry(hash(k));return(e==null?ring.firstEntry():e).getValue();}` },
    { h: "Used in", bullets: ["Caches, DynamoDB/Cassandra, CDN, sharded queues."] },
    { h: "Tradeoffs", bullets: ["Skew w/o vnodes; ranges scatter; O(log V) lookup."] },
  ]},
  { id: "dd-shard", cat: "Data & Storage", icon: "🧩", level: "Intermediate → Advanced", title: "Sharding", tagline: "Split data across machines to scale writes/storage.", chapters: [
    { h: "Why", p: ["Replicas scale reads, not writes/size. Shards split data; capacity grows with nodes."] },
    { h: "Strategies", bullets: ["Hash (even, no ranges), range (ranges, hotspots), geo, directory."], code: `int shard(String k,int n){return Math.floorMod(k.hashCode(),n);}` },
    { h: "Hard parts", bullets: ["No cross-shard joins/txns, hot shards, resharding (consistent hashing)."] },
    { h: "Key choice", p: ["High cardinality, even access, matches dominant query."] },
  ]},
  { id: "dd-repl", cat: "Data & Storage", icon: "📑", level: "Intermediate", title: "Replication", tagline: "Copies for availability, read-scale, durability.", chapters: [
    { h: "Why", p: ["One copy = SPOF + bottleneck. Replicas scale reads + survive death."] },
    { h: "Topologies", bullets: ["Leader-follower, multi-leader, leaderless quorum (R+W>N)."] },
    { h: "Sync vs async", bullets: ["Sync safe/slow; async fast/lossy."] },
    { h: "Lag", p: ["Stale reads; route read-your-writes to leader."], code: `Conn pick(boolean wrote){return wrote?leader():replica();}` },
    { h: "Failover", bullets: ["Promote follower; quorum prevents split-brain; test it."] },
  ]},
  { id: "dd-consistency", cat: "Distributed Systems", icon: "⚖️", level: "Advanced", title: "CAP, PACELC & Consistency", tagline: "The theory, said precisely.", chapters: [
    { h: "CAP", p: ["Under partition choose C or A; else both. CP: Zookeeper. AP: Cassandra."] },
    { h: "PACELC", p: ["Partition→A/C; Else→Latency/Consistency. Most trade latency for C even normally."] },
    { h: "Models", bullets: ["Strong, linearizable, causal, eventual, read-your-writes, monotonic."] },
    { h: "ACID vs BASE", bullets: ["ACID correctness; BASE availability/scale."] },
  ]},
  { id: "dd-mq", cat: "Distributed Systems", icon: "📨", level: "Beginner → Advanced", title: "Message Queues & Kafka", tagline: "Decouple, buffer, stream.", chapters: [
    { h: "Why", p: ["Async buffer; producers fire-and-forget; consumers at own pace; survive spikes."] },
    { h: "Queue vs log", bullets: ["SQS/RabbitMQ: ack+delete. Kafka: replayable partitioned log."] },
    { h: "Kafka", bullets: ["Partitions=order+parallel; replication; groups; offsets; retention."], code: `for(var r:poll())if(seen.add(r.key()))process(r); commitSync();` },
    { h: "Semantics", bullets: ["At-least-once + dedupe; order per partition."] },
    { h: "DLQ", bullets: ["Fail N → DLQ+alarm; backpressure on lag."] },
  ]},
  { id: "dd-rl", cat: "Reliability", icon: "🚦", level: "Intermediate", title: "Rate Limiting", tagline: "Protect + fair use.", chapters: [
    { h: "Why", p: ["Cap per key; protect backends; stop abuse."] },
    { h: "Algorithms", bullets: ["Fixed/sliding window, token/leaky bucket."], code: `t=min(c,t+dt*r); if(t>=1){t--;allow}else 429;` },
    { h: "Distributed", p: ["Redis + atomic Lua; local+sync for scale."] },
    { h: "Policy", bullets: ["Fail-open vs fail-closed when store down."] },
  ]},
  { id: "dd-bloom", cat: "Patterns", icon: "🌸", level: "Intermediate", title: "Bloom Filter", tagline: "Maybe present / definitely absent.", chapters: [
    { h: "Why", p: ["Skip costly existence checks; tiny bits; no false negatives."] },
    { h: "How", p: ["Bit array + k hashes; all set → maybe; any 0 → no."], code: `add:set k bits; query:all bits set?` },
    { h: "Uses", bullets: ["SSTables, cache-penetration; sized up front."] },
  ]},
  { id: "dd-lock", cat: "Distributed Systems", icon: "🔒", level: "Intermediate", title: "Distributed Locks", tagline: "One process at a time.", chapters: [
    { h: "Why", p: ["Mutual exclusion across processes; avoid double work."] },
    { h: "How", p: ["SET NX PX ttl; release by token; ZK/etcd leases."], code: `set lock NX PX 30000; if get==tok del;` },
    { h: "Pitfalls", bullets: ["Lease expiry → fence tokens; SPOF; prefer idempotency."] },
  ]},
  { id: "dd-consensus", cat: "Distributed Systems", icon: "🤝", level: "Advanced", title: "Consensus (Raft)", tagline: "Agree on one truth despite failures.", chapters: [
    { h: "Why", p: ["Consistent replicated log applied everywhere."] },
    { h: "Raft", bullets: ["Leader+term; replicate; commit on majority; odd sizes."], code: `acks=1;for f:acks+=f.append(e); committed=acks>n/2;` },
    { h: "Uses", bullets: ["etcd, Consul, K8s control plane."] },
  ]},
  { id: "dd-cdn", cat: "Networking & Delivery", icon: "🌍", level: "Beginner", title: "CDN", tagline: "Content at the edge.", chapters: [
    { h: "Why", p: ["Nearby cache → low latency, origin shielded."] },
    { h: "How", p: ["Anycast→POP; hit/miss+TTL; versioned URLs; edge compute."] },
    { h: "Tradeoffs", bullets: ["Personalized hard; invalidation lag."] },
  ]},
  { id: "dd-gw", cat: "Networking & Delivery", icon: "🚪", level: "Intermediate", title: "API Gateway", tagline: "Smart front door.", chapters: [
    { h: "Why", p: ["Centralize auth/throttle/route/log for microservices."] },
    { h: "How", p: ["TLS, JWT, limit, validate, route, transform, observe; BFF."] },
    { h: "Tradeoffs", bullets: ["Keep thin; extra hop."] },
  ]},
  { id: "dd-index", cat: "Data & Storage", icon: "🗂️", level: "Intermediate → Advanced", title: "Indexing (B-tree vs LSM)", tagline: "Instant or full scan.", chapters: [
    { h: "Why", p: ["Index → O(log n), ranges, ordering."] },
    { h: "B-tree", p: ["Sorted, in-place; default RDBMS."] },
    { h: "LSM", p: ["memtable→SSTables→compaction; write-fast; Bloom for reads."] },
    { h: "Rules", bullets: ["Index real queries; composite multi-col; writes pay."], code: `CREATE INDEX i ON orders(user_id,created_at DESC);` },
  ]},
  { id: "dd-idem", cat: "Reliability", icon: "♻️", level: "Intermediate", title: "Idempotency", tagline: "Safe retries.", chapters: [
    { h: "Why", p: ["Retries can double-charge; key dedupes."] },
    { h: "How", p: ["key→result; duplicate returns stored."], code: `r=store.get(key);if(r)return r;r=charge();store.put(key,r);` },
  ]},
  { id: "dd-saga", cat: "Patterns", icon: "🧵", level: "Advanced", title: "Saga", tagline: "Distributed transactions.", chapters: [
    { h: "Why", p: ["No ACID across services; local commits + compensations."] },
    { h: "Types", bullets: ["Orchestration vs choreography."] },
    { h: "Example", p: ["Pay→reserve; fail→refund. Steps idempotent."] },
  ]},
  { id: "dd-cb", cat: "Reliability", icon: "🔌", level: "Intermediate", title: "Resilience Patterns", tagline: "Stop cascading failure.", chapters: [
    { h: "Timeout/retry", bullets: ["Deadlines; idempotent retries; backoff+jitter."] },
    { h: "Circuit breaker", p: ["Closed→Open→Half-open; fail fast on dead deps."] },
    { h: "Bulkhead/degrade", bullets: ["Isolate pools; cached fallbacks."] },
  ]},
  { id: "dd-sqlnosql", cat: "Data & Storage", icon: "🗄️", level: "Beginner", title: "SQL vs NoSQL", tagline: "Pick by access pattern.", chapters: [
    { h: "SQL", bullets: ["Relations, ACID, joins; payments."] },
    { h: "NoSQL", bullets: ["Scale, flexible, designed access; weak joins."] },
    { h: "Decision", bullets: ["Default SQL; NoSQL for scale + simple access."] },
  ]},
  { id: "dd-search", cat: "Data & Storage", icon: "🔎", level: "Intermediate", title: "Search & Inverted Index", tagline: "Ranked content search.", chapters: [
    { h: "Why", p: ["LIKE scans; inverted index = fast ranked."] },
    { h: "How", p: ["Tokenize→postings; intersect; BM25; async build."], code: `index.get(word).add(docId);` },
  ]},
  { id: "dd-auth", cat: "Security", icon: "🛡️", level: "Intermediate", title: "Auth: Sessions, JWT, OAuth2", tagline: "Identity + permissions.", chapters: [
    { h: "AuthN vs AuthZ", bullets: ["Identity vs RBAC/ABAC."] },
    { h: "Sessions vs JWT", bullets: ["Revocable store vs stateless signed token."] },
    { h: "OAuth2/OIDC", p: ["Delegated access; id_token; mTLS service-to-service."] },
  ]},
];

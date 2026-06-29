/* =====================================================================
   DEEP DIVES — full mastery pages. Each topic is a dedicated chapterized
   article (origin → internals → pitfalls → interview Q&A + code), rendered
   on its own page (topic.html?id=...). Beginner-friendly, interview-grade.
   ===================================================================== */
window.DEEPDIVES = [
  /* ===================================================== CACHING ==== */
  { id: "dd-cache", cat: "Data & Storage", icon: "⚡", level: "Beginner → Advanced", title: "Caching", tagline: "Trade a little freshness for huge speed by keeping hot data close.", chapters: [
    { h: "What & why (start here)", p: ["A cache is a small, fast store in front of a slower, bigger store. You keep copies of frequently used data so most reads finish in microseconds instead of milliseconds, and your expensive backend is shielded from repeated work.","Caching exists because of a hardware fact: RAM is ~100x faster than disk, and a local hop is ~100x faster than a network round trip. If data is read far more than it changes, caching is the biggest, cheapest latency win available."], bullets: ["RAM ≈ 100ns · SSD ≈ 100µs · network DB ≈ 1–10ms.", "Goal: high hit rate → low latency + less origin load."] },
    { h: "Origin", p: ["CPU caches (1960s) put tiny fast SRAM between processor and RAM. The web reused it: browser caches, Squid (1990s), Memcached (2003), Redis (2009). Same principle at every layer."] },
    { h: "Where caches live", p: ["Caching is a chain; a request can be answered at any layer:"], bullets: ["Browser (HTTP headers)","CDN/edge","Reverse-proxy (Varnish/Nginx)","App in-process (fastest, not shared)","Distributed (Redis/Memcached, shared)","DB buffer pool"] },
    { h: "Read patterns", p: ["Cache-aside (lazy): app loads on miss and fills — common, resilient. Read-through: cache loads on miss. Refresh-ahead: refresh hot keys before expiry."], code: `Object get(String k){ Object v=cache.get(k); if(v==null){v=db.load(k);cache.set(k,v,TTL);} return v; }` },
    { h: "Write patterns", bullets: ["Write-through: cache+DB together (fresh, slower).","Write-back: cache now, DB later (fast, risky).","Write-around: DB only, cache on read."] },
    { h: "Eviction (the core)", p: ["Finite memory → a policy drops items. LRU = hashmap + doubly linked list (O(1)). LFU by frequency; FIFO; TTL by time."], code: `LinkedHashMap<>(16,.75f,true){ boolean removeEldestEntry(e){ return size()>cap; } }` },
    { h: "Invalidation (hardest)", p: ["Stale data is the price of speed. Short TTLs, delete-on-write, versioned keys (app.v8.js). Decide tolerable staleness per data type."] },
    { h: "Failure modes", bullets: ["Thundering herd → single-flight lock / staggered TTL.","Penetration (missing keys) → cache negatives / Bloom filter.","Hot key → replicate / local cache."] },
    { h: "When NOT to cache", bullets: ["Write-heavy, strong-consistency, read-once, tiny datasets."] },
    { h: "Interview Q&A", bullets: ["Redis vs Memcached: types/persistence vs simple cache.","Consistency: cache-aside + delete + short TTL.","Scale: LRU per node + consistent hashing."] },
  ]},
  /* ============================================== LOAD BALANCING ==== */
  { id: "dd-lb", cat: "Networking & Delivery", icon: "⚖️", level: "Beginner → Advanced", title: "Load Balancing", tagline: "One front door spreading traffic across many interchangeable servers.", chapters: [
    { h: "What & why", p: ["One server has finite CPU, memory, and sockets. To serve more users and survive failure you run many identical servers — but clients need one address and traffic must dodge dead nodes. A load balancer is that single entry that distributes work and health-checks backends.","It's the foundation of both horizontal scaling and high availability."] },
    { h: "Origin", p: ["Hardware LBs (F5, Cisco) emerged late-1990s as sites outgrew one box; software LBs (HAProxy 2001, Nginx 2004) and cloud LBs (ELB) made it commodity."] },
    { h: "Layer 4 vs Layer 7", bullets: ["L4 (TCP/UDP): routes packets fast, no payload inspection — high throughput.","L7 (HTTP): reads URL/headers/cookies; route by path, TLS terminate, retry, rewrite — smarter, slightly slower."] },
    { h: "Algorithms", bullets: ["Round-robin: simple rotation.","Weighted: bigger servers get more.","Least-connections: best for varied durations.","Hash (IP/key): stickiness/affinity.","P2C (two random): cheap, near-optimal."], code: `int next(){int t=0,b=0;for(int i=0;i<w.length;i++){cur[i]+=w[i];t+=w[i];if(cur[i]>cur[b])b=i;}cur[b]-=t;return b;}` },
    { h: "Health checks", p: ["Probe /health; eject failing nodes, rejoin recovered. Separate liveness (restart me) from readiness (don't route yet). This is what makes the fleet self-healing."] },
    { h: "Global + regional", p: ["Global LB selects nearest healthy region (geo/latency/Anycast); regional LB selects a node. Together: multi-region HA + low latency."] },
    { h: "Stickiness", bullets: ["Pin user to a node (cookie/IP) for in-memory state — hurts balance/failover. Prefer stateless app + external session store."] },
    { h: "Pitfalls", bullets: ["LB is a SPOF → redundant LBs (Anycast/DNS).","Flapping checks; thundering reconnect on failover; uneven least-conn with long requests."] },
    { h: "Interview Q&A", bullets: ["ALB(L7) vs NLB(L4).","Scale the LB: Anycast across many.","Avoid dead nodes: health checks + ejection."] },
  ]},
  /* =========================================== CONSISTENT HASHING === */
  { id: "dd-chash", cat: "Distributed Systems", icon: "🧭", level: "Intermediate", title: "Consistent Hashing", tagline: "Add/remove nodes moving only ~1/N of data.", chapters: [
    { h: "Problem", p: ["hash(key)%N is even, but changing N remaps almost every key — caches cold, shards reshuffle. Consistent hashing moves only ~1/N keys on membership change."] },
    { h: "Origin", p: ["Karger et al., MIT 1997, for web caching; Amazon Dynamo (2007) made it mainstream."] },
    { h: "How it works", p: ["Hash nodes and keys to a ring (0..2^32). Key → first node clockwise. Remove → keys go to next node only; add → steal a slice. Virtual nodes (many points/server) smooth skew + weighting."], code: `String get(String k){var e=ring.ceilingEntry(hash(k));return(e==null?ring.firstEntry():e).getValue();}` },
    { h: "Used in", bullets: ["Distributed caches, DynamoDB/Cassandra, CDN routing, sharded queues."] },
    { h: "Tradeoffs", bullets: ["Skew without enough vnodes; O(log V) lookup; range queries scatter; replicate to next K nodes."] },
    { h: "Interview Q&A", bullets: ["Why vnodes? even spread + weight + smooth rebalance.","Replication? next K clockwise."] },
  ]},
  /* ================================================== SHARDING ===== */
  { id: "dd-shard", cat: "Data & Storage", icon: "🧩", level: "Intermediate → Advanced", title: "Sharding", tagline: "Split data across machines to scale writes and storage.", chapters: [
    { h: "What & why", p: ["Replicas scale reads, not writes or dataset size. When one primary can't hold the data or absorb writes, split it: each shard owns a subset, so total capacity grows with nodes.","Sharding is the answer to 'one DB isn't enough' — and the source of most distributed-data pain."] },
    { h: "Strategies", bullets: ["Hash: even spread, no range scans, resharding risk.","Range: range queries easy, hotspots risk (dates).","Geo: locality + compliance.","Directory: lookup table, flexible, extra hop."], code: `int shard(String key,int n){ return Math.floorMod(key.hashCode(), n); }` },
    { h: "Routing", p: ["A router/coordinator maps key→shard and sends each query to the right node; some clients hold the map. Adding shards uses consistent hashing to limit movement."] },
    { h: "Hard parts", bullets: ["No cross-shard joins → denormalize / scatter-gather.","No cross-shard ACID → sagas.","Hot shards from bad keys; celebrity/monotonic keys.","Rebalancing is painful."] },
    { h: "Choosing a key", p: ["High cardinality, evenly accessed, matches dominant query. user_id is common; avoid low-cardinality or sequential keys; salt hot keys."] },
    { h: "Pitfalls", bullets: ["Counter/auto-increment hotspot; cross-shard pagination; fan-out reads."] },
    { h: "Interview Q&A", bullets: ["Shard vs partition (same; shard=across machines).","Rebalance via consistent hashing + vnodes.","Cross-shard txn via saga/2PC."] },
  ]},
  /* ================================================ REPLICATION ==== */
  { id: "dd-repl", cat: "Data & Storage", icon: "📑", level: "Intermediate", title: "Replication", tagline: "Copies for availability, read-scale, and durability.", chapters: [
    { h: "What & why", p: ["One copy is a single point of failure and a read bottleneck. Replication keeps multiple copies so reads scale, a dead node loses nothing, and failover continues service.","It's how databases get HA and read throughput before you reach for sharding."] },
    { h: "Topologies", bullets: ["Leader-follower: writes→leader, stream to followers (standard).","Multi-leader: write anywhere, conflict resolution needed.","Leaderless quorum: R+W>N overlap (Dynamo/Cassandra)."] },
    { h: "Sync vs async", bullets: ["Sync: wait for replica ack — safe, slower, lower availability.","Async: fast, can lose recent writes on failover.","Semi-sync: ack from one replica balances both."] },
    { h: "Replica lag", p: ["Async replicas trail, causing stale reads. Fix with read-your-writes (read leader after write), monotonic reads (same replica), or wait-for-LSN."], code: `Conn pick(boolean wrote){ return wrote ? leader() : replica(); }` },
    { h: "Failover & split-brain", bullets: ["Promote a follower on leader death; quorum/fencing prevents two leaders.","Lost async writes on promotion; rehearse failover."] },
    { h: "Quorum math", p: ["N replicas, W write acks, R read acks. R+W>N guarantees a read overlaps a write → see latest. Tune for consistency vs latency."] },
    { h: "Interview Q&A", bullets: ["Lag fix: sticky-to-leader.","Quorum: R+W>N.","Sync vs async tradeoff: safety vs latency."] },
  ]},
  /* ============================================== CONSISTENCY ====== */
  { id: "dd-consistency", cat: "Distributed Systems", icon: "⚖️", level: "Advanced", title: "CAP, PACELC & Consistency", tagline: "The theory interviewers love — said precisely.", chapters: [
    { h: "CAP", p: ["Under a network Partition, choose Consistency (reject some requests) or Availability (serve possibly-stale). No partition → both. CP: HBase/Zookeeper. AP: Cassandra/Dynamo.","CAP only forces a choice during partitions — it's not 'pick 2 of 3' always."] },
    { h: "PACELC", p: ["Adds normal operation: if Partition → A or C; Else → Latency or Consistency. Most stores trade latency for consistency even without partitions."] },
    { h: "Consistency spectrum", bullets: ["Strong: read sees latest write.","Linearizable: single global order, looks instantaneous.","Causal: cause before effect.","Eventual: converges, stale reads.","Read-your-writes / monotonic reads."] },
    { h: "ACID vs BASE", bullets: ["ACID: Atomic, Consistent, Isolated, Durable.","BASE: Basically Available, Soft state, Eventual."] },
    { h: "Isolation levels", bullets: ["Read committed, repeatable read, serializable; anomalies: dirty/non-repeatable/phantom."] },
    { h: "Interview Q&A", bullets: ["Chat → AP, order by sequence.","Banking → strong/ACID.","Quorum tunes the slider."] },
  ]},
  /* ============================================= MESSAGE QUEUE ===== */
  { id: "dd-mq", cat: "Distributed Systems", icon: "📨", level: "Beginner → Advanced", title: "Message Queues & Kafka", tagline: "Decouple producers/consumers, absorb spikes, stream events.", chapters: [
    { h: "What & why", p: ["Synchronous calls couple services — a slow or down consumer breaks the producer. A queue buffers work so producers fire-and-forget and consumers process at their own pace, smoothing spikes and surviving failures."] },
    { h: "Queue vs log", bullets: ["RabbitMQ/SQS: push, delete on ack — one consumer per message.","Kafka: append-only partitioned log; consumers pull by offset; retained for replay — many consumers."] },
    { h: "Kafka internals", bullets: ["Topic → partitions (ordering + parallelism).","Each partition replicated; one leader.","Consumer groups split partitions.","Offsets = position; retention = replay window."], code: `for (var r : consumer.poll(d)) if (seen.add(r.key())) process(r.value()); consumer.commitSync();` },
    { h: "Delivery semantics", bullets: ["At-most-once, at-least-once (common → dedupe), exactly-once (txns, costly).","Order only within a partition (key→partition)."] },
    { h: "Reliability", bullets: ["DLQ after N fails + alarm.","Backpressure on consumer lag.","Idempotent consumers mandatory."] },
    { h: "Pitfalls", bullets: ["Rebalancing pauses; large messages; offset commit before/after work; ordering across keys."] },
    { h: "Interview Q&A", bullets: ["Kafka vs SQS: replayable stream vs managed queue.","Order: same key→partition.","Exactly-once: idempotency + txns."] },
  ]},
  /* ============================================= RATE LIMITING ===== */
  { id: "dd-rl", cat: "Reliability", icon: "🚦", level: "Intermediate", title: "Rate Limiting", tagline: "Protect systems and enforce fair use.", chapters: [
    { h: "Why", p: ["One client/attacker can exhaust shared capacity. Cap requests per key (user/IP/API key) to protect backends, ensure fairness, and stop brute-force/abuse."] },
    { h: "Algorithms", bullets: ["Fixed window: simple, edge bursts.","Sliding window: smoother.","Token bucket: bursts up to cap, steady refill.","Leaky bucket: constant output."], code: `t=min(c,t+dt*r); if(t>=1){t--;allow;}else 429;` },
    { h: "Distributed", p: ["Counters in Redis with an atomic Lua script so nodes can't oversell the last token. Local buckets + periodic sync at extreme scale (slightly approximate)."] },
    { h: "Failure policy", bullets: ["Store down → fail-open (availability) vs fail-closed (protection)."] },
    { h: "Interview Q&A", bullets: ["1M rps → local + sync.","Bursts → token bucket.","Per-tenant quotas at gateway."] },
  ]},
  /* ============================================= INDEXING ========= */
  { id: "dd-index", cat: "Data & Storage", icon: "🗂️", level: "Intermediate → Advanced", title: "Indexing (B-tree vs LSM)", tagline: "Why a query is instant or scans a million rows.", chapters: [
    { h: "Why", p: ["No index = full scan O(n). An index is a sorted structure → O(log n) lookups, range scans, ordering. Choosing indexes is the difference between 1ms and 10s."] },
    { h: "B-tree", p: ["Balanced, sorted, in-place updates; great reads + ranges; default in Postgres/MySQL. Leaf nodes link for scans; height ~3–4 for millions of rows."] },
    { h: "LSM-tree", p: ["Writes → in-memory memtable → flush to immutable sorted SSTables, compacted in background. Fast writes; reads check multiple files (Bloom filters skip). Cassandra/RocksDB."] },
    { h: "Rules", bullets: ["Index WHERE/JOIN/ORDER columns; composite for multi-col; leftmost-prefix rule; each index slows writes + storage."], code: `CREATE INDEX i ON orders(user_id, created_at DESC);` },
    { h: "Pitfalls", bullets: ["Over-indexing; low-cardinality indexes; LSM read/space amplification; covering vs lookup."] },
    { h: "Interview Q&A", bullets: ["B-tree vs LSM: read/range vs write-heavy.","Composite order matters.","Write amplification in LSM."] },
  ]},
  { id: "dd-bloom", cat: "Patterns", icon: "🌸", level: "Intermediate", title: "Bloom Filter", tagline: "Maybe present, definitely absent — in tiny space.", chapters: [
    { h: "Why", p: ["Existence checks on huge sets are costly. Bloom answers in bits: definitely-not (skip lookup) or maybe (verify); tiny false-positive rate, never false negatives."] },
    { h: "How", p: ["Bit array + k hashes. Insert sets k bits; query needs all set. No deletes (basic); counting BF allows deletes."], code: `add: set k bits; query: all bits set? maybe : no;` },
    { h: "Uses", bullets: ["Cassandra SSTables, CDN, cache-penetration guard, dedupe."] },
    { h: "Interview Q&A", bullets: ["FP only; tune m,k for n; counting BF deletes."] },
  ]},
  { id: "dd-lock", cat: "Distributed Systems", icon: "🔒", level: "Intermediate", title: "Distributed Locks", tagline: "One process at a time across machines.", chapters: [
    { h: "Why", p: ["Two workers doing the same critical action corrupt state. A lock gives mutual exclusion across processes sharing no memory."] },
    { h: "How", p: ["Redis SET key token NX PX ttl; TTL prevents deadlock; release only if you own the token. ZK/etcd use ephemeral nodes/leases tied to sessions."], code: `set lock NX PX 30000; ... if get==tok del;` },
    { h: "Pitfalls", bullets: ["Lease expiry → two holders; fencing tokens.","Store SPOF; clock skew; prefer idempotency."] },
  ]},
  { id: "dd-consensus", cat: "Distributed Systems", icon: "🤝", level: "Advanced", title: "Consensus (Raft)", tagline: "Many nodes agree on one truth despite failures.", chapters: [
    { h: "Why", p: ["Replicas must agree on order/leader even when nodes crash. Consensus gives a consistent replicated log applied identically everywhere."] },
    { h: "Raft", bullets: ["Leader elected per term; replicates log; commits on majority.","Followers redirect writes; re-elect on heartbeat loss.","Majority quorum → odd sizes (3,5)."], code: `acks=1; for f: acks+=f.append(e); committed = acks>n/2;` },
    { h: "Uses", bullets: ["etcd, Consul, Kubernetes control plane, leader election."] },
  ]},
  { id: "dd-cdn", cat: "Networking & Delivery", icon: "🌍", level: "Beginner", title: "CDN", tagline: "Serve content from the edge, near the user.", chapters: [
    { h: "Why", p: ["Distant users have high latency; origin gets crushed. A CDN caches at edge POPs; users hit a nearby server, origin sees a fraction."] },
    { h: "How", p: ["DNS/Anycast → nearest POP; hit serves cache, miss fetches origin + caches per TTL; versioned URLs/purge for freshness; edge compute + TLS."] },
    { h: "Tradeoffs", bullets: ["Personalized/dynamic hard; invalidation lag; cost."] },
  ]},
  { id: "dd-gw", cat: "Networking & Delivery", icon: "🚪", level: "Intermediate", title: "API Gateway", tagline: "One smart front door for many services.", chapters: [
    { h: "Why", p: ["Microservices = many endpoints; a gateway centralizes auth, throttling, routing, logging so each service doesn't reimplement them."] },
    { h: "How", p: ["TLS, JWT/key auth, rate-limit, validate, route by path/host, transform, metrics/traces; can aggregate (BFF)."] },
    { h: "Tradeoffs", bullets: ["Keep thin; bottleneck risk; extra hop."] },
  ]},
  { id: "dd-idem", cat: "Reliability", icon: "♻️", level: "Intermediate", title: "Idempotency", tagline: "Safe retries that never double-charge.", chapters: [
    { h: "Why", p: ["Networks retry; without protection a retried charge runs twice. Idempotency makes repeating equal doing once."] },
    { h: "How", p: ["Client sends unique key; server stores key→result; duplicate returns stored. Messaging dedupes by event id."], code: `r=store.get(key); if(r)return r; r=charge(); store.putIfAbsent(key,r,24h);` },
  ]},
  { id: "dd-saga", cat: "Patterns", icon: "🧵", level: "Advanced", title: "Saga", tagline: "Multi-service transactions with compensations.", chapters: [
    { h: "Why", p: ["Can't hold one ACID txn across services. Saga = local commits + compensating actions to undo on failure."] },
    { h: "Types", bullets: ["Orchestration (coordinator) vs choreography (events)."] },
    { h: "Example", p: ["Order→pay→reserve; if reserve fails → refund + cancel. Each step idempotent; design every compensation."] },
  ]},
  { id: "dd-cb", cat: "Reliability", icon: "🔌", level: "Intermediate", title: "Resilience Patterns", tagline: "Stop failures from cascading.", chapters: [
    { h: "Timeout/retry", bullets: ["Every call needs a deadline; idempotent retries; backoff + jitter."] },
    { h: "Circuit breaker", p: ["Closed→Open after failures (fail fast)→Half-open probe→Closed. Protects dead deps."] },
    { h: "Bulkhead/degrade", bullets: ["Isolate pools; cached fallbacks keep core alive."] },
  ]},
  { id: "dd-sqlnosql", cat: "Data & Storage", icon: "🗄️", level: "Beginner", title: "SQL vs NoSQL", tagline: "Pick storage by access pattern, not hype.", chapters: [
    { h: "SQL", bullets: ["Relations, ACID, joins, ad-hoc; payments/orders; scale via replicas+sharding."] },
    { h: "NoSQL", bullets: ["KV/document/wide-column/graph; horizontal scale, flexible, designed access; weak joins."] },
    { h: "Decision", bullets: ["Default SQL; NoSQL for scale + simple access; mix both."] },
  ]},
  { id: "dd-search", cat: "Data & Storage", icon: "🔎", level: "Intermediate", title: "Search & Inverted Index", tagline: "Find documents by content, ranked.", chapters: [
    { h: "Why", p: ["LIKE scans + can't rank. Inverted index maps term→docs for fast, ranked, typo-tolerant search."] },
    { h: "How", p: ["Tokenize→normalize→postings; query intersects; BM25 ranks; built async from DB (eventual)."], code: `index.computeIfAbsent(word,k->new HashSet<>()).add(docId);` },
  ]},
  { id: "dd-auth", cat: "Security", icon: "🛡️", level: "Intermediate", title: "Auth: Sessions, JWT, OAuth2", tagline: "Who you are, what you may do.", chapters: [
    { h: "AuthN vs AuthZ", bullets: ["Identity vs permissions (RBAC/ABAC)."] },
    { h: "Sessions vs JWT", bullets: ["Server session: revocable, central. JWT: stateless signed; revoke via short TTL+denylist."] },
    { h: "OAuth2/OIDC", p: ["OAuth2 delegates access via tokens; OIDC adds identity; mTLS for service-to-service."] },
  ]},
  /* ============================ NEW BEGINNER-CRITICAL TOPICS ====== */
  { id: "dd-numbers", cat: "Fundamentals", icon: "🔢", level: "Beginner", title: "Latency Numbers & Estimation", tagline: "The numbers every engineer should know cold.", chapters: [
    { h: "Why", p: ["Designs live or die on rough math. Knowing relative speeds lets you put caches/CDNs in the right place and size systems on a whiteboard."] },
    { h: "Key numbers", bullets: ["L1 ≈ 1ns; RAM ≈ 100ns; SSD read ≈ 100µs; disk seek ≈ 10ms.","Same-DC RTT ≈ 0.5ms; cross-region ≈ 50–150ms.","1 Gbps ≈ 125MB/s."] },
    { h: "Estimation", bullets: ["QPS = DAU × actions/day ÷ 86400; peak ×2–5.","Storage = writes/day × size × retention.","Memory = working-set ≈ 20% of data."] },
  ]},
  { id: "dd-dns", cat: "Networking & Delivery", icon: "🌐", level: "Beginner", title: "DNS", tagline: "Turning names into addresses, and routing users.", chapters: [
    { h: "Why", p: ["Humans use names, networks use IPs. DNS maps them and is the first routing layer (geo/failover)."] },
    { h: "How", p: ["Client→recursive resolver→root→TLD→authoritative; answer cached by TTL. Records: A/AAAA, CNAME, MX, TXT."] },
    { h: "Tradeoffs", bullets: ["Caching/TTL slows changes; low TTL = fast failover, more queries."] },
  ]},
  { id: "dd-http", cat: "Fundamentals", icon: "🔌", level: "Beginner", title: "HTTP, REST & gRPC", tagline: "How clients and services actually talk.", chapters: [
    { h: "HTTP", bullets: ["Methods GET/POST/PUT/DELETE; status 2xx/3xx/4xx/5xx; idempotent GET/PUT.","Keep-alive, HTTP/2 multiplexing, HTTP/3 over QUIC."] },
    { h: "REST", bullets: ["Resources + verbs, stateless, cacheable; simple/ubiquitous; over/under-fetch."] },
    { h: "gRPC/GraphQL", bullets: ["gRPC: binary, fast, internal RPC. GraphQL: client picks fields, one endpoint."] },
  ]},
  { id: "dd-micro", cat: "Scaling", icon: "🧱", level: "Intermediate", title: "Monolith vs Microservices", tagline: "Splitting by team and bounded context.", chapters: [
    { h: "Monolith", bullets: ["One deploy, local calls, simple — start here.","Hard to scale teams/components later."] },
    { h: "Microservices", bullets: ["Independent deploy, DB-per-service, scale teams.","Distributed complexity: network, consistency, observability."] },
    { h: "Decision", bullets: ["Monolith-first; split a service only when a boundary truly hurts."] },
  ]},
  { id: "dd-scale", cat: "Scaling", icon: "📈", level: "Beginner", title: "Scaling & Statelessness", tagline: "Up vs out, and why stateless wins.", chapters: [
    { h: "Vertical vs horizontal", bullets: ["Up: bigger box, simple, capped. Out: more boxes, scalable, needs distribution."] },
    { h: "Stateless", p: ["Move state to cache/DB/session store so any instance serves any request → easy autoscale + failover."] },
    { h: "Autoscale/backpressure", bullets: ["Scale on CPU/QPS/queue; pre-warm spikes; 429/blocking when overwhelmed."] },
  ]},
  { id: "dd-obs", cat: "Reliability", icon: "📊", level: "Intermediate", title: "Observability", tagline: "Logs, metrics, traces — and SLOs.", chapters: [
    { h: "3 pillars", bullets: ["Logs: events. Metrics: numbers over time. Traces: one request across services."] },
    { h: "SLI/SLO/SLA", bullets: ["SLI measured; SLO target; SLA contract; error budget drives releases."] },
    { h: "Tools", bullets: ["Prometheus/Grafana, ELK, OpenTelemetry/Jaeger, PagerDuty."] },
  ]},
  { id: "dd-ws", cat: "Networking & Delivery", icon: "🔁", level: "Intermediate", title: "WebSockets & Realtime", tagline: "Pushing updates without polling.", chapters: [
    { h: "Why", p: ["Polling wastes requests; WebSockets keep a persistent bidirectional connection for chat/live dashboards."] },
    { h: "How", p: ["HTTP upgrade→WS; stateful gateways hold sockets; pub/sub backend fans out; session registry maps user→gateway."] },
    { h: "Tradeoffs", bullets: ["Connection mgmt + fan-out at scale; sticky/stateful; fallbacks (SSE, long-poll)."] },
  ]},
  { id: "dd-obj", cat: "Data & Storage", icon: "🪣", level: "Beginner", title: "Object Storage", tagline: "Cheap durable blobs at any scale.", chapters: [
    { h: "Why", p: ["Images/video/backups don't belong in a DB. Object stores keep immutable blobs + metadata, cheap and durable, served via CDN."] },
    { h: "How", p: ["PUT/GET by key in buckets; store URL+metadata in DB; lifecycle tiers (hot→cold)."] },
    { h: "Tradeoffs", bullets: ["No row updates; eventual list; egress cost."] },
  ]},
];

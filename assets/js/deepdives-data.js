/* =====================================================================
   DEEP DIVES — every major system-design topic explained from origin to
   internals: where it came from, the problem it solves, how it works
   behind the scenes, when to use it, tradeoffs, and sample code.
   Rendered by deepdives.js with Prism (Java) highlighting.
   ===================================================================== */
window.DEEPDIVES = [
  /* ---------------------------------------------------------- Caching */
  {
    id: "dd-cache", num: "01", icon: "⚡", title: "Caching", tagline: "Trading freshness for speed by keeping hot data close.",
    sections: [
      { h: "Origin", body: "Caching is as old as computing: 1960s CPUs added small fast SRAM between the processor and slow main memory because the processor kept stalling. The same principle — keep frequently used data on faster, smaller storage — scaled up to web caches (1990s, Squid), memcached (2003, LiveJournal), and Redis (2009). The constant: a fast tier in front of a slow tier." },
      { h: "Problem it solves", body: "Databases and disks are slow (ms) compared to memory (µs). When the same data is read far more than written, recomputing or refetching it every time wastes latency, CPU, and DB capacity. A cache stores the result of expensive work so the next reader gets it instantly and the origin is shielded." },
      { h: "How it works behind the scenes", body: "A cache is a key→value store in fast memory with a fixed budget. On read you check the cache (hit/miss); on miss you fetch from the source and store it with a TTL. Because memory is finite, an eviction policy (LRU, LFU, FIFO) decides what to drop. LRU is usually implemented as a hash map + doubly linked list so get/put are O(1) and the least-recently-used item is at the tail." },
      { h: "When to use", body: "Read-heavy data, expensive computations, repeated identical queries, session data, rate-limit counters, hot product pages. Avoid for write-heavy data, strong-consistency needs, or data accessed once." },
      { h: "Patterns & tradeoffs", body: "Cache-aside (app loads on miss) is the default. Write-through keeps cache+DB in sync at write cost; write-back is fast but risks loss. The eternal problem is invalidation/staleness — pick TTLs and versioned keys deliberately. Thundering herd on expiry is mitigated with locks or staggered TTLs." },
      { h: "Sample: O(1) LRU cache", lang: "java", code: `class LRUCache {
    private final int cap;
    private final LinkedHashMap<Integer,Integer> map;
    LRUCache(int cap){
        this.cap = cap;
        // accessOrder=true → most-recent moves to the end
        map = new LinkedHashMap<>(16, .75f, true){
            protected boolean removeEldestEntry(Map.Entry<Integer,Integer> e){
                return size() > LRUCache.this.cap;   // evict LRU
            }
        };
    }
    int get(int k){ return map.getOrDefault(k, -1); }
    void put(int k,int v){ map.put(k, v); }
}` },
    ],
  },
  /* ---------------------------------------------------- Load balancing */
  {
    id: "dd-lb", num: "02", icon: "⚖️", title: "Load Balancing", tagline: "Spreading traffic so no single server melts.",
    sections: [
      { h: "Origin", body: "As sites outgrew one machine in the late 1990s, hardware load balancers (F5, Cisco) appeared to fan requests across a server farm. Software LBs (HAProxy 2001, NGINX 2004) and cloud LBs (ELB) made it commodity. The idea: a stable front door distributes work to many interchangeable backends." },
      { h: "Problem it solves", body: "One server has limited CPU, memory, and connections. To scale and stay available, you run many identical servers — but clients need one address and traffic must avoid dead nodes. A load balancer is that single entry point that distributes and health-checks." },
      { h: "How it works behind the scenes", body: "The LB terminates the client connection and picks a backend using an algorithm: round-robin, least-connections, weighted, or hashing (e.g. by client IP for stickiness). It runs periodic health checks and ejects failing nodes. L4 LBs route on TCP/IP fast; L7 LBs read HTTP and route by path/host, terminate TLS, and retry." },
      { h: "When to use", body: "Any horizontally scaled, stateless service; multi-AZ HA; rolling deploys; canary traffic splitting. Pair a global LB (region selection) with a regional LB (node selection)." },
      { h: "Tradeoffs", body: "Sticky sessions ease stateful apps but hurt balance and failover. The LB is a potential bottleneck/SPOF, so it must itself be redundant. L7 features cost latency vs raw L4." },
      { h: "Sample: weighted round-robin", lang: "java", code: `class WeightedRR {
    int[] w; int[] cur; int n;
    WeightedRR(int[] weights){ w=weights; cur=new int[w.length]; n=w.length; }
    int next(){
        int total=0, best=0;
        for(int i=0;i<n;i++){ cur[i]+=w[i]; total+=w[i];
            if(cur[i]>cur[best]) best=i; }
        cur[best]-=total;      // smooth weighted distribution
        return best;           // index of chosen backend
    }
}` },
    ],
  },
  /* ---------------------------------------------- Consistent hashing */
  {
    id: "dd-chash", num: "03", icon: "🧭", title: "Consistent Hashing", tagline: "Adding/removing nodes without reshuffling everything.",
    sections: [
      { h: "Origin", body: "Introduced by Karger et al. at MIT (1997) for web caching, popularized by Amazon's Dynamo paper (2007). It powers Cassandra, DynamoDB, and CDN routing." },
      { h: "Problem it solves", body: "Plain hash(key) % N spreads keys evenly, but changing N (a node joins/leaves) remaps almost every key — catastrophic for caches/shards. Consistent hashing remaps only ~1/N keys when the ring changes." },
      { h: "How it works behind the scenes", body: "Hash both nodes and keys onto a circular 0..2^32 ring. A key belongs to the first node clockwise. Removing a node only moves its keys to the next node; adding one only steals a slice. Virtual nodes (many points per server) smooth out skew and let you weight capacity." },
      { h: "When to use", body: "Distributed caches, sharded databases, partitioned queues — anywhere membership changes and you want minimal data movement." },
      { h: "Tradeoffs", body: "Slight imbalance without enough vnodes; lookups need a sorted structure (O(log V)). Range queries are hard since keys scatter around the ring." },
      { h: "Sample: ring with virtual nodes", lang: "java", code: `class Ring {
    TreeMap<Long,String> ring = new TreeMap<>();
    void add(String node,int vnodes){
        for(int i=0;i<vnodes;i++) ring.put(hash(node+"#"+i), node);
    }
    String get(String key){
        var e = ring.ceilingEntry(hash(key));
        return (e==null ? ring.firstEntry() : e).getValue();
    }
    long hash(String s){ return s.hashCode() & 0xffffffffL; }
}` },
    ],
  },
  /* ---------------------------------------------------- Sharding */
  {
    id: "dd-shard", num: "04", icon: "🧩", title: "Database Sharding", tagline: "Splitting data across machines to scale writes.",
    sections: [
      { h: "Origin", body: "Once a single DB maxed out, large sites (eBay, Flickr, ~2000s) manually split tables across servers. The pattern was formalized as sharding; modern stores (MongoDB, Cassandra, Vitess, Citus) automate it." },
      { h: "Problem it solves", body: "Replicas scale reads, not writes or dataset size. When one primary can't hold the data or absorb writes, you split it: each shard owns a subset, so total capacity grows with nodes." },
      { h: "How it works behind the scenes", body: "Pick a shard key; route by hash (even spread, no range queries), range (range scans, risk hotspots), or directory (lookup table, flexible). A router/coordinator sends each query to the right shard. Cross-shard joins and transactions are hard and usually avoided; rebalancing uses consistent hashing." },
      { h: "When to use", body: "Dataset or write rate exceeds one node; clear partition key with even access. Delay it — sharding adds big operational complexity." },
      { h: "Tradeoffs", body: "No cross-shard joins, scatter-gather queries, hot shards from bad keys, painful resharding. Choose a high-cardinality, evenly-accessed key." },
      { h: "Sample: route by hashed key", lang: "java", code: `class ShardRouter {
    int shards;
    ShardRouter(int n){ shards = n; }
    int shardFor(String key){
        return Math.floorMod(key.hashCode(), shards); // 0..shards-1
    }
    // userId 'u_42' → always lands on the same shard
}` },
    ],
  },
  /* ---------------------------------------------------- Replication */
  {
    id: "dd-repl", num: "05", icon: "📑", title: "Replication", tagline: "Copies for availability, read-scale, and durability.",
    sections: [
      { h: "Origin", body: "Database replication dates to the 1980s for disaster recovery; the web turned it into a read-scaling tool. Leader-follower is standard in MySQL/Postgres; leaderless came with Dynamo/Cassandra." },
      { h: "Problem it solves", body: "One copy is a single point of failure and a read bottleneck. Replication keeps multiple copies so reads scale, a dead node doesn't lose data, and failover is possible." },
      { h: "How it works behind the scenes", body: "Leader-follower: writes go to the leader, which streams its log to followers. Sync replication waits for acks (safe, slower); async is fast but can lose recent writes. On leader death, a follower is promoted. Leaderless (quorum) writes/reads to W/R replicas with R+W>N for overlap." },
      { h: "When to use", body: "Read scaling, HA, geo-locality. Use sync for critical data, async for scale." },
      { h: "Tradeoffs", body: "Replication lag → stale reads; route read-your-writes to the leader. Failover risks split-brain; fence with quorum. More copies cost storage." },
      { h: "Sample: read-your-writes routing", lang: "java", code: `class Router {
    long now(){ return System.currentTimeMillis(); }
    Conn pick(boolean recentlyWrote){
        // after a write, read from leader to avoid replica lag
        return recentlyWrote ? leader() : replica();
    }
    Conn leader(){ /* primary */ return new Conn(); }
    Conn replica(){ /* follower */ return new Conn(); }
}` },
    ],
  },
  /* ---------------------------------------------------- Message queue */
  {
    id: "dd-mq", num: "06", icon: "📨", title: "Message Queues & Kafka", tagline: "Decoupling producers from consumers to absorb spikes.",
    sections: [
      { h: "Origin", body: "Message-oriented middleware (IBM MQ, 1993; JMS, 2001; RabbitMQ, 2007) decoupled enterprise systems. LinkedIn built Kafka (2011) to treat events as an append-only log, redefining streaming." },
      { h: "Problem it solves", body: "Synchronous calls couple services: a slow/down consumer breaks the producer. A queue buffers work so producers fire-and-forget and consumers process at their own pace, smoothing spikes and surviving failures." },
      { h: "How it works behind the scenes", body: "RabbitMQ pushes messages, deletes on ack — one consumer per message. Kafka is a partitioned, replicated commit log: producers append, consumers pull by offset, messages stay for a retention window so many consumers/replays are possible. Partitions give ordering+parallelism; consumer groups balance load." },
      { h: "When to use", body: "Background jobs, async pipelines, event-driven services, smoothing bursts. Kafka for high-throughput replayable streams; SQS for simple managed queues; RabbitMQ for complex routing." },
      { h: "Tradeoffs", body: "Eventual consistency, ordering only per partition, duplicate delivery (need idempotency), DLQs need monitoring." },
      { h: "Sample: producer + idempotent consumer", lang: "java", code: `// Producer
producer.send(new ProducerRecord<>("orders", order.id, order.json()));

// Consumer (at-least-once → dedupe)
for (var rec : consumer.poll(Duration.ofMillis(100))) {
    if (seen.add(rec.key())) {     // idempotency guard
        process(rec.value());
    }
    consumer.commitSync();         // advance offset after work
}` },
    ],
  },
  /* ---------------------------------------------------- Rate limiting */
  {
    id: "dd-rl", num: "07", icon: "🚦", title: "Rate Limiting", tagline: "Protecting systems and enforcing fair use.",
    sections: [
      { h: "Origin", body: "Token/leaky bucket algorithms come from 1990s network traffic shaping (ATM/QoS). Public APIs (Twitter, Stripe) made request rate limiting universal." },
      { h: "Problem it solves", body: "One client (or attacker) can exhaust shared capacity. Rate limiting caps requests per key (user/IP/API key) to protect backends, ensure fairness, and stop abuse." },
      { h: "How it works behind the scenes", body: "Token bucket: tokens refill at a steady rate; each request spends one; empty → reject. It allows bursts up to capacity. Sliding window counts requests in a moving time range for smoother fairness. In distributed systems counters live in Redis with an atomic Lua script so concurrent nodes can't oversell the last token." },
      { h: "When to use", body: "Public APIs, login endpoints (brute-force), expensive operations, per-tenant quotas. Place at gateway." },
      { h: "Tradeoffs", body: "Central store = accurate but a hop; local = fast but approximate. Decide fail-open (availability) vs fail-closed (protection) when the store is down." },
      { h: "Sample: token bucket", lang: "java", code: `class TokenBucket {
    final double rate, cap; double tokens; long last;
    TokenBucket(double rate,double cap){ this.rate=rate; this.cap=cap; tokens=cap; last=System.nanoTime(); }
    synchronized boolean allow(){
        long now=System.nanoTime();
        tokens=Math.min(cap, tokens + (now-last)/1e9*rate);  // refill
        last=now;
        if(tokens>=1){ tokens-=1; return true; }             // spend
        return false;                                        // 429
    }
}` },
    ],
  },
  /* ---------------------------------------------------- Bloom filter */
  {
    id: "dd-bloom", num: "08", icon: "🌸", title: "Bloom Filter", tagline: "Probably present, definitely absent — in tiny space.",
    sections: [
      { h: "Origin", body: "Burton Bloom, 1970, for spell-checkers with scarce memory. Now in Cassandra/HBase (skip SSTable reads), CDNs, and DBs to dodge expensive lookups." },
      { h: "Problem it solves", body: "Checking 'does X exist?' against a huge set is costly (disk/DB). A Bloom filter answers in O(1) bits: 'definitely not present' (skip the lookup) or 'maybe present' (then verify), with a tiny false-positive rate." },
      { h: "How it works behind the scenes", body: "A bit array + k hash functions. Insert sets k bits; query checks them — any 0 means absent, all 1 means probably present. No deletes (basic). False-positive rate tunes via array size m and hash count k for n items." },
      { h: "When to use", body: "Existence pre-checks before a DB/disk hit, dedupe, cache-miss avoidance, malicious-URL screening." },
      { h: "Tradeoffs", body: "False positives possible (never false negatives), can't delete, must size up front." },
      { h: "Sample: bloom filter", lang: "java", code: `class Bloom {
    final long[] bits; final int m,k;
    Bloom(int m,int k){ this.m=m; this.k=k; bits=new long[(m>>6)+1]; }
    void add(String s){ for(int i=0;i<k;i++) set(idx(s,i)); }
    boolean maybe(String s){ for(int i=0;i<k;i++) if(!get(idx(s,i))) return false; return true; }
    int idx(String s,int i){ return Math.floorMod((s.hashCode()*31+i*0x9e3779b1), m); }
    void set(int b){ bits[b>>6] |= 1L<<(b&63); }
    boolean get(int b){ return (bits[b>>6]>>(b&63)&1)==1; }
}` },
    ],
  },
  /* ---------------------------------------------------- Distributed lock */
  {
    id: "dd-lock", num: "09", icon: "🔒", title: "Distributed Locks", tagline: "One process at a time across many machines.",
    sections: [
      { h: "Origin", body: "Born from coordination needs in clusters; ZooKeeper (2010) standardized it, Redis Redlock and etcd leases followed." },
      { h: "Problem it solves", body: "Two workers doing the same critical action (reserve last item, run a singleton job) corrupt state. A distributed lock ensures mutual exclusion across processes that share no memory." },
      { h: "How it works behind the scenes", body: "A shared store grants the lock atomically: Redis SET key val NX PX ttl. A TTL/lease prevents deadlock if the holder crashes. Renew (heartbeat) for long work; check ownership token on release to avoid deleting someone else's lock. ZooKeeper/etcd use ephemeral nodes/leases tied to sessions." },
      { h: "When to use", body: "Singleton schedulers, inventory reservation, leader election, single-writer workflows." },
      { h: "Tradeoffs", body: "Clock/lease expiry can let two holders coexist (use fencing tokens); store is a SPOF; locks add latency. Prefer idempotency where possible." },
      { h: "Sample: Redis lock", lang: "java", code: `String token = UUID.randomUUID().toString();
boolean got = redis.set("lock:sku42", token, "NX", "PX", 30000); // acquire
if (got) try {
    reserveInventory();
} finally {
    // release only if we still own it (atomic check-and-del)
    redis.eval("if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) end",
               1, "lock:sku42", token);
}` },
    ],
  },
  /* ---------------------------------------------------- Consensus */
  {
    id: "dd-consensus", num: "10", icon: "🤝", title: "Consensus (Raft)", tagline: "Many nodes agreeing on one truth despite failures.",
    sections: [
      { h: "Origin", body: "Paxos (Lamport, 1998) proved agreement possible but was famously hard. Raft (2014) made it understandable; it backs etcd, Consul, and Kubernetes' control plane." },
      { h: "Problem it solves", body: "Replicated systems must agree on order/leadership even when nodes crash or messages drop. Consensus gives a consistent replicated log so all nodes apply the same operations in the same order." },
      { h: "How it works behind the scenes", body: "Nodes elect a leader by term; the leader appends entries to a replicated log and commits once a majority acks. Followers redirect writes to the leader and replace it via election if heartbeats stop. A majority quorum guarantees safety, which is why clusters use odd sizes (3,5)." },
      { h: "When to use", body: "Config stores, leader election, metadata, anything needing strong consistency over replicas." },
      { h: "Tradeoffs", body: "Needs a majority alive; write latency = quorum round-trip; throughput limited by the leader. Not for high-volume data, but for coordinating it." },
      { h: "Sample: commit on majority", lang: "java", code: `boolean commit(LogEntry e){
    log.append(e);
    int acks = 1;                       // self
    for (Node f : followers)
        if (f.appendEntries(e)) acks++; // replicate
    return acks > (followers.size()+1)/2; // majority → committed
}` },
    ],
  },
  /* ---------------------------------------------------- CDN */
  {
    id: "dd-cdn", num: "11", icon: "🌍", title: "CDN", tagline: "Serving content from the edge, near the user.",
    sections: [
      { h: "Origin", body: "Akamai (1998, out of MIT) pioneered CDNs to fix the 'World Wide Wait'. Cloudflare/Fastly added programmable edges." },
      { h: "Problem it solves", body: "Distant users suffer high latency and the origin gets crushed by global read traffic. A CDN caches content at edge POPs worldwide so users hit a nearby server and the origin sees a fraction of requests." },
      { h: "How it works behind the scenes", body: "DNS/Anycast routes a user to the nearest POP. On hit it serves from cache; on miss it fetches from origin, caches per TTL, and serves. Cache keys, TTLs, and invalidation (purge, versioned URLs) control freshness. Modern CDNs run edge compute and TLS termination too." },
      { h: "When to use", body: "Static assets, images, video, downloads, cacheable GET APIs, global audiences." },
      { h: "Tradeoffs", body: "Hard for personalized/dynamic content; invalidation lag; cost. Version asset URLs to bust caches deterministically." },
      { h: "Sample: cache headers + versioning", lang: "java", code: `// long-cache immutable, versioned assets
res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
String url = "/static/app." + buildHash + ".js"; // new hash => fresh fetch
// uncacheable, personalized API:
res.setHeader("Cache-Control", "private, no-store");` },
    ],
  },
  /* ---------------------------------------------------- API gateway */
  {
    id: "dd-gw", num: "12", icon: "🚪", title: "API Gateway", tagline: "A single, smart front door for many services.",
    sections: [
      { h: "Origin", body: "Microservices (2010s) created many endpoints; gateways (Kong, Apigee, AWS API Gateway) centralized cross-cutting concerns so each service didn't reimplement them." },
      { h: "Problem it solves", body: "Without a gateway, every service repeats auth, throttling, logging, and clients juggle many hosts. A gateway is one entry that routes, secures, and shapes traffic." },
      { h: "How it works behind the scenes", body: "It terminates TLS, authenticates (JWT/API key), rate-limits, validates, routes by path/host to backends, transforms requests/responses, and emits metrics/traces — a programmable reverse proxy. It can aggregate calls (BFF) for clients." },
      { h: "When to use", body: "Microservices, public APIs, mobile backends needing auth/throttling/observability in one place." },
      { h: "Tradeoffs", body: "Can bottleneck if overloaded with logic; extra hop; keep it thin (policy/routing, not business logic)." },
      { h: "Sample: gateway filter chain", lang: "java", code: `Response handle(Request r){
    if(!auth.valid(r.token())) return Response.status(401);   // authN
    if(!limiter.allow(r.user())) return Response.status(429);  // throttle
    r = transform(r);                                          // shape
    Response res = route(r);                                   // to service
    metrics.record(r, res);                                    // observe
    return res;
}` },
    ],
  },
  /* ---------------------------------------------------- Search index */
  {
    id: "dd-search", num: "13", icon: "🔎", title: "Search & Inverted Index", tagline: "Finding documents by content, ranked by relevance.",
    sections: [
      { h: "Origin", body: "Inverted indexes powered 1960s library systems and Google's crawler; Lucene (1999) → Elasticsearch (2010) made full-text search ubiquitous." },
      { h: "Problem it solves", body: "SQL LIKE '%term%' scans every row and can't rank. Users want fast, typo-tolerant, relevance-ranked search over text. An inverted index makes term→document lookup instant." },
      { h: "How it works behind the scenes", body: "Documents are tokenized, normalized (lowercase, stem), and stored as a map term→postings list (doc IDs + positions). A query intersects postings; relevance is scored (TF-IDF/BM25). Index is built async from the source DB, so search is eventually consistent." },
      { h: "When to use", body: "Product/document/log search, autocomplete, analytics. Keep the DB as source of truth, sync via events/CDC." },
      { h: "Tradeoffs", body: "Eventual consistency, extra storage, index maintenance, write amplification." },
      { h: "Sample: tiny inverted index", lang: "java", code: `Map<String,Set<Integer>> index = new HashMap<>();
void add(int docId,String text){
    for(String w: text.toLowerCase().split("\\\\W+"))
        index.computeIfAbsent(w,k->new HashSet<>()).add(docId);
}
Set<Integer> search(String a,String b){          // AND query
    var r = new HashSet<>(index.getOrDefault(a,Set.of()));
    r.retainAll(index.getOrDefault(b,Set.of()));  // intersect postings
    return r;
}` },
    ],
  },
  /* ---------------------------------------------------- Idempotency */
  {
    id: "dd-idem", num: "14", icon: "♻️", title: "Idempotency", tagline: "Safe retries that never double-charge.",
    sections: [
      { h: "Origin", body: "A math/HTTP property (GET/PUT are idempotent) that became critical for payments (Stripe popularized idempotency keys) in unreliable distributed networks." },
      { h: "Problem it solves", body: "Networks time out; clients and queues retry. Without protection, a retried 'charge' or 'create order' runs twice. Idempotency makes repeating an operation produce the same result as doing it once." },
      { h: "How it works behind the scenes", body: "The client sends a unique idempotency key. The server stores key→result on first execution; a duplicate key returns the stored result instead of re-running. For messaging, dedupe by event ID. The store has a TTL and an atomic insert to handle concurrency." },
      { h: "When to use", body: "Payments, order creation, any at-least-once pipeline, retried POSTs." },
      { h: "Tradeoffs", body: "Needs durable key storage + cleanup; keys must be truly unique; brief locking on concurrent same-key requests." },
      { h: "Sample: idempotent charge", lang: "java", code: `Result charge(String key, Cmd cmd){
    Result prev = store.get(key);
    if (prev != null) return prev;          // duplicate → original result
    Result r = paymentProvider.charge(cmd); // do it once
    store.putIfAbsent(key, r, Duration.ofHours(24));
    return r;
}` },
    ],
  },
  /* ---------------------------------------------------- CQRS / ES */
  {
    id: "dd-cqrs", num: "15", icon: "🪞", title: "CQRS & Event Sourcing", tagline: "Separate read/write models; events as truth.",
    sections: [
      { h: "Origin", body: "Greg Young/Udi Dahan formalized CQRS (~2010) from DDD; event sourcing echoes accounting ledgers. Banking and trading systems use them heavily." },
      { h: "Problem it solves", body: "One model optimized for writes is poor for complex reads. CQRS splits them. Event sourcing keeps every change as an immutable event, giving full history, audit, and replay instead of only current state." },
      { h: "How it works behind the scenes", body: "Commands validate and append events to a log (source of truth). Projections consume events to build read-optimized views, possibly in different stores. State is rebuilt by replaying events; snapshots speed recovery. Reads and writes scale independently." },
      { h: "When to use", body: "Audit-heavy domains, complex read vs write needs, temporal queries, ledgers." },
      { h: "Tradeoffs", body: "More moving parts, eventual consistency between write and read, replay/schema evolution complexity." },
      { h: "Sample: rebuild state from events", lang: "java", code: `int balance = 0;
for (Event e : log.replay(accountId)) {       // events are the truth
    switch (e.type) {
        case DEPOSIT -> balance += e.amount;
        case WITHDRAW -> balance -= e.amount;
    }
}
// 'balance' is a projection; events stay immutable + auditable` },
    ],
  },
  /* ---------------------------------------------------- DB indexing */
  {
    id: "dd-index", num: "16", icon: "🗂️", title: "Database Indexing", tagline: "Why a query is instant or scans a million rows.",
    sections: [
      { h: "Origin", body: "B-trees (1970, Bayer & McCreight) underpin nearly every relational DB; LSM-trees (1996) power write-heavy stores like Cassandra, RocksDB, LevelDB." },
      { h: "Problem it solves", body: "Finding rows by a column without an index means a full table scan (O(n)). An index is a sorted structure that turns lookups into O(log n) and enables range queries and ordering." },
      { h: "How it works behind the scenes", body: "B-tree: balanced, sorted, great for reads/ranges; updates modify in place. LSM-tree: writes go to an in-memory memtable, flush to immutable sorted SSTables, compacted in background — fast writes, reads check multiple files (Bloom filters help). Each extra index speeds reads but slows writes and adds storage." },
      { h: "When to use", body: "Index columns used in WHERE/JOIN/ORDER BY; composite indexes for multi-column filters; LSM for write-heavy, B-tree for balanced read/range." },
      { h: "Tradeoffs", body: "Write/space overhead per index, only index real queries, LSM read amplification + compaction cost." },
      { h: "Sample: index decides the plan", lang: "java", code: `// no index on email → full scan O(n)
SELECT * FROM users WHERE email = ?;
CREATE INDEX idx_users_email ON users(email);     // → O(log n)
// composite for combined filter + sort
CREATE INDEX idx_orders ON orders(user_id, created_at DESC);
SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 20;` },
    ],
  },
];

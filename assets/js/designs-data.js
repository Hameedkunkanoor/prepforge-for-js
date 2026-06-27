/* =====================================================================
   DESIGNS DATA — 8 end-to-end HLD case studies. Each has requirements,
   capacity estimates, an architecture diagram, key decisions, a request
   flow (sequence diagram), deep dives and tradeoffs.
   ===================================================================== */
window.DESIGNS = [
  /* ------------------------------------------------ 1. URL Shortener */
  {
    id: "d-url",
    num: "01",
    icon: "🔗",
    title: "URL Shortener (TinyURL / Bit.ly)",
    tagline: "Turn long URLs into short codes and redirect billions of times a day with millisecond latency.",
    interview: [
      "Scope it as a read-heavy redirect service; clarify custom alias, expiry and analytics.",
      "Estimate ~100M writes/day and 100:1 reads → ~116K redirects/sec; base62 7-char codes are plenty.",
      "Core: API + a Key Generation Service for unique codes, stored in a key-value DB.",
      "Speed: Redis for hot links, CDN for redirects; track clicks asynchronously via Kafka.",
      "Close with tradeoffs: 301 vs 302 (caching vs accurate counts) and pre-minted vs random keys.",
    ],
    functional: [
      "Create a short code for a long URL",
      "Redirect a short code to the original URL",
      "Optional custom alias and expiration",
      "Basic click analytics",
    ],
    nonFunctional: [
      "Very low-latency redirects (read-heavy)",
      "High availability — links must never break",
      "Short codes are not guessable/sequential",
      "Horizontally scalable storage",
    ],
    scale: [
      "~100M new URLs/day → ~1,160 writes/sec",
      "100:1 read:write → ~116K redirects/sec",
      "Base62, 7 chars → 62⁷ ≈ 3.5 trillion codes",
      "~500 bytes/record → ~18 TB/year",
    ],
    architecture: {
      src: `flowchart TB
  U["Client"] --> CDN["CDN / Edge"]
  CDN --> LB["Load Balancer"]
  LB --> API["URL Service (stateless)"]
  API -->|new short code| KGS["Key Generation Service<br/>pre-minted base62 keys"]
  API -->|read/write| CACHE["Redis cache<br/>hot short→long"]
  CACHE -->|miss| DB[("NoSQL store<br/>DynamoDB / Cassandra")]
  API -.click event.-> Q[["Kafka"]]
  Q --> AN["Analytics consumer"]
  AN --> WH[("Analytics warehouse")]`,
      note: "Redirects are read-heavy, so a CDN + Redis layer absorbs the vast majority before the DB.",
    },
    decisions: [
      { component: "Short code", choice: "Base62 encoding of a unique counter (or pre-generated keys)", why: "Compact, collision-free, and not sequential when keys come from a shuffled pool." },
      { component: "Key Generation Service", choice: "Pre-mint keys in batches", why: "Removes collision checks from the hot path — the API just grabs the next unused key." },
      { component: "Database", choice: "DynamoDB / Cassandra (key-value)", why: "Access is purely by key (short code); scales horizontally for trillions of rows." },
      { component: "Cache", choice: "Redis for hot mappings", why: "A small fraction of links drive most traffic; cache them for sub-ms redirects." },
      { component: "Analytics", choice: "Async via Kafka", why: "Click tracking must never slow the redirect; process it off the critical path." },
    ],
    flow: {
      title: "Shorten then redirect",
      src: `sequenceDiagram
  participant C as Client
  participant A as URL Service
  participant K as Key Gen
  participant Ca as Redis
  participant D as DB
  C->>A: POST /shorten (longURL)
  A->>K: get next key
  K-->>A: "aZ3xQ9"
  A->>D: store code → longURL
  A->>Ca: cache code → longURL
  A-->>C: short.ly/aZ3xQ9
  Note over C,D: ...later, someone clicks...
  C->>A: GET /aZ3xQ9
  A->>Ca: lookup
  Ca-->>A: longURL (hit)
  A-->>C: 301 redirect`,
      note: "On a cache miss the service reads the DB, then back-fills Redis for next time.",
    },
    deepDives: [
      { title: "Generating unique short codes", body: "Two approaches: (1) a counter encoded in base62 — simple and collision-free, but predictable unless you shuffle the key space; (2) random codes with a uniqueness check — unpredictable but needs collision handling. A Key Generation Service that pre-mints and hands out keys gives you the best of both: no collisions and no DB check on the write path." },
      { title: "Read-heavy caching", body: "With a 100:1 read:write ratio, redirects dominate. A CDN can cache permanent (301) redirects at the edge, and Redis caches hot mappings. The database only sees cold lookups, so it can be sized for storage, not peak QPS." },
      { title: "Analytics without slowing redirects", body: "Emit a click event to Kafka and return the redirect immediately. A separate consumer aggregates counts, geos, and referrers into a warehouse. The user never waits for analytics." },
    ],
    tradeoffs: [
      "301 (permanent) redirects cache better but make analytics harder; 302 gives accurate counts at higher origin load.",
      "Pre-minted keys add a tiny coordination component but remove collision checks from every write.",
    ],
  },

  /* ------------------------------------------------ 2. News Feed */
  {
    id: "d-feed",
    num: "02",
    icon: "📰",
    title: "Social News Feed (Twitter / Instagram)",
    tagline: "Show each user a fast, ranked feed of posts from everyone they follow — at hundreds of millions of users.",
    interview: [
      "Scope: read-heavy timeline; clarify ranking, media and how many followers the biggest accounts have.",
      "Name the key problem — fan-out. Compare push vs pull and justify a hybrid model.",
      "Store each timeline as a Redis list of post IDs; hydrate post bodies from cache/DB.",
      "Media goes to object storage + CDN; ranking lives in its own service for A/B testing.",
      "Tradeoffs: celebrity fan-out, acceptable staleness and cursor-based pagination.",
    ],
    functional: [
      "Create posts (text + media)",
      "Follow / unfollow users",
      "Read a ranked feed of followees' posts",
      "Pagination / infinite scroll",
    ],
    nonFunctional: [
      "Feed reads must be very fast",
      "Eventual consistency is acceptable",
      "Read-heavy; handle the 'celebrity' fan-out problem",
      "Highly available",
    ],
    scale: [
      "~500M daily users, read:write ≈ 100:1",
      "Average fan-out moderate; celebrities have 10M+ followers",
      "Feed pulled far more often than posts created",
    ],
    architecture: {
      src: `flowchart TB
  subgraph Write
    P["Post Service"] --> PDB[("Post store")]
    P --> FO["Fan-out Service"]
    FO -->|push to followers| FC["Feed Cache (Redis)<br/>per-user timeline"]
    FO --> GR[("Social graph DB")]
  end
  subgraph Read
    U["Client"] --> FAPI["Feed API"]
    FAPI --> FC
    FAPI -->|merge celebrity posts| PDB
    FAPI --> RANK["Ranking Service"]
  end
  P -. media .-> OBJ["Object store + CDN"]`,
      note: "Hybrid fan-out: push for normal users (precomputed timelines), pull/merge for celebrities at read time.",
    },
    decisions: [
      { component: "Fan-out", choice: "Hybrid (push for most, pull for celebrities)", why: "Pure push explodes for 10M-follower accounts; pure pull is slow. Hybrid balances both." },
      { component: "Feed cache", choice: "Redis list per user", why: "Precomputed timelines give O(1) feed reads for the common case." },
      { component: "Social graph", choice: "Graph DB or sharded adjacency store", why: "Follow relationships are queried constantly to drive fan-out." },
      { component: "Media", choice: "Object storage + CDN", why: "Images/video are large and globally read — keep them off the app path." },
      { component: "Ranking", choice: "Separate service (recency + engagement signals)", why: "Lets you evolve ranking independently and A/B test." },
    ],
    flow: {
      title: "Post and read feed",
      src: `sequenceDiagram
  participant A as Author
  participant PS as Post Service
  participant FO as Fan-out
  participant FC as Feed Cache
  participant R as Reader
  A->>PS: create post
  PS->>PS: store post + media URL
  PS->>FO: post id + author
  FO->>FC: append to each follower timeline
  Note over R,FC: reader opens app
  R->>FC: GET feed (page)
  FC-->>R: precomputed timeline
  R->>R: merge live celebrity posts + rank`,
      note: "Normal authors fan out on write; celebrity posts are merged on read to avoid 10M writes per tweet.",
    },
    deepDives: [
      { title: "Fan-out on write vs read", body: "Fan-out on write precomputes each follower's timeline when a post is created — fast reads, but a celebrity post means millions of writes. Fan-out on read assembles the feed at request time — cheap writes, expensive reads. The hybrid model pushes for ordinary accounts and pulls celebrity posts on read, then merges them." },
      { title: "Timeline storage", body: "Store each user's timeline as a capped Redis list of post IDs (not full posts). Hydrate the actual post content from the post store/cache at read time. This keeps memory bounded and posts editable in one place." },
      { title: "Ranking and pagination", body: "Start with reverse-chronological, then layer engagement-based ranking. Use cursor-based pagination (last seen ID/score) rather than offsets so infinite scroll stays correct as new posts arrive." },
    ],
    tradeoffs: [
      "Push gives fast reads but heavy writes and storage; pull is the opposite — hybrid is the pragmatic middle.",
      "Precomputed feeds can be slightly stale; acceptable for a social feed.",
    ],
  },

  /* ------------------------------------------------ 3. Chat */
  {
    id: "d-chat",
    num: "03",
    icon: "💬",
    title: "Realtime Chat (WhatsApp / Messenger)",
    tagline: "Deliver 1:1 and group messages in real time with ordering, receipts, presence and offline delivery.",
    interview: [
      "Scope: 1:1 + group, receipts, presence, offline; goals are real-time, ordered and durable.",
      "Use WebSockets via stateful gateways; a session registry maps each user to their gateway.",
      "Persist messages in Cassandra (write-heavy, time-ordered); keep presence in Redis with TTLs.",
      "Offline recipients → queue + push (APNs/FCM); order by a per-conversation sequence number.",
      "Tradeoffs: scaling stateful gateways, group fan-out and end-to-end encryption.",
    ],
    functional: [
      "1:1 and group messaging",
      "Delivery & read receipts",
      "Online/last-seen presence",
      "Offline delivery + message history",
    ],
    nonFunctional: [
      "Real-time, low-latency delivery",
      "Per-conversation message ordering",
      "Durable — no lost messages",
      "Millions of concurrent connections",
    ],
    scale: [
      "Tens of billions of messages/day",
      "Millions of concurrent WebSocket connections",
      "Write-heavy, time-ordered message store",
    ],
    architecture: {
      src: `flowchart TB
  C1["Client A"] <-->|WebSocket| GW["Connection Gateway<br/>(stateful WS servers)"]
  C2["Client B"] <-->|WebSocket| GW
  GW --> CS["Chat Service"]
  CS --> MDB[("Message store<br/>Cassandra — time-ordered")]
  CS --> PR["Presence (Redis)"]
  CS --> Q[["Queue: offline / fan-out"]]
  Q --> PUSH["Push Service → APNs / FCM"]
  GW <-->|who is connected where| REG["Session Registry (Redis)"]`,
      note: "Stateful gateways hold the live sockets; a session registry maps each user to the gateway holding their connection.",
    },
    decisions: [
      { component: "Transport", choice: "WebSockets", why: "Persistent, bidirectional — servers push messages instantly without polling." },
      { component: "Message store", choice: "Cassandra (wide-column)", why: "Write-heavy, append-only, time-ordered by conversation — exactly its strength." },
      { component: "Presence", choice: "Redis with TTL heartbeats", why: "Fast online/last-seen lookups; expires automatically when heartbeats stop." },
      { component: "Routing", choice: "Session registry maps user → gateway", why: "To deliver a message you must find which connection server holds the recipient." },
      { component: "Offline", choice: "Queue + push (APNs/FCM)", why: "Store-and-forward when the recipient is offline, then wake them via push." },
    ],
    flow: {
      title: "Send a message",
      src: `sequenceDiagram
  participant A as Sender
  participant GA as Gateway A
  participant CS as Chat Service
  participant DB as Message Store
  participant GB as Gateway B
  participant B as Recipient
  A->>GA: send msg (conv, seq)
  GA->>CS: persist + route
  CS->>DB: append message
  CS->>GB: recipient online here?
  GB->>B: push over WebSocket
  B-->>CS: delivered receipt
  CS-->>A: delivered tick`,
      note: "If the recipient is offline, the message is queued and a mobile push notification is sent instead.",
    },
    deepDives: [
      { title: "Connection management", body: "WebSocket servers are stateful — each holds thousands of live connections. A session registry (Redis) records which gateway a user is connected to so any node can route a message to the right socket. On disconnect, the registry entry expires." },
      { title: "Ordering", body: "Assign a monotonic per-conversation sequence number (or use a logical clock). Clients order messages by sequence, not wall-clock time, so out-of-order network delivery still renders correctly." },
      { title: "Group fan-out", body: "For small groups, fan out to each member's connection directly. For large groups, treat it like a feed: write once to the group's message log and let members read/subscribe, avoiding N× duplicate delivery work on the hot path." },
    ],
    tradeoffs: [
      "Stateful gateways are harder to scale/deploy than stateless services but are required for live sockets.",
      "End-to-end encryption improves privacy but limits server-side features like search.",
    ],
  },

  /* ------------------------------------------------ 4. Video Streaming */
  {
    id: "d-video",
    num: "04",
    icon: "🎬",
    title: "Video Streaming (YouTube / Netflix)",
    tagline: "Ingest, transcode, store and stream video globally with adaptive bitrate and smooth playback.",
    interview: [
      "Scope: upload, transcode, adaptive playback, search; the challenges are storage and global delivery.",
      "Build an async pipeline: raw → object store → transcode queue + workers → HLS/DASH renditions.",
      "Deliver entirely from the CDN with adaptive bitrate; metadata in a DB plus a search index.",
      "Count views asynchronously via Kafka and accept approximate numbers.",
      "Tradeoffs: pre-transcoding storage vs on-the-fly latency; exact vs approximate view counts.",
    ],
    functional: [
      "Upload video",
      "Transcode into multiple resolutions/bitrates",
      "Adaptive-bitrate streaming",
      "Search, metadata, view counts",
    ],
    nonFunctional: [
      "Massive durable storage (petabytes)",
      "Global low-latency delivery",
      "High availability and smooth playback",
    ],
    scale: [
      "Petabytes of video, billions of views/day",
      "Each upload → several renditions (240p…4K)",
      "Read-dominant delivery via CDN",
    ],
    architecture: {
      src: `flowchart TB
  UP["Uploader"] --> ING["Upload Service"]
  ING --> RAW["Object store: raw video (S3)"]
  RAW --> TQ[["Transcode queue"]]
  TQ --> TW["Transcoding workers"]
  TW --> REN["Object store: renditions<br/>HLS/DASH segments"]
  TW --> META[("Metadata DB")]
  REN --> CDN["CDN (edge delivery)"]
  V["Viewer"] --> CDN
  V --> PAPI["Playback API"]
  PAPI --> META
  V -.view event.-> K[["Kafka"]]
  K --> VC["View-count / analytics"]
  SRCH["Search (Elasticsearch)"] --- META`,
      note: "Upload and transcoding are async; playback is served entirely from the CDN for global low latency.",
    },
    decisions: [
      { component: "Storage", choice: "Object storage (S3) for raw + renditions", why: "Cheap, durable, effectively infinite — ideal for large immutable blobs." },
      { component: "Transcoding", choice: "Queue + worker pool (or MediaConvert)", why: "Transcoding is CPU-heavy and bursty; decouple it and scale workers independently." },
      { component: "Delivery", choice: "CDN with HLS/DASH", why: "Adaptive bitrate adjusts quality to bandwidth; CDN serves segments near the viewer." },
      { component: "Metadata", choice: "SQL/NoSQL + Elasticsearch", why: "Relational metadata for catalog, search index for discovery." },
      { component: "View counts", choice: "Async via Kafka, approximate", why: "Exact real-time counts at billions of views are wasteful; aggregate asynchronously." },
    ],
    flow: {
      title: "Upload pipeline & playback",
      src: `sequenceDiagram
  participant U as Uploader
  participant I as Upload Svc
  participant Q as Transcode Queue
  participant W as Worker
  participant CDN as CDN
  participant V as Viewer
  U->>I: upload raw file
  I->>Q: enqueue transcode job
  Q->>W: pick up job
  W->>W: produce 240p…4K HLS segments
  W->>CDN: publish renditions
  Note over V,CDN: later, playback
  V->>CDN: request manifest + segments
  CDN-->>V: stream (adaptive bitrate)`,
      note: "The viewer's player picks the best rendition for current bandwidth and switches on the fly.",
    },
    deepDives: [
      { title: "Transcoding pipeline", body: "On upload, store the raw file and enqueue a transcode job. Workers split the video into chunks, encode each into multiple resolutions and bitrates in parallel, and package them as HLS/DASH segments with a manifest. Chunked, parallel encoding makes even long videos fast to process." },
      { title: "Adaptive bitrate & CDN", body: "The manifest lists all renditions. The client player measures throughput and requests higher- or lower-quality segments accordingly, preventing buffering. All segments are cached at CDN edges, so the origin and databases are shielded from playback traffic entirely." },
      { title: "View counts at scale", body: "Counting every view synchronously would hammer the database. Instead, emit view events to Kafka and aggregate them in a stream processor, updating approximate counts periodically. Exactness is traded for scale." },
    ],
    tradeoffs: [
      "Pre-transcoding all renditions costs storage but guarantees instant playback; on-the-fly transcoding saves storage but adds latency.",
      "Approximate view counts scale far better than strongly-consistent ones.",
    ],
  },

  /* ------------------------------------------------ 5. Ride Hailing */
  {
    id: "d-ride",
    num: "05",
    icon: "🚕",
    title: "Ride-Hailing (Uber / Lyft)",
    tagline: "Match riders to nearby drivers in real time using live geospatial data, then manage the trip and payment.",
    interview: [
      "Scope: live driver locations, matching, trip lifecycle, payments; the goal is low-latency matching.",
      "Geo-index live locations with geohash/S2 cells in Redis; query the rider's cell plus neighbors.",
      "Ingest millions of pings via Kafka; a dispatch service runs the matching algorithm.",
      "Trips and payments in SQL with idempotency keys; push updates over WebSocket.",
      "Tradeoffs: cell size vs index churn; strong consistency on trips vs speed on locations.",
    ],
    functional: [
      "Drivers stream live location",
      "Rider requests a ride; match nearest driver",
      "Trip lifecycle (accept → ongoing → complete)",
      "Pricing (incl. surge) and payment",
    ],
    nonFunctional: [
      "Low-latency matching",
      "Handle huge volume of location updates",
      "Reliable payments (idempotent)",
      "Highly available, geo-distributed",
    ],
    scale: [
      "Millions of active drivers updating location every few seconds",
      "Very high write rate of location pings",
      "Matching must be fast and local",
    ],
    architecture: {
      src: `flowchart TB
  D["Driver app"] -->|location pings| LI["Location Ingest"]
  LI --> GEO["Geo Index (Redis)<br/>geohash / S2 cells"]
  LI -.stream.-> K[["Kafka"]]
  R["Rider app"] --> TS["Trip Service"]
  TS --> MATCH["Matching / Dispatch"]
  MATCH --> GEO
  MATCH --> TS
  TS --> TDB[("Trip DB (SQL)")]
  TS --> PAY["Payment Service (idempotent)"]
  TS --> NOTIF["Notify driver/rider (WS/push)"]
  SURGE["Surge Pricing"] --- MATCH`,
      note: "Live driver locations live in an in-memory geospatial index; matching queries 'nearby drivers' in a cell.",
    },
    decisions: [
      { component: "Geo index", choice: "Geohash / S2 cells in Redis", why: "Reduces 'find nearby drivers' to a fast lookup of a few grid cells." },
      { component: "Location ingest", choice: "High-throughput service + Kafka stream", why: "Millions of pings/sec; buffer and process asynchronously for analytics/ETA." },
      { component: "Matching", choice: "Dedicated dispatch service", why: "Encapsulates the matching algorithm (distance, ETA, driver rating, surge)." },
      { component: "Trips & payments", choice: "SQL with idempotency keys", why: "Trips and money need transactions and exactly-once charging." },
      { component: "Notifications", choice: "WebSocket + push", why: "Both parties need real-time trip updates." },
    ],
    flow: {
      title: "Request a ride",
      src: `sequenceDiagram
  participant R as Rider
  participant TS as Trip Service
  participant M as Matching
  participant G as Geo Index
  participant D as Driver
  R->>TS: request ride (pickup)
  TS->>M: find driver
  M->>G: nearby drivers in cell
  G-->>M: candidate drivers
  M->>D: offer trip
  D-->>M: accept
  M-->>TS: matched driver
  TS-->>R: driver on the way`,
      note: "If the first driver declines or times out, dispatch offers the next-best candidate.",
    },
    deepDives: [
      { title: "Geospatial indexing", body: "Encode each driver's lat/long into a geohash or S2 cell ID and store it in Redis keyed by cell. To find nearby drivers, compute the rider's cell plus neighbors and read those buckets — turning an expensive distance scan into a handful of key lookups. Locations update every few seconds, so the index is constantly refreshed." },
      { title: "Handling location-update volume", body: "Millions of drivers pinging every few seconds is a massive write stream. Ingest pings into Redis for the live index and also publish to Kafka for ETA models, analytics, and replay — keeping the matching path lean." },
      { title: "Payments & surge", body: "Charge with an idempotency key so retries never double-bill. Surge pricing is computed per area from real-time supply/demand (driver vs request density) and applied at request time. Trip state transitions are stored transactionally." },
    ],
    tradeoffs: [
      "Smaller geo cells give more precise matching but more index churn; tune cell size to driver density.",
      "Strong consistency on trip state vs. availability — trips favor correctness, location data favors speed.",
    ],
  },

  /* ------------------------------------------------ 6. E-commerce / Flash Sale */
  {
    id: "d-shop",
    num: "06",
    icon: "🛒",
    title: "E-commerce Checkout & Flash Sale (Amazon)",
    tagline: "Browse a huge catalog fast, then check out with correct inventory and exactly-once payments under spikes.",
    interview: [
      "Split read from write: browse is cache/replica/CDN-heavy; checkout is consistency-first.",
      "Prevent oversell with an atomic inventory decrement plus a lock on the hot SKU.",
      "Orders and payment in ACID SQL with idempotency keys; coordinate services with a saga.",
      "Survive spikes: pre-warm caches, add a waiting room/queue and rate-limit bots.",
      "Tradeoffs: inventory consistency vs throughput; saga vs a single transaction.",
    ],
    functional: [
      "Browse/search catalog, view product",
      "Cart and checkout",
      "Inventory reservation (no overselling)",
      "Payment, order creation, fulfillment",
    ],
    nonFunctional: [
      "Browse is read-heavy and highly available",
      "Inventory & payment need strong consistency",
      "Survive flash-sale traffic spikes",
    ],
    scale: [
      "Massive read traffic on catalog/search",
      "Extreme concurrency on a few hot items during sales",
      "Money path must be correct, not just fast",
    ],
    architecture: {
      src: `flowchart TB
  U["Client"] --> CDN["CDN"]
  CDN --> GW["API Gateway"]
  GW --> CAT["Catalog Service"]
  CAT --> CC["Cache (Redis)"]
  CAT --> SR["Search (Elasticsearch)"]
  CAT --> CDB[("Catalog DB + read replicas")]
  GW --> CART["Cart (Redis/Dynamo)"]
  GW --> CO["Checkout Service"]
  CO --> INV["Inventory Service<br/>atomic decrement + lock"]
  INV --> RINV["Redis counter"]
  CO --> PAY["Payment (idempotent)"]
  CO --> ORD[("Order DB (SQL, ACID)")]
  CO -.saga events.-> Q[["Queue"]]
  Q --> FUL["Fulfillment / email"]`,
      note: "Read path (catalog) is cache + replica heavy; write path (inventory + payment) is consistency-first with a saga.",
    },
    decisions: [
      { component: "Catalog/browse", choice: "CDN + Redis + read replicas + search", why: "Reads dominate; serve them from caches and replicas, never overload the primary." },
      { component: "Inventory", choice: "Atomic decrement (Redis) + distributed lock", why: "Prevents overselling hot items when thousands check out simultaneously." },
      { component: "Orders & payment", choice: "SQL (ACID) + idempotency keys", why: "Money and orders demand atomic, exactly-once correctness." },
      { component: "Cross-service workflow", choice: "Saga with compensations", why: "Reserve → pay → confirm spans services; compensate (release stock/refund) on failure." },
      { component: "Fulfillment", choice: "Async queue", why: "Shipping, email, and invoicing don't belong on the checkout latency path." },
    ],
    flow: {
      title: "Checkout with a saga",
      src: `sequenceDiagram
  participant C as Client
  participant CO as Checkout
  participant I as Inventory
  participant P as Payment
  participant O as Order
  C->>CO: place order (idempotency key)
  CO->>I: reserve stock (atomic)
  I-->>CO: reserved
  CO->>P: charge (idempotency key)
  P-->>CO: success
  CO->>O: create order
  O-->>C: confirmed
  Note over CO,I: if payment fails → release stock (compensate)`,
      note: "Each step commits locally; a failure triggers compensating actions to undo prior steps.",
    },
    deepDives: [
      { title: "Preventing oversold inventory", body: "Under a flash sale, thousands try to buy the last units at once. Use an atomic decrement on a Redis counter (or a row-level lock / conditional update) so only as many orders succeed as there is stock. A distributed lock or single-writer per SKU serializes the critical reservation step." },
      { title: "Surviving the spike", body: "Pre-warm caches and the CDN before the sale. Put a queue or virtual waiting room in front so requests are admitted at a controlled rate (backpressure), and apply rate limiting per user to stop bots. The browse path stays on replicas so the primary is reserved for writes." },
      { title: "Exactly-once payments", body: "Generate an idempotency key per checkout. If the client retries after a timeout, the payment service recognizes the key and returns the original result instead of charging again. The saga's compensations release stock or refund if a later step fails." },
    ],
    tradeoffs: [
      "Strong inventory consistency limits raw throughput on a SKU — but overselling is worse than queuing.",
      "Sagas add complexity vs. a single transaction, but a single ACID transaction can't span services.",
    ],
  },

  /* ------------------------------------------------ 7. Rate Limiter */
  {
    id: "d-ratelimit",
    num: "07",
    icon: "🚦",
    title: "Distributed Rate Limiter",
    tagline: "Cap how many requests a user or API key can make, accurately and with low latency, across many servers.",
    interview: [
      "Scope: per-key limits, very low latency, distributed accuracy and a failure policy.",
      "Use a token bucket in Redis; make refill + consume atomic with a Lua script.",
      "Place it at the gateway and key by user / API key / IP.",
      "Compare algorithms (fixed, sliding, token, leaky) and local+sync at extreme scale.",
      "Tradeoffs: central accuracy vs local latency; fail-open vs fail-closed.",
    ],
    functional: [
      "Limit requests per user/API key/IP",
      "Support multiple windows (per-sec, per-min)",
      "Return clear 429 + retry-after",
    ],
    nonFunctional: [
      "Very low added latency",
      "Accurate across a distributed fleet",
      "Resilient if the limiter store is unavailable",
    ],
    scale: [
      "Sits in front of every request",
      "Shared counters across many app nodes",
      "Must be O(1) per check",
    ],
    architecture: {
      src: `flowchart TB
  C["Client"] --> GW["API Gateway / Middleware"]
  GW --> RL["Rate Limiter"]
  RL -->|atomic check via Lua| R["Redis<br/>token bucket / sliding window"]
  RL -->|allowed| APP["App Service"]
  RL -->|exceeded| X["429 Too Many Requests"]
  R -. replicate .- R2["Redis replica"]`,
      note: "A central Redis holds counters; an atomic Lua script makes 'check-and-decrement' a single round trip.",
    },
    decisions: [
      { component: "Algorithm", choice: "Token bucket (Redis)", why: "Allows short bursts up to capacity while enforcing an average rate; simple and fair." },
      { component: "Atomicity", choice: "Lua script in Redis", why: "Read-modify-write the counter atomically, avoiding race conditions across nodes." },
      { component: "Placement", choice: "At the gateway / middleware", why: "Reject excess traffic before it reaches business logic." },
      { component: "Failure mode", choice: "Decide fail-open vs fail-closed", why: "If Redis is down, choose whether to allow (availability) or block (protection)." },
      { component: "Identity", choice: "Key by user/API key/IP", why: "Different fairness policies for different principals." },
    ],
    flow: {
      title: "Check a request",
      src: `sequenceDiagram
  participant C as Client
  participant RL as Rate Limiter
  participant R as Redis
  C->>RL: request (key=user:42)
  RL->>R: Lua: refill + try-consume token
  alt token available
    R-->>RL: allowed (remaining=n)
    RL-->>C: 200 (forward)
  else bucket empty
    R-->>RL: denied
    RL-->>C: 429 + Retry-After
  end`,
      note: "Refill and consume happen in one atomic script so concurrent requests can't both grab the last token.",
    },
    deepDives: [
      { title: "Algorithms compared", body: "Fixed window is simplest but allows double bursts at window edges. Sliding window log is accurate but memory-heavy. Sliding window counter approximates it cheaply. Token bucket allows controlled bursts and is the common default. Leaky bucket smooths output to a constant rate." },
      { title: "Distributed accuracy", body: "With many app nodes, counters must be shared — a central Redis is the simplest correct choice. An atomic Lua script performs refill + consume in one step so two nodes can't both succeed on the last token. For extreme scale, nodes keep a small local allowance and periodically sync to reduce Redis round trips, trading a little accuracy for latency." },
      { title: "Resilience", body: "If the limiter store is unreachable, you must pick a policy: fail-open (allow traffic, prioritizing availability) or fail-closed (reject, prioritizing protection). Public APIs often fail-open with local fallback limits; sensitive endpoints fail-closed." },
    ],
    tradeoffs: [
      "Central store = accurate but adds a hop; local counters = fast but approximate.",
      "Fail-open protects user experience; fail-closed protects the backend — choose per endpoint.",
    ],
  },

  /* ------------------------------------------------ 8. Notification System */
  {
    id: "d-notify",
    num: "08",
    icon: "🔔",
    title: "Notification System (Push / Email / SMS)",
    tagline: "Reliably deliver notifications across channels at high throughput, honoring preferences, retries and rate limits.",
    interview: [
      "Scope: multi-channel (push/email/SMS), preferences, dedup, retries and provider limits.",
      "Per-channel queues + worker pools isolate email, SMS and push from each other.",
      "Check the preference service first; dedup with an idempotency key per notification.",
      "Retry with backoff + DLQ; rate-limit per provider; use priority queues for OTP vs marketing.",
      "Tradeoffs: at-least-once + dedup vs exactly-once; the cost of channel isolation.",
    ],
    functional: [
      "Send via push, email, SMS",
      "Templates and user preferences/opt-out",
      "Deduplication and retries",
      "Delivery tracking",
    ],
    nonFunctional: [
      "High throughput, reliable delivery",
      "Respect per-provider rate limits",
      "No duplicate spam; graceful failure handling",
    ],
    scale: [
      "Bursty fan-out (e.g. 'breaking news' to millions)",
      "Multiple external providers with their own limits",
      "At-least-once delivery + dedup",
    ],
    architecture: {
      src: `flowchart TB
  PRD["Producers (services)"] --> NS["Notification Service"]
  NS --> PREF["Preference Service (opt-in/out)"]
  NS --> TPL["Template Service"]
  NS --> Q[["Channel queues (Kafka/SQS)"]]
  Q --> WE["Email workers"]
  Q --> WP["Push workers"]
  Q --> WS["SMS workers"]
  WE --> ESP["Email provider"]
  WP --> FCM["APNs / FCM"]
  WS --> SMS["SMS provider"]
  WE & WP & WS -. failures .-> DLQ[["Dead Letter Queue"]]
  WE & WP & WS -.status.-> TRK[("Delivery tracking")]`,
      note: "Per-channel queues and worker pools isolate channels; failures route to a DLQ for inspection and replay.",
    },
    decisions: [
      { component: "Decoupling", choice: "Queue per channel + worker pools", why: "Channels have different speeds/limits; isolate them so a slow SMS provider can't block email." },
      { component: "Preferences", choice: "Preference service checked before send", why: "Honor opt-outs and quiet hours; legal and UX requirement." },
      { component: "Reliability", choice: "Retries + exponential backoff + DLQ", why: "Providers fail transiently; retry, then quarantine persistent failures." },
      { component: "Dedup", choice: "Idempotency/dedup key per notification", why: "At-least-once delivery means duplicates must be filtered out." },
      { component: "Rate control", choice: "Per-provider rate limiting", why: "Stay within each provider's quota to avoid throttling/blocks." },
    ],
    flow: {
      title: "Send a notification",
      src: `sequenceDiagram
  participant S as Service
  participant NS as Notification Svc
  participant PF as Preferences
  participant Q as Channel Queue
  participant W as Worker
  participant P as Provider
  S->>NS: notify(user, event)
  NS->>PF: allowed on this channel?
  PF-->>NS: yes (push)
  NS->>Q: enqueue (dedup key)
  Q->>W: deliver
  W->>P: send via APNs/FCM
  P-->>W: accepted
  W-->>NS: delivered (tracking)`,
      note: "If delivery fails, the worker retries with backoff; after N attempts the message goes to the DLQ.",
    },
    deepDives: [
      { title: "Fan-out and prioritization", body: "A single event (breaking news) can fan out to millions. The notification service expands recipients and enqueues per-channel messages. Use separate priority queues so transactional messages (OTP, password reset) jump ahead of bulk marketing sends." },
      { title: "Retries, backoff and DLQ", body: "External providers fail intermittently. Workers retry with exponential backoff and jitter. Messages that keep failing move to a dead-letter queue with an alarm so engineers can inspect and replay them, instead of silently looping forever." },
      { title: "Deduplication and preferences", body: "Attach a dedup key (event + user + channel) so retried or duplicated events are sent once. Always check the preference service first for opt-outs, channel choice, and quiet hours before sending." },
    ],
    tradeoffs: [
      "At-least-once + dedup is simpler and safer than exactly-once delivery across third-party providers.",
      "Per-channel isolation costs more infrastructure but prevents one provider's outage from blocking others.",
    ],
  },

  /* ------------------------------------------------ 9. File Sync (Dropbox) */
  {
    id: "d-drive",
    num: "09",
    icon: "📁",
    title: "File Sync & Storage (Dropbox / Google Drive)",
    tagline: "Upload, sync and share files across devices with deduplication, versioning and conflict handling.",
    interview: [
      "Scope: upload/download, multi-device sync, sharing, versioning; clarify file sizes and edit frequency.",
      "Split metadata from bytes: a metadata service plus a chunk service over object storage.",
      "Chunk files and deduplicate by content hash so only changed chunks are uploaded.",
      "Sync via a notification/long-poll channel; resolve conflicts with versions, not overwrites.",
      "Tradeoffs: chunk size vs dedup efficiency; storing every version vs cost.",
    ],
    functional: [
      "Upload / download files",
      "Sync changes across a user's devices",
      "Share files / folders",
      "Version history",
    ],
    nonFunctional: [
      "Durable storage, never lose data",
      "Efficient sync (only changed parts)",
      "Scales to huge files and many devices",
    ],
    scale: [
      "Billions of files, petabytes of data",
      "Many concurrent devices per user",
      "Most files unchanged between syncs",
    ],
    architecture: {
      src: `flowchart TB
  C["Client (watcher)"] --> CH["Chunker<br/>split + hash"]
  CH --> MS["Metadata Service"]
  MS --> MDB[("Metadata DB<br/>files, chunks, versions")]
  CH -->|new chunks only| CS["Chunk Service"]
  CS --> OBJ["Object store (S3)"]
  MS --> NOTIF["Notification Service"]
  NOTIF -.changed.-> C2["Other devices"]
  C2 --> MS`,
      note: "Metadata (small, queryable) is split from chunk bytes (large, in object storage) — the core design move.",
    },
    decisions: [
      { component: "Metadata vs bytes", choice: "Separate metadata DB and chunk/object store", why: "Metadata needs queries and consistency; bytes need cheap durable bulk storage." },
      { component: "Chunking + dedup", choice: "Content-defined chunks hashed by content", why: "Only upload chunks that changed; identical chunks are stored once." },
      { component: "Sync", choice: "Notification + delta sync", why: "Push changes to other devices and transfer only modified chunks." },
      { component: "Versioning", choice: "Immutable chunks + version pointers", why: "History and conflict recovery come for free when chunks are immutable." },
      { component: "Conflicts", choice: "Keep both versions, flag conflict", why: "Two offline edits should never silently lose data." },
    ],
    flow: {
      title: "Edit and sync a file",
      src: `sequenceDiagram
  participant A as Device A
  participant M as Metadata Svc
  participant CS as Chunk Svc
  participant N as Notifier
  participant B as Device B
  A->>A: detect change, chunk + hash
  A->>M: which chunks are new?
  M-->>A: upload chunks [c3]
  A->>CS: put chunk c3
  A->>M: commit new version
  M->>N: file changed
  N-->>B: pull update
  B->>CS: fetch only c3`,
      note: "Only the changed chunk (c3) crosses the network; everything else is already present.",
    },
    deepDives: [
      { title: "Chunking and deduplication", body: "Files are split into chunks and each chunk is hashed. The client asks the metadata service which hashes are new and uploads only those. Because identical content yields identical hashes, duplicate chunks (across versions or even users) are stored once — saving huge bandwidth and storage." },
      { title: "Metadata vs blob split", body: "File/folder structure, chunk lists, and versions live in a queryable metadata database; the actual bytes live in object storage. This lets metadata operations (list, move, share) stay fast and consistent while bytes scale cheaply and durably." },
      { title: "Sync and conflict resolution", body: "A notification channel tells other devices a file changed; they pull only the delta. If two devices edited the same file offline, the system keeps both versions and surfaces a conflicted copy rather than overwriting — data safety beats convenience." },
    ],
    tradeoffs: [
      "Smaller chunks dedupe better but add metadata overhead; tune chunk size to workload.",
      "Keeping full version history improves recovery but increases storage cost.",
    ],
  },

  /* ------------------------------------------------ 10. Typeahead */
  {
    id: "d-typeahead",
    num: "10",
    icon: "⌨️",
    title: "Search Autocomplete / Typeahead",
    tagline: "Suggest the top completions as the user types, ranked by popularity, within a few milliseconds.",
    interview: [
      "Scope: prefix suggestions ranked by popularity; clarify latency target and personalization.",
      "Serve from an in-memory trie that stores the top-k completions at each prefix node.",
      "Build/update the trie offline from query logs via a streaming aggregation pipeline.",
      "Cache hot prefixes; shard the trie by prefix for scale; debounce on the client.",
      "Tradeoffs: freshness vs rebuild cost; exact top-k vs approximate.",
    ],
    functional: [
      "Return top suggestions for a prefix",
      "Rank by popularity / frequency",
      "Update as trends change",
    ],
    nonFunctional: [
      "Extremely low latency (<100ms)",
      "Handle very high query volume",
      "Scale to a huge vocabulary",
    ],
    scale: [
      "Tens of thousands of queries/sec",
      "Billions of historical search terms",
      "Top-k (e.g. 5–10) per prefix",
    ],
    architecture: {
      src: `flowchart TB
  U["Client (debounced)"] --> API["Suggest API"]
  API --> CACHE["Prefix cache (Redis)"]
  CACHE -->|miss| TRIE["Trie Service (in-memory)<br/>top-k per node"]
  subgraph Offline build
    LOG["Query logs"] --> K[["Kafka"]]
    K --> AGG["Aggregator (counts)"]
    AGG --> BUILD["Trie builder"]
    BUILD --> TRIE
  end`,
      note: "Reads hit an in-memory trie precomputed with top-k results; the trie is rebuilt offline from query logs.",
    },
    decisions: [
      { component: "Data structure", choice: "Trie with top-k stored at each node", why: "Walking to the prefix node yields suggestions in O(prefix length)." },
      { component: "Ranking", choice: "Popularity from aggregated query counts", why: "Surfaces what people actually search; updated from logs." },
      { component: "Updates", choice: "Offline batch/stream rebuild", why: "Building tries on the read path is too slow; precompute and swap." },
      { component: "Serving", choice: "In-memory + Redis cache, sharded by prefix", why: "Memory speed for latency; sharding for vocabulary scale." },
      { component: "Client", choice: "Debounce + cancel stale requests", why: "Avoid a request per keystroke and out-of-order results." },
    ],
    flow: {
      title: "Type a prefix",
      src: `sequenceDiagram
  participant U as User
  participant A as Suggest API
  participant C as Redis
  participant T as Trie
  U->>A: prefix "rea"
  A->>C: cached top-k?
  alt hit
    C-->>A: [react, real estate, reasons]
  else miss
    A->>T: walk to node "rea"
    T-->>A: top-k completions
    A->>C: cache it
  end
  A-->>U: suggestions`,
      note: "Each prefix node already holds its precomputed top-k, so serving is a quick lookup.",
    },
    deepDives: [
      { title: "Trie with precomputed top-k", body: "A naive trie would gather and sort all descendant words per request. Instead, store the top-k most popular completions directly on each prefix node during the offline build. A lookup then walks to the node and returns its list immediately — ideal for sub-100ms latency." },
      { title: "Updating popularity", body: "Stream query logs through Kafka into an aggregator that maintains term frequencies (often over a recent time window so trends surface). A builder periodically regenerates the trie (or updates counts) and the serving layer swaps to the new version atomically." },
      { title: "Scaling and freshness", body: "Shard the trie by first letters/prefix ranges so no single node holds everything, and cache hot prefixes in Redis. There's a tradeoff between freshness (rebuild often) and cost (rebuilds are heavy); most systems accept minutes-to-hours-old popularity." },
    ],
    tradeoffs: [
      "Precomputed top-k is fast but slightly stale between rebuilds.",
      "Personalization improves relevance but breaks the shared-cache advantage.",
    ],
  },

  /* ------------------------------------------------ 11. Payment System */
  {
    id: "d-payment",
    num: "11",
    icon: "💳",
    title: "Payment System",
    tagline: "Process payments correctly exactly once, with strong consistency, idempotency and an auditable ledger.",
    interview: [
      "Lead with correctness: money must be exactly-once, consistent and fully auditable.",
      "Use an idempotency key on every charge so retries never double-charge.",
      "Model balances as an append-only double-entry ledger; never mutate amounts in place.",
      "Integrate the external PSP asynchronously and reconcile via webhooks + a recon job.",
      "Tradeoffs: strong consistency over availability; sync authorization vs async capture.",
    ],
    functional: [
      "Charge a customer / authorize + capture",
      "Refunds and payouts",
      "Idempotent retries",
      "Auditable transaction ledger",
    ],
    nonFunctional: [
      "Exactly-once, no double charges",
      "Strong consistency and durability",
      "Full auditability / compliance",
    ],
    scale: [
      "Correctness matters more than raw QPS",
      "External payment providers are the slow dependency",
      "Every state change must be recorded",
    ],
    architecture: {
      src: `flowchart TB
  C["Client"] --> API["Payment API"]
  API --> IDEM["Idempotency store"]
  API --> PS["Payment Service"]
  PS --> LED[("Ledger DB (ACID, double-entry)")]
  PS --> PSP["External PSP (Stripe/bank)"]
  PSP -.webhook.-> WH["Webhook handler"]
  WH --> PS
  PS -.events.-> Q[["Queue"]]
  Q --> RECON["Reconciliation job"]
  RECON --> LED`,
      note: "An idempotency key guards the entry point; a double-entry ledger is the immutable source of truth.",
    },
    decisions: [
      { component: "Correctness", choice: "Idempotency key per payment", why: "Network retries and client refreshes must never charge twice." },
      { component: "Source of truth", choice: "Double-entry, append-only ledger", why: "Auditable, reconstructable, and impossible to silently corrupt." },
      { component: "Consistency", choice: "ACID database (strong consistency)", why: "Money favors correctness over availability." },
      { component: "External provider", choice: "Async capture + webhooks + reconciliation", why: "PSPs are slow and can fail; reconcile state rather than trust one call." },
      { component: "State", choice: "Explicit payment state machine", why: "authorized → captured → settled / refunded must be tracked precisely." },
    ],
    flow: {
      title: "Charge with idempotency",
      src: `sequenceDiagram
  participant C as Client
  participant A as Payment API
  participant I as Idempotency
  participant P as PSP
  participant L as Ledger
  C->>A: charge (key=pay_123)
  A->>I: seen key?
  alt first time
    I-->>A: no
    A->>P: authorize + capture
    P-->>A: success
    A->>L: record debit/credit entries
    A->>I: store key + result
  else retry
    I-->>A: yes → return prior result
  end
  A-->>C: result`,
      note: "A retried request with the same key returns the original result instead of charging again.",
    },
    deepDives: [
      { title: "Idempotency and exactly-once", body: "Each payment carries a client-generated idempotency key. The service checks a key store before acting; if the key exists it returns the stored result. This turns an at-least-once network into exactly-once semantics — the single most important property of a payment system." },
      { title: "Double-entry ledger", body: "Rather than mutating a balance field, record immutable debit and credit entries for every movement. Balances are derived by summing entries. This is auditable, supports reconciliation, and makes corruption detectable — the same model banks use." },
      { title: "External providers and reconciliation", body: "Real charges go through an external PSP that can be slow or return ambiguous results. Capture asynchronously, treat provider webhooks as the confirmation, and run a reconciliation job that compares your ledger with the provider's records to catch and repair mismatches." },
    ],
    tradeoffs: [
      "Strong consistency sacrifices some availability — acceptable and required for money.",
      "Async capture adds complexity but is necessary because the PSP is an unreliable dependency.",
    ],
  },

  /* ------------------------------------------------ 12. Web Crawler */
  {
    id: "d-crawler",
    num: "12",
    icon: "🕷️",
    title: "Distributed Web Crawler",
    tagline: "Crawl billions of pages politely and efficiently, avoiding duplicates and respecting site limits.",
    interview: [
      "Scope: crawl billions of pages, extract links, store content; clarify freshness and politeness.",
      "Use a URL frontier (priority + politeness queues) feeding a pool of fetcher workers.",
      "Deduplicate URLs and content with a seen-set (Bloom filter) and content hashes.",
      "Respect robots.txt and per-domain rate limits; store pages in object storage.",
      "Tradeoffs: freshness vs politeness; coverage vs trap avoidance.",
    ],
    functional: [
      "Fetch pages from seed URLs",
      "Extract and enqueue new links",
      "Store page content",
      "Re-crawl for freshness",
    ],
    nonFunctional: [
      "Massive scale (billions of pages)",
      "Politeness — don't hammer sites",
      "Avoid duplicate work and crawler traps",
    ],
    scale: [
      "Billions of URLs in the frontier",
      "Thousands of concurrent fetches",
      "Petabytes of stored content",
    ],
    architecture: {
      src: `flowchart TB
  SEED["Seed URLs"] --> FR["URL Frontier<br/>priority + politeness queues"]
  FR --> FETCH["Fetcher workers"]
  FETCH -->|robots.txt ok| DL["Downloader"]
  DL --> PARSE["Parser / link extractor"]
  PARSE --> SEEN{"Seen before?<br/>Bloom filter + hash"}
  SEEN -->|new| FR
  SEEN -->|dup| DROP["Drop"]
  DL --> STORE["Content store (S3)"]
  PARSE --> IDX["Indexing pipeline"]`,
      note: "The frontier balances priority (what to crawl next) with politeness (per-domain rate limits).",
    },
    decisions: [
      { component: "Frontier", choice: "Priority + per-domain politeness queues", why: "Crawl important pages first without overloading any single site." },
      { component: "Dedup", choice: "Bloom filter for URLs + content hashing", why: "Cheaply skip already-seen URLs and identical page content at huge scale." },
      { component: "Politeness", choice: "robots.txt + per-domain rate limit", why: "Respect site rules and avoid being blocked or causing harm." },
      { component: "Storage", choice: "Object storage for raw pages", why: "Pages are large immutable blobs — cheap and durable." },
      { component: "Traps", choice: "Depth/URL limits + pattern detection", why: "Avoid infinite calendars and dynamically generated link mazes." },
    ],
    flow: {
      title: "Crawl one URL",
      src: `sequenceDiagram
  participant FR as Frontier
  participant W as Fetcher
  participant R as robots cache
  participant P as Parser
  participant B as Seen-set
  FR->>W: next URL (domain ok)
  W->>R: allowed by robots?
  R-->>W: yes
  W->>W: download page
  W->>P: extract links
  P->>B: each link seen?
  B-->>P: new ones
  P->>FR: enqueue new URLs`,
      note: "Only previously-unseen URLs are enqueued, preventing the frontier from exploding with duplicates.",
    },
    deepDives: [
      { title: "URL frontier", body: "The frontier decides what to crawl next. It combines priority queues (rank by importance/freshness) with politeness queues (one queue per domain with a rate limit) so a popular site is crawled steadily without being flooded. This balance is the heart of a good crawler." },
      { title: "Deduplication at scale", body: "With billions of URLs, an exact seen-set won't fit cheaply in memory. A Bloom filter answers 'have we seen this URL?' in constant space with a small false-positive rate. Content hashing additionally detects pages with identical bodies under different URLs, avoiding redundant storage and indexing." },
      { title: "Politeness and traps", body: "Honor robots.txt (cached per domain) and cap request rate per host. Guard against crawler traps — infinite calendar links or session-id URLs — with depth limits, URL-length/pattern checks, and per-domain page caps, so the crawler doesn't get stuck." },
    ],
    tradeoffs: [
      "Higher politeness (slower per-domain) reduces throughput but avoids bans.",
      "Bloom filters save memory at the cost of rare false positives (a few pages skipped).",
    ],
  },
];

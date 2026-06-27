/* =====================================================================
   DATA — the entire HLD course as structured content + Mermaid diagrams.
   Each section has a category color (cat) and a list of topics.
   Topic types:
     - "card"  : full concept with problem/how/used/tradeoff/examples/diagram
     - "note"  : compact definition card (meaning/purpose + kv)
   Diagrams are Mermaid source strings.
   ===================================================================== */
window.HLD_DATA = [
  /* ============================================================= 1 */
  {
    id: "big-picture",
    num: "01",
    cat: "--c-network",
    title: "The Big Picture",
    intro:
      "Almost every large system is assembled from a handful of recurring layers. Learn the map first — then every component below simply slots into one of these layers.",
    topics: [
      {
        type: "card",
        id: "layered-architecture",
        title: "The 10 Layers of a Large System",
        chip: "mental model",
        tagline:
          "From the user's device down to durable storage, traffic flows through predictable tiers. Name the layer, then pick the component.",
        problem:
          "Designs feel chaotic when you jump straight to technologies. A layered model gives you a stable skeleton to hang choices on.",
        how:
          "Each layer has one job and hands off to the next: route, protect, execute, accelerate, persist, and process asynchronously.",
        used: [
          "Structuring any whiteboard system design",
          "Deciding where a new requirement belongs",
          "Spotting missing concerns (security? caching? async?)",
        ],
        tradeoff:
          "More layers add latency and operational surface. Only introduce a layer when a real concern justifies it.",
        examples: ["E-commerce", "Social feed", "Streaming", "Ride-hailing"],
        diagram: `flowchart TB
  C["Client layer<br/>web · mobile · IoT"] --> N["Network & traffic routing<br/>DNS · Global LB"]
  N --> E["Edge & delivery<br/>CDN · Edge compute · WAF"]
  E --> A["API & application entry<br/>API Gateway · BFF"]
  A --> S["Compute & service execution<br/>services · containers · functions"]
  S --> K["Caching layer<br/>Redis · Memcached · CDN"]
  S --> D["Data storage<br/>SQL · NoSQL · Object · Search"]
  S --> M["Messaging & async<br/>Queues · Pub/Sub · Streams"]
  X["Security & access control"] -.guards.-> A
  R["Reliability & operations"] -.observes.-> S`,
        note:
          "Teaching tip: draw these 10 boxes once, then reuse the same skeleton for every problem in the course.",
      },
      {
        type: "card",
        id: "request-path",
        title: "The Life of a Request",
        chip: "end-to-end flow",
        tagline:
          "Follow a single click from the browser all the way to the database and back — the canonical happy path.",
        problem:
          "Interviewers love asking 'what happens when a user hits enter?'. A crisp request path proves you understand the whole stack.",
        how:
          "DNS resolves, the edge caches or forwards, load balancers pick a region and a node, the gateway authenticates, the service runs logic, cache is checked, storage is read, and async work is queued.",
        used: [
          "Explaining latency budgets",
          "Locating where to add caching or auth",
          "Reasoning about failure points",
        ],
        tradeoff:
          "Every hop is a place to add value and a place to add latency or failure. Keep the critical path short.",
        examples: ["Page load", "API call", "Checkout", "Search query"],
        diagram: `sequenceDiagram
  participant U as Client
  participant DNS as DNS
  participant CDN as CDN / Edge
  participant GLB as Global LB
  participant RLB as Regional LB
  participant GW as API Gateway + Auth
  participant SVC as Service
  participant CA as Cache
  participant DB as Database
  participant Q as Queue
  U->>DNS: resolve api.example.com
  DNS-->>U: IP / Anycast address
  U->>CDN: HTTPS request
  CDN->>GLB: cache miss → forward
  GLB->>RLB: pick nearest healthy region
  RLB->>GW: route to backend
  GW->>SVC: validated request
  SVC->>CA: read hot data?
  CA-->>SVC: hit / miss
  SVC->>DB: read / write on miss
  SVC-)Q: enqueue background work
  SVC-->>U: response`,
        note:
          "The dashed async arrow (-)) means 'fire and forget' — the user does not wait for background work.",
      },
    ],
  },

  /* ============================================================= 2 */
  {
    id: "traffic-network",
    num: "02",
    cat: "--c-network",
    title: "Traffic, Network & Delivery",
    intro:
      "Before a request ever reaches your code, it is resolved, routed, cached, and filtered. These components decide which region, which node, and whether the traffic is even allowed in.",
    topics: [
      {
        type: "card",
        id: "dns",
        title: "DNS",
        chip: "resolution",
        tagline: "Translate human domain names into machine IP addresses and steer users to the right entry point.",
        problem: "Humans use names; networks use IPs. Something must map one to the other at internet scale.",
        how: "The client asks a recursive resolver, which queries authoritative name servers; the answer is an IP or alias (CNAME) record, cached for the TTL.",
        used: ["Service discovery at internet scale", "Geo-routing & failover", "Coarse-grained load balancing"],
        tradeoff: "Changes are not instant — caching and TTLs mean propagation takes time.",
        examples: ["AWS Route 53", "Cloudflare DNS", "Google Cloud DNS"],
        diagram: `flowchart LR
  U["Client"] --> R["Recursive resolver"]
  R --> Root["Root servers"]
  R --> TLD["TLD servers (.com)"]
  R --> Auth["Authoritative NS"]
  Auth -- "A / CNAME record" --> R
  R -- "IP (cached for TTL)" --> U`,
        note: "Low TTL = faster failover but more DNS queries. High TTL = fewer queries but slower changes.",
      },
      {
        type: "card",
        id: "cdn",
        title: "CDN",
        chip: "edge cache",
        tagline: "Serve static and cacheable content from locations physically close to users.",
        problem: "Fetching every image or script from a single origin is slow for distant users and overloads the origin.",
        how: "Assets are replicated to edge POPs; nearby requests are served from cache, misses fall back to the origin and are then cached.",
        used: ["Images", "Videos", "JS / CSS", "Public cacheable GET APIs"],
        tradeoff: "Cache invalidation and personalized content are harder.",
        examples: ["CloudFront", "Cloudflare CDN", "Akamai"],
        diagram: `flowchart TB
  subgraph Users
    U1["User · Tokyo"]
    U2["User · Berlin"]
  end
  U1 --> P1["Edge POP · Tokyo"]
  U2 --> P2["Edge POP · Frankfurt"]
  P1 -- "hit" --> U1
  P2 -- "miss" --> O["Origin server"]
  O -- "fill cache" --> P2 --> U2`,
        note: "Version asset URLs (app.v7.js) so a deploy predictably busts the cache.",
      },
      {
        type: "card",
        id: "edge-compute",
        title: "Edge Servers / Edge Compute",
        chip: "compute @ POP",
        tagline: "Run lightweight logic near the user, before traffic reaches core services.",
        problem: "Round-tripping simple decisions (redirects, A/B, bot checks) to a central region wastes latency.",
        how: "Small functions run at edge POPs and can inspect headers, cookies, path, geo, and auth hints before forwarding.",
        used: ["Redirects", "A/B testing", "Bot blocking", "Header rewrites", "Lightweight auth"],
        tradeoff: "Not suited to deep stateful logic or heavy compute.",
        examples: ["Cloudflare Workers", "Lambda@Edge", "Fastly Compute"],
        diagram: `flowchart LR
  U["Client"] --> EDGE["Edge function<br/>geo · cookies · bot score"]
  EDGE -- "block bot" --> X["403"]
  EDGE -- "A/B variant" --> O["Origin / core service"]
  EDGE -- "redirect" --> U`,
        note: "Think of the edge as a programmable bouncer: quick decisions, no heavy lifting.",
      },
      {
        type: "card",
        id: "reverse-proxy",
        title: "Reverse Proxy",
        chip: "front door",
        tagline: "Accept client traffic and forward it to the right backend service.",
        problem: "Exposing backends directly is insecure and hard to manage centrally.",
        how: "Sits in front of services; can terminate TLS, compress, rewrite headers, and cache.",
        used: ["Central traffic management", "Security filtering", "Service isolation"],
        tradeoff: "Another hop and another component to operate.",
        examples: ["NGINX", "HAProxy", "Envoy"],
        diagram: `flowchart LR
  C["Clients"] --> RP["Reverse proxy<br/>TLS · compress · route"]
  RP --> S1["Service A"]
  RP --> S2["Service B"]
  RP --> S3["Static assets"]`,
        note: "A load balancer is a specialized reverse proxy focused on distribution + health.",
      },
      {
        type: "card",
        id: "global-lb",
        title: "Global Load Balancer",
        chip: "cross-region",
        tagline: "Route traffic across regions for availability and low latency.",
        problem: "A single region can fail or be far from users; you need to pick the best region per request.",
        how: "Uses geo-routing, latency routing, Anycast, or health-based routing to send users to the nearest healthy region.",
        used: ["Multi-region HA", "Disaster recovery", "Low-latency global products"],
        tradeoff: "Requires a careful multi-region data strategy.",
        examples: ["AWS Global Accelerator", "Cloudflare Load Balancing", "Google Cloud LB"],
        diagram: `flowchart TB
  U["Global users"] --> GLB{"Global LB<br/>latency + health"}
  GLB -->|nearest healthy| R1["Region: US-East"]
  GLB -->|failover| R2["Region: EU-West"]
  GLB -->|failover| R3["Region: AP-South"]`,
        note: "Global LB picks the region; regional LB picks the node inside it.",
      },
      {
        type: "card",
        id: "regional-lb",
        title: "Regional Load Balancer",
        chip: "within region",
        tagline: "Distribute traffic among instances inside a single region.",
        problem: "Many identical instances exist; traffic must spread evenly and avoid unhealthy ones.",
        how: "Routes via round robin, least connections, or weighted balancing and removes unhealthy nodes via health checks.",
        used: ["Horizontal scaling", "High availability"],
        tradeoff: "Sticky sessions reduce flexibility.",
        examples: ["AWS ALB", "AWS NLB", "GCP Regional LB"],
        diagram: `flowchart TB
  GLB["From Global LB"] --> RLB{"Regional LB"}
  RLB -->|healthy| N1["Instance 1"]
  RLB -->|healthy| N2["Instance 2"]
  RLB -.->|unhealthy| N3["Instance 3"]
  N1 -. health check .-> RLB
  N3 -. fails probe .-> RLB`,
        note: "Health checks are what make a load balancer 'self-healing'.",
      },
      {
        type: "card",
        id: "anycast",
        title: "Anycast",
        chip: "routing",
        tagline: "Many locations announce the same IP; the network delivers users to the closest one.",
        problem: "You want one stable IP that automatically routes each user to the nearest site.",
        how: "Multiple sites advertise the same IP prefix; internet routing (BGP) picks the shortest path.",
        used: ["Edge services", "DNS providers", "Global acceleration"],
        tradeoff: "Operationally more advanced than simple DNS routing.",
        examples: ["Cloudflare Anycast", "AWS Global Accelerator", "Google Public DNS"],
        diagram: `flowchart TB
  IP["Anycast IP 1.1.1.1"]
  IP --- L1["POP · London"]
  IP --- L2["POP · Singapore"]
  IP --- L3["POP · Virginia"]
  UA["User · UK"] --> L1
  UB["User · SG"] --> L2`,
        note: "Same IP everywhere — the routing fabric does the 'pick nearest' for you.",
      },
      {
        type: "card",
        id: "waf",
        title: "WAF — Web Application Firewall",
        chip: "security filter",
        tagline: "Protect applications from common web attacks before they reach your code.",
        problem: "Malicious requests (injection, XSS, bots) must be filtered at the edge, not in business logic.",
        how: "Inspects HTTP requests for malicious patterns and can block, challenge, or rate-limit them.",
        used: ["SQL injection protection", "XSS protection", "Bot mitigation"],
        tradeoff: "Aggressive rules can block legitimate traffic (false positives).",
        examples: ["AWS WAF", "Cloudflare WAF", "Imperva WAF"],
        diagram: `flowchart LR
  U["Traffic"] --> WAF{"WAF rules"}
  WAF -- "SQLi / XSS" --> B["Block"]
  WAF -- "suspicious" --> CH["Challenge / CAPTCHA"]
  WAF -- "clean" --> APP["Application"]`,
        note: "Tune in 'count' mode first to measure false positives before enforcing.",
      },
    ],
  },

  /* ============================================================= 3 */
  {
    id: "api-entry",
    num: "03",
    cat: "--c-api",
    title: "API & Application Entry",
    intro:
      "Once traffic is inside, these components form the front door to your application: routing, authentication, client tailoring, and service-to-service communication.",
    topics: [
      {
        type: "card",
        id: "api-gateway",
        title: "API Gateway",
        chip: "front door",
        tagline: "A single entry point for all APIs that handles cross-cutting concerns.",
        problem: "Without a gateway, every service re-implements auth, throttling, and logging.",
        how: "Receives client requests, routes to backends, and handles auth, throttling, validation, transformation, and logging.",
        used: ["Microservices", "Public APIs", "Mobile backends"],
        tradeoff: "Can become a central bottleneck if overloaded with logic.",
        examples: ["AWS API Gateway", "Kong", "Apigee"],
        diagram: `flowchart TB
  C["Clients"] --> GW["API Gateway<br/>auth · throttle · validate · log"]
  GW --> S1["Orders service"]
  GW --> S2["Payments service"]
  GW --> S3["Catalog service"]`,
        note: "Keep the gateway thin — routing and policy, not business logic.",
      },
      {
        type: "card",
        id: "bff",
        title: "Backend for Frontend (BFF)",
        chip: "per-client",
        tagline: "A backend layer tailored to one client type so each frontend gets exactly what it needs.",
        problem: "A single generic API forces web and mobile clients to over-fetch or stitch many calls.",
        how: "A separate backend serves web, mobile, or partner clients, aggregating and shaping data per client.",
        used: ["Reducing over-fetching", "Client-specific aggregation"],
        tradeoff: "More services to build and maintain.",
        examples: ["Web BFF + mobile BFF (Netflix-style)", "GraphQL gateway as aggregation layer"],
        diagram: `flowchart TB
  W["Web app"] --> BW["Web BFF"]
  M["Mobile app"] --> BM["Mobile BFF"]
  BW --> S1["Service A"]
  BW --> S2["Service B"]
  BM --> S1
  BM --> S3["Service C"]`,
        note: "BFF trades a little duplication for much simpler, faster clients.",
      },
      {
        type: "card",
        id: "service-mesh",
        title: "Service Mesh",
        chip: "svc-to-svc",
        tagline: "Manage communication between services with sidecar proxies, not in app code.",
        problem: "Retries, mTLS, routing, and telemetry get reimplemented inconsistently in every service.",
        how: "Sidecar proxies next to each service handle retries, mTLS, routing, telemetry, and policy.",
        used: ["Large microservice environments"],
        tradeoff: "Adds operational complexity and latency overhead.",
        examples: ["Istio", "Linkerd", "Consul Connect"],
        diagram: `flowchart LR
  subgraph A["Service A pod"]
    SA["App A"] --- PA["Sidecar proxy"]
  end
  subgraph B["Service B pod"]
    SB["App B"] --- PB["Sidecar proxy"]
  end
  PA -- "mTLS · retry · trace" --> PB
  CP["Control plane"] -. config .-> PA
  CP -. config .-> PB`,
        note: "The mesh moves networking concerns out of code and into the platform.",
      },
      {
        type: "card",
        id: "websocket-gateway",
        title: "WebSocket Gateway",
        chip: "realtime",
        tagline: "Support long-lived, bidirectional connections for push-based features.",
        problem: "Request-response polling is wasteful for chat, live dashboards, and notifications.",
        how: "Keeps a persistent connection open and pushes updates to clients without polling.",
        used: ["Chat", "Live dashboards", "Realtime notifications"],
        tradeoff: "Connection management and fan-out are harder than request-response.",
        examples: ["API Gateway WebSocket APIs", "Socket.IO gateway", "NGINX / Envoy WS upgrade"],
        diagram: `sequenceDiagram
  participant C as Client
  participant G as WS Gateway
  participant S as Service
  C->>G: HTTP Upgrade → WebSocket
  G-->>C: 101 Switching Protocols
  S-)G: new event (push)
  G-)C: deliver instantly
  C->>G: send message
  G->>S: forward`,
        note: "Scale fan-out with a pub/sub backend so any gateway node can reach any client.",
      },
    ],
  },

  /* ============================================================= 4 */
  {
    id: "compute",
    num: "04",
    cat: "--c-compute",
    title: "Compute & Execution Models",
    intro:
      "Where and how your code actually runs. The choice shapes team structure, deployment speed, scaling, and operational cost.",
    topics: [
      {
        type: "card",
        id: "monolith",
        title: "Monolith",
        chip: "single unit",
        tagline: "One deployable unit containing many business capabilities.",
        problem: "Early products need to move fast without distributed-systems overhead.",
        how: "One codebase / one deployment runs multiple modules in a single process.",
        used: ["Smaller teams", "Early-stage products"],
        tradeoff: "Easy to start, harder to scale teams and components independently later.",
        examples: ["Rails monolith", "Spring Boot monolith", "Django monolith"],
        diagram: `flowchart TB
  LB["Load balancer"] --> APP["Monolith process"]
  subgraph APP
    A["Auth module"]
    O["Orders module"]
    P["Payments module"]
    C["Catalog module"]
  end
  APP --> DB[("Shared database")]`,
        note: "Start monolith-first; split out services only when a boundary genuinely hurts.",
      },
      {
        type: "card",
        id: "microservices",
        title: "Microservices",
        chip: "distributed",
        tagline: "Split capabilities into independently deployable services with bounded contexts.",
        problem: "Large teams block each other in one codebase and need independent scaling.",
        how: "Each service owns a bounded context and its data, talking over APIs or events.",
        used: ["Large teams", "Independent scaling & releases"],
        tradeoff: "Distributed-systems complexity rises sharply.",
        examples: ["Uber decomposition", "Netflix microservices", "Amazon SOA"],
        diagram: `flowchart TB
  GW["API Gateway"] --> US["User svc"]
  GW --> OS["Order svc"]
  GW --> PS["Payment svc"]
  US --> UD[("User DB")]
  OS --> OD[("Order DB")]
  PS --> PD[("Payment DB")]
  OS -. events .-> PS`,
        note: "Database-per-service is what makes services truly independent.",
      },
      {
        type: "card",
        id: "containers",
        title: "Containers",
        chip: "packaging",
        tagline: "Package an app with its dependencies into a portable, isolated unit.",
        problem: "'Works on my machine' — environments drift between dev and prod.",
        how: "A process runs in an isolated environment built from an immutable image.",
        used: ["Consistent deployment", "Faster scaling"],
        tradeoff: "Still need orchestration and observability around them.",
        examples: ["Docker", "containerd", "Podman"],
        diagram: `flowchart LR
  IMG["Image<br/>app + deps + config"] --> C1["Container 1"]
  IMG --> C2["Container 2"]
  IMG --> C3["Container 3"]
  C1 & C2 & C3 --> HOST["Shared host OS kernel"]`,
        note: "Containers share the host kernel — lighter than VMs, weaker isolation.",
      },
      {
        type: "card",
        id: "vms",
        title: "Virtual Machines",
        chip: "isolation",
        tagline: "Run isolated guest operating systems on virtualized hardware.",
        problem: "Some workloads need strong isolation or a full OS, not just a process.",
        how: "A hypervisor virtualizes hardware so each VM runs its own kernel and OS.",
        used: ["Stronger isolation", "Legacy workloads"],
        tradeoff: "Heavier (boot time, memory) than containers.",
        examples: ["EC2", "Google Compute Engine", "Azure VMs"],
        diagram: `flowchart TB
  HW["Physical hardware"] --> HV["Hypervisor"]
  HV --> V1["VM · Guest OS A"]
  HV --> V2["VM · Guest OS B"]
  V1 --> A1["App"]
  V2 --> A2["App"]`,
        note: "VM = full OS per workload; container = shared OS, isolated process.",
      },
      {
        type: "card",
        id: "serverless",
        title: "Serverless / Functions",
        chip: "event-driven",
        tagline: "Run code on demand without managing servers; pay per execution.",
        problem: "Spiky or infrequent workloads waste money on always-on servers.",
        how: "The provider runs your function in response to events or HTTP requests, scaling to zero.",
        used: ["Spiky workloads", "Event-driven flows", "Lightweight APIs"],
        tradeoff: "Cold starts and runtime limits.",
        examples: ["AWS Lambda", "Google Cloud Functions", "Azure Functions"],
        diagram: `flowchart LR
  EV["Event<br/>HTTP · queue · schedule"] --> FN{"Function platform"}
  FN --> I1["Instance (warm)"]
  FN -. cold start .-> I2["New instance"]
  I1 --> R["Result"]
  I2 --> R`,
        note: "Great for glue and bursts; watch cold starts on latency-critical paths.",
      },
      {
        type: "card",
        id: "orchestrators",
        title: "Orchestrators",
        chip: "scheduling",
        tagline: "Schedule, heal, scale, and roll out containerized workloads automatically.",
        problem: "Running many containers by hand — placement, restarts, scaling — is unmanageable.",
        how: "The system places workloads on nodes, restarts failures, scales replicas, and does rolling deploys.",
        used: ["Containerized platforms"],
        tradeoff: "Powerful but operationally heavy.",
        examples: ["Kubernetes", "Amazon ECS", "Nomad"],
        diagram: `flowchart TB
  CP["Control plane<br/>scheduler · API"] --> N1["Node 1"]
  CP --> N2["Node 2"]
  N1 --> P1["Pod"]
  N1 --> P2["Pod"]
  N2 --> P3["Pod"]
  P2 -. crash .-> CP
  CP -. reschedule .-> N2`,
        note: "Declarative desired-state: you say '5 replicas', the orchestrator keeps it true.",
      },
    ],
  },

  /* ============================================================= 5 */
  {
    id: "caching",
    num: "05",
    cat: "--c-cache",
    title: "Caching & Fast-Access Layers",
    intro:
      "Caches trade a little freshness for a lot of speed, shielding expensive backends from repetitive reads. Master the patterns and the invalidation tradeoffs.",
    topics: [
      {
        type: "card",
        id: "cache",
        title: "Cache (patterns)",
        chip: "speed layer",
        tagline: "Keep frequently requested data in fast storage to cut latency and offload backends.",
        problem: "Recomputing or re-reading the same data on every request is slow and expensive.",
        how: "Store hot data in memory/fast storage. Patterns: cache-aside, read-through, write-through, write-back.",
        used: ["Product detail pages", "Session reads", "Aggregated views"],
        tradeoff: "Staleness and invalidation complexity.",
        examples: ["In-process cache", "Redis cluster", "CDN cache for GET APIs"],
        diagram: `flowchart LR
  APP["App"] -->|1 read| CA{"Cache"}
  CA -->|hit| APP
  CA -->|miss| DB[("Database")]
  DB -->|2 fill| CA
  CA -->|3 return| APP`,
        note: "The hardest problem in caching is invalidation — decide TTL + write strategy up front.",
      },
      {
        type: "card",
        id: "redis",
        title: "Redis",
        chip: "in-memory",
        tagline: "A blazing-fast in-memory store for hot data and rich data structures.",
        problem: "You need sub-millisecond access plus counters, queues, locks, and leaderboards.",
        how: "Stores data in memory (optional persistence) with TTLs, counters, sorted sets, streams, and locks.",
        used: ["Cache", "Session store", "Rate limiting", "Leaderboards", "Distributed locks"],
        tradeoff: "Memory is expensive compared to disk.",
        examples: ["Redis OSS", "ElastiCache for Redis", "Redis Enterprise"],
        diagram: `flowchart TB
  APP["App"] --> R["Redis"]
  R --> K1["string / counter"]
  R --> K2["hash / session"]
  R --> K3["sorted set / leaderboard"]
  R --> K4["stream / queue"]
  R -. AOF / RDB .-> DISK[("Disk (optional)")]`,
        note: "Redis is a Swiss-army knife — but it is still memory-bound; size your working set.",
      },
      {
        type: "card",
        id: "memcached",
        title: "Memcached",
        chip: "simple cache",
        tagline: "A simple, distributed, memory-only key-value cache.",
        problem: "Sometimes you just need a plain, fast, horizontally-scalable cache with no extras.",
        how: "Stores key-value items in memory only, sharded across nodes by key.",
        used: ["Stateless cache layer"],
        tradeoff: "Simpler than Redis but far fewer features (no persistence, no rich types).",
        examples: ["Memcached", "ElastiCache for Memcached"],
        diagram: `flowchart LR
  APP["App"] -->|hash by key| C1["Node A"]
  APP -->|hash by key| C2["Node B"]
  APP -->|hash by key| C3["Node C"]`,
        note: "Choose Memcached for pure, simple caching; Redis when you need data structures.",
      },
      {
        type: "card",
        id: "bloom-filter",
        title: "Bloom Filter",
        chip: "probabilistic",
        tagline: "Quickly test whether an item is *probably present* or *definitely absent*.",
        problem: "Expensive DB or disk lookups for items that usually do not exist waste resources.",
        how: "A bitset with multiple hash functions; 'definitely not present' is exact, 'present' may be a false positive.",
        used: ["Avoiding expensive DB lookups", "Spam / fraud pre-checks"],
        tradeoff: "False positives are possible; you cannot delete easily (basic version).",
        examples: ["RedisBloom", "Cassandra SSTable filters", "Pre-DB existence checks"],
        diagram: `flowchart LR
  Q["Lookup key"] --> BF{"Bloom filter"}
  BF -->|all bits set?| MAYBE["Maybe present → check DB"]
  BF -->|any bit 0| NO["Definitely absent → skip DB"]
  MAYBE --> DB[("Database")]`,
        note: "Great gatekeeper: turns most 'does it exist?' misses into a cheap in-memory 'no'.",
      },
      {
        type: "card",
        id: "distributed-lock",
        title: "Distributed Lock",
        chip: "coordination",
        tagline: "Ensure only one process performs a critical action at a time across machines.",
        problem: "Two workers running the same job (e.g. reserving inventory) corrupt state.",
        how: "Shared lock state lives in a coordination system or fast store, with leases / TTLs to avoid deadlock.",
        used: ["Scheduling", "Inventory reservation", "Single-writer workflows"],
        tradeoff: "Bad lock design causes split-brain or deadlocks.",
        examples: ["Redis lock (Redlock)", "ZooKeeper lock", "etcd lease lock"],
        diagram: `sequenceDiagram
  participant W1 as Worker 1
  participant W2 as Worker 2
  participant L as Lock store
  W1->>L: SET lock NX EX 30
  L-->>W1: OK (acquired)
  W2->>L: SET lock NX EX 30
  L-->>W2: fail (held)
  W1->>L: release after work
  W2->>L: retry → acquire`,
        note: "Always set an expiry (lease) so a crashed holder cannot block everyone forever.",
      },
    ],
  },

  /* ============================================================= 6 */
  {
    id: "storage",
    num: "06",
    cat: "--c-storage",
    title: "Data Storage Systems",
    intro:
      "The durable heart of the system. Pick storage by access pattern — relational integrity, key lookups, documents, write-scale, search, blobs, or analytics.",
    topics: [
      {
        type: "card",
        id: "sql",
        title: "SQL Database",
        chip: "relational",
        tagline: "Structured, relational data with ACID transactions and joins.",
        problem: "Money and orders demand correctness, relationships, and atomic multi-row updates.",
        how: "Tables, rows, columns, indexes, joins, and ACID transactions enforce integrity.",
        used: ["Payments", "Orders", "Financial records", "Relational workflows"],
        tradeoff: "Horizontal write scaling is harder.",
        examples: ["PostgreSQL", "MySQL", "Oracle"],
        diagram: `erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ ORDER_ITEM : contains
  PRODUCT ||--o{ ORDER_ITEM : "appears in"
  USER {
    int id PK
  }
  ORDER {
    int id PK
    int user_id FK
  }`,
        note: "Default to SQL unless an access pattern clearly demands otherwise.",
      },
      {
        type: "card",
        id: "kv",
        title: "NoSQL Key-Value Store",
        chip: "key lookup",
        tagline: "Extremely fast access by primary key at massive scale.",
        problem: "Some workloads only ever read/write by a single key and need huge throughput.",
        how: "Data is stored by key and partitioned across nodes by that key.",
        used: ["Profiles", "Sessions", "Carts"],
        tradeoff: "Limited query flexibility (no rich joins/filters).",
        examples: ["Redis KV", "Riak", "Aerospike"],
        diagram: `flowchart LR
  APP["App"] -->|get/put key| KV["KV store"]
  KV --> P1["Partition A"]
  KV --> P2["Partition B"]
  KV --> P3["Partition C"]`,
        note: "If you can express every query as 'by key', KV stores scale almost linearly.",
      },
      {
        type: "card",
        id: "document",
        title: "Document Store",
        chip: "semi-structured",
        tagline: "Store flexible, nested, JSON-like documents.",
        problem: "Evolving schemas and nested objects fight rigid relational tables.",
        how: "Documents have a flexible schema; nested objects and arrays are first-class.",
        used: ["Content systems", "Product catalogs", "Flexible metadata"],
        tradeoff: "Joins and relational constraints are weaker than SQL.",
        examples: ["MongoDB", "Couchbase", "Firestore"],
        diagram: `flowchart TB
  COLL["Collection: products"] --> D1["{ id, name, specs:{...}, tags:[...] }"]
  COLL --> D2["{ id, name, variants:[...] }"]`,
        note: "Flexible schema is a feature and a footgun — still design your access patterns.",
      },
      {
        type: "card",
        id: "wide-column",
        title: "Wide-Column Store",
        chip: "write-scale",
        tagline: "Scale writes and huge, sparse datasets across many nodes.",
        problem: "Write-heavy, time-series-like data overwhelms a single relational primary.",
        how: "Data is partitioned by key and optimized for distributed, write-heavy access.",
        used: ["Time-series-like workloads", "Large event datasets"],
        tradeoff: "Query patterns must be designed up front.",
        examples: ["Cassandra", "HBase", "ScyllaDB"],
        diagram: `flowchart TB
  W["Writes"] --> R{"Partition by key"}
  R --> N1["Node 1 (replica set)"]
  R --> N2["Node 2 (replica set)"]
  R --> N3["Node 3 (replica set)"]
  N1 -. replicate .- N2 -. replicate .- N3`,
        note: "Model the table around the query you will run — you cannot bolt on joins later.",
      },
      {
        type: "card",
        id: "dynamodb",
        title: "DynamoDB",
        chip: "managed NoSQL",
        tagline: "A managed, highly scalable key-value / document database.",
        problem: "You want predictable single-digit-ms latency at any scale, fully managed.",
        how: "A partition key (and optional sort key) determines distribution; secondary indexes add access patterns.",
        used: ["High-scale low-latency", "Sessions, profiles, metadata, carts"],
        tradeoff: "Bad key design causes hot partitions.",
        examples: ["Amazon DynamoDB"],
        diagram: `flowchart TB
  APP["App"] -->|PK + SK| DDB["DynamoDB"]
  DDB --> PA["Partition A"]
  DDB --> PB["Partition B"]
  DDB -. GSI .-> IDX["Alt access pattern"]`,
        note: "Spread load with a high-cardinality partition key to avoid hot partitions.",
      },
      {
        type: "card",
        id: "graph",
        title: "Graph Database",
        chip: "relationships",
        tagline: "Model and traverse relationships efficiently.",
        problem: "Deep relationship queries (friends-of-friends) explode into costly SQL joins.",
        how: "Nodes and edges represent entities and connections; traversals are first-class.",
        used: ["Social graph", "Recommendations", "Fraud rings"],
        tradeoff: "A specialized fit — not ideal for all workloads.",
        examples: ["Neo4j", "Amazon Neptune", "JanusGraph"],
        diagram: `flowchart LR
  A(("Alice")) -- follows --> B(("Bob"))
  B -- follows --> C(("Carol"))
  A -- likes --> P(("Post"))
  C -- likes --> P`,
        note: "When relationships *are* the query, a graph DB beats recursive joins.",
      },
      {
        type: "card",
        id: "timeseries",
        title: "Time-Series Database",
        chip: "metrics",
        tagline: "Store metrics and events indexed by time for fast range queries.",
        problem: "Monitoring and IoT generate massive append-only, time-ordered data.",
        how: "Optimized for append-heavy writes and time-range queries with downsampling.",
        used: ["Monitoring", "IoT", "Financial tick data"],
        tradeoff: "Specialized; not a full transactional replacement.",
        examples: ["InfluxDB", "TimescaleDB", "OpenTSDB"],
        diagram: `flowchart LR
  S["Sensors / metrics"] -->|append| TS["Time-series DB"]
  TS --> Q1["range: last 1h"]
  TS --> Q2["downsample: 1m avg"]`,
        note: "Retention + downsampling policies keep cost bounded as data grows forever.",
      },
      {
        type: "card",
        id: "search",
        title: "Search Engine",
        chip: "full-text",
        tagline: "Full-text search, filtering, and relevance ranking.",
        problem: "LIKE '%term%' in SQL is slow and cannot rank by relevance.",
        how: "Inverted indexes map terms to documents for fast lookup and scoring.",
        used: ["Product search", "Log search", "Document search"],
        tradeoff: "Usually eventually consistent with the source database.",
        examples: ["Elasticsearch", "OpenSearch", "Solr"],
        diagram: `flowchart LR
  DB[("Source DB")] -->|index events| ENG["Search engine"]
  ENG --> INV["Inverted index<br/>term → docs"]
  U["User query"] --> ENG
  ENG -->|ranked results| U`,
        note: "Search is a secondary index of truth — keep it in sync via events/CDC.",
      },
      {
        type: "card",
        id: "object-storage",
        title: "Object Storage",
        chip: "blobs",
        tagline: "Store large files durably and cheaply as immutable objects.",
        problem: "Images, video, and backups do not belong in a transactional database.",
        how: "Files are stored as immutable objects with metadata inside buckets/containers.",
        used: ["Images", "Video", "Backups", "Data lakes"],
        tradeoff: "Not for low-latency transactional row updates.",
        examples: ["Amazon S3", "Google Cloud Storage", "Azure Blob"],
        diagram: `flowchart LR
  APP["App"] -->|PUT object| S3["Object store / bucket"]
  S3 --> META["Metadata + URL"]
  CDN["CDN"] -->|serve| USERS["Users"]
  S3 --> CDN`,
        note: "Store the blob in object storage; store its URL + metadata in your database.",
      },
      {
        type: "card",
        id: "data-warehouse",
        title: "Data Warehouse",
        chip: "OLAP",
        tagline: "Analytical querying over large historical datasets.",
        problem: "Heavy aggregations would crush a transactional (OLTP) database.",
        how: "Columnar storage optimized for OLAP scans, aggregations, and batch analytics.",
        used: ["BI reports", "Product analytics", "Long-term analysis"],
        tradeoff: "Not for high-QPS transactional serving.",
        examples: ["Snowflake", "BigQuery", "Amazon Redshift"],
        diagram: `flowchart LR
  OLTP[("OLTP DBs")] -->|ETL / ELT| DW["Data warehouse<br/>columnar · OLAP"]
  LOGS["Event logs"] --> DW
  DW --> BI["BI / dashboards"]`,
        note: "OLTP serves the app; OLAP (warehouse) answers business questions.",
      },
      {
        type: "card",
        id: "data-lake",
        title: "Data Lake",
        chip: "raw store",
        tagline: "Cheaply store raw structured and unstructured data for later processing.",
        problem: "You want to keep everything now and decide the schema later (schema-on-read).",
        how: "Large-scale object storage holds raw data; schema is applied at read time by processing engines.",
        used: ["ML pipelines", "Offline analytics", "Archival raw events"],
        tradeoff: "Governance and discoverability can become messy ('data swamp').",
        examples: ["S3-based lake", "Azure Data Lake", "GCS data lake"],
        diagram: `flowchart LR
  SRC["Raw events · logs · files"] --> LAKE["Data lake (object store)"]
  LAKE --> SPARK["Processing (Spark/ETL)"]
  SPARK --> DW["Warehouse"]
  SPARK --> ML["ML training"]`,
        note: "Add a catalog + governance early, or your lake becomes a swamp.",
      },
    ],
  },

  /* ============================================================= 7 */
  {
    id: "data-management",
    num: "07",
    cat: "--c-data",
    title: "Data Management Concepts",
    intro:
      "How data is identified, distributed, copied, and shaped for performance. These concepts apply across every database you pick.",
    topics: [
      {
        type: "card",
        id: "partitioning",
        title: "Partitioning / Sharding",
        chip: "distribute",
        tagline: "Split data across nodes so the system can scale beyond one machine.",
        problem: "One node eventually runs out of CPU, memory, or disk for the whole dataset.",
        how: "Data is distributed by hash, range, geo, tenant, or a composite scheme.",
        used: ["Scaling reads & writes", "Bounding per-node data size"],
        tradeoff: "Cross-shard joins and rebalancing are hard.",
        examples: ["User-id hash sharding", "Geo-based sharding", "Tenant-based sharding"],
        diagram: `flowchart TB
  R{"Shard key<br/>hash(user_id)"} --> S1["Shard 1<br/>users 0-33%"]
  R --> S2["Shard 2<br/>users 34-66%"]
  R --> S3["Shard 3<br/>users 67-100%"]`,
        note: "Pick a shard key that spreads load evenly and matches your dominant query.",
      },
      {
        type: "card",
        id: "replication",
        title: "Replication",
        chip: "copies",
        tagline: "Keep copies of data on multiple nodes for availability and read scale.",
        problem: "If the only copy of data dies, you lose it; one node can't serve all reads.",
        how: "Leader-follower or leaderless replication copies writes across replicas.",
        used: ["High availability", "Read scaling", "Geo-locality"],
        tradeoff: "Higher availability but consistency becomes harder.",
        examples: ["MySQL primary-replica", "PostgreSQL streaming replication", "Cassandra multi-replica"],
        diagram: `flowchart TB
  W["Write"] --> L["Leader"]
  L -->|replicate| F1["Follower 1"]
  L -->|replicate| F2["Follower 2"]
  RR["Reads"] --> F1
  RR --> F2`,
        note: "Synchronous replication = safer but slower; async = faster but can lose recent writes.",
      },
      {
        type: "card",
        id: "read-replica",
        title: "Read Replica",
        chip: "read offload",
        tagline: "Offload read traffic from the primary to read-only copies.",
        problem: "Read-heavy apps saturate the primary, hurting writes.",
        how: "Replicas serve reads while the primary handles writes and streams changes to them.",
        used: ["Scaling reads", "Reporting queries"],
        tradeoff: "Replica lag can return stale reads.",
        examples: ["PostgreSQL read replicas", "MySQL read replicas", "Aurora reader endpoints"],
        diagram: `flowchart LR
  APP["App"] -->|writes| P["Primary"]
  APP -->|reads| R1["Read replica 1"]
  APP -->|reads| R2["Read replica 2"]
  P -. async stream .-> R1
  P -. async stream .-> R2`,
        note: "Send read-your-own-write paths to the primary to avoid showing stale data.",
      },
      {
        type: "card",
        id: "secondary-index",
        title: "Secondary Index",
        chip: "query path",
        tagline: "Support alternate query paths beyond the primary key.",
        problem: "Looking up by a non-key column means scanning everything.",
        how: "An index maps a secondary attribute to the rows that contain it.",
        used: ["Filtering by non-key fields", "Alternate access patterns"],
        tradeoff: "Speeds reads but adds write cost and storage overhead.",
        examples: ["B-tree index (PostgreSQL)", "DynamoDB GSI", "MongoDB secondary index"],
        diagram: `flowchart LR
  Q["Query: email = x"] --> IDX["Secondary index<br/>email → row id"]
  IDX --> ROW["Row"]
  W["Write"] -. also update .-> IDX`,
        note: "Every index you add makes writes a little slower — index for real queries only.",
      },
      {
        type: "card",
        id: "denormalization",
        title: "Denormalization",
        chip: "read speed",
        tagline: "Duplicate data to make reads fast and avoid expensive joins.",
        problem: "Normalized data needs many joins to render a single screen.",
        how: "Copy related fields into one record so a read needs no joins.",
        used: ["Read-heavy screens", "Precomputed feeds", "NoSQL modeling"],
        tradeoff: "Writes become more complex and consistency is harder.",
        examples: ["Order summary stored with user", "Precomputed feed entries", "Duplicated product metadata"],
        diagram: `flowchart LR
  subgraph Normalized
    U["users"] --- O["orders"] --- P["products"]
  end
  subgraph Denormalized
    F["order_view<br/>{user, items, product names}"]
  end
  Normalized -->|precompute| Denormalized`,
        note: "Denormalize the read path; keep a normalized source of truth to rebuild from.",
      },
      {
        type: "card",
        id: "materialized-view",
        title: "Materialized View",
        chip: "precompute",
        tagline: "Store the result of a query so reads are instant.",
        problem: "Expensive aggregations recomputed on every read are wasteful.",
        how: "The query result is precomputed and stored, then refreshed periodically.",
        used: ["Dashboards", "Aggregations", "Leaderboards"],
        tradeoff: "Refresh complexity and staleness.",
        examples: ["PostgreSQL materialized view", "BigQuery scheduled table", "Precomputed summary table"],
        diagram: `flowchart LR
  T[("Base tables")] -->|refresh| MV["Materialized view<br/>(precomputed result)"]
  Q["Read query"] --> MV
  MV -->|instant| Q`,
        note: "Choose refresh cadence by how stale your users can tolerate the numbers being.",
      },
    ],
  },

  /* ============================================================= 8 */
  {
    id: "messaging",
    num: "08",
    cat: "--c-messaging",
    title: "Messaging, Streaming & Async",
    intro:
      "Decouple producers from consumers. Async systems absorb spikes, enable event-driven architectures, and keep the user's critical path fast.",
    topics: [
      {
        type: "card",
        id: "message-queue",
        title: "Message Queue",
        chip: "buffer work",
        tagline: "Buffer asynchronous tasks so producers and consumers run at their own pace.",
        problem: "Doing slow work (email, video processing) inline makes the user wait.",
        how: "Producers push tasks onto a queue; consumers pull and process them later.",
        used: ["Emails", "Notifications", "Video processing", "Order pipelines"],
        tradeoff: "Adds eventual consistency and failure-handling complexity.",
        examples: ["RabbitMQ", "Amazon SQS", "ActiveMQ"],
        diagram: `flowchart LR
  P["Producer"] -->|enqueue| Q[["Queue"]]
  Q --> C1["Consumer 1"]
  Q --> C2["Consumer 2"]
  C1 --> DB[("Result")]
  C2 --> DB`,
        note: "A queue turns a traffic spike into a manageable backlog instead of an outage.",
      },
      {
        type: "card",
        id: "pubsub",
        title: "Publish / Subscribe",
        chip: "fan-out",
        tagline: "Broadcast each event to many independent consumers.",
        problem: "Multiple services need to react to the same event without coupling.",
        how: "Producers publish to a topic; every subscriber receives a copy.",
        used: ["Notifications", "Audit streams", "Event-driven services"],
        tradeoff: "Ordering and replay semantics vary by platform.",
        examples: ["Kafka topics", "Google Pub/Sub", "Amazon SNS"],
        diagram: `flowchart TB
  P["Publisher"] --> T(("Topic"))
  T --> S1["Email service"]
  T --> S2["Analytics service"]
  T --> S3["Search indexer"]`,
        note: "Queue = one consumer per message; Pub/Sub = every subscriber gets every message.",
      },
      {
        type: "card",
        id: "event-bus",
        title: "Event Bus",
        chip: "backbone",
        tagline: "A shared backbone enabling decoupled, event-driven architecture.",
        problem: "Point-to-point integrations between many services become a tangled mess.",
        how: "Services emit events to a central bus; others subscribe to what they care about.",
        used: ["Event-driven systems", "Cross-team integration"],
        tradeoff: "Easy to overcomplicate with too many event dependencies.",
        examples: ["Kafka as backbone", "Amazon EventBridge", "NATS"],
        diagram: `flowchart TB
  A["Order svc"] --> BUS{{"Event bus"}}
  B["Payment svc"] --> BUS
  BUS --> C["Inventory svc"]
  BUS --> D["Notification svc"]
  BUS --> E["Analytics"]`,
        note: "An event bus inverts dependencies: producers don't know who consumes them.",
      },
      {
        type: "card",
        id: "stream-processing",
        title: "Stream Processing",
        chip: "realtime",
        tagline: "Process large, continuous event streams in near real time.",
        problem: "Some insights (fraud, live metrics) are worthless if computed hours later.",
        how: "A processing engine consumes streams and computes windowed, stateful results continuously.",
        used: ["Fraud detection", "Realtime analytics", "Monitoring"],
        tradeoff: "Stateful stream processing is complex.",
        examples: ["Kafka Streams", "Apache Flink", "Spark Structured Streaming"],
        diagram: `flowchart LR
  SRC["Event stream"] --> SP["Stream processor<br/>windows · joins · state"]
  SP --> OUT1["Realtime dashboard"]
  SP --> OUT2["Alerts"]
  SP --> SINK[("Sink store")]`,
        note: "Think in time windows (last 5 min) and watermarks for late-arriving events.",
      },
      {
        type: "card",
        id: "dlq",
        title: "Dead Letter Queue",
        chip: "failure sink",
        tagline: "Capture messages that repeatedly fail processing for later inspection.",
        problem: "A poison message can block a queue or be retried forever.",
        how: "After N failed attempts, the message is moved to a separate DLQ.",
        used: ["Isolating bad messages", "Debugging failures", "Manual reprocessing"],
        tradeoff: "Needs active monitoring or failures just pile up unseen.",
        examples: ["SQS DLQ", "RabbitMQ dead-letter exchange", "Kafka retry + DLQ topic"],
        diagram: `flowchart LR
  Q[["Main queue"]] --> C["Consumer"]
  C -->|success| OK["Done"]
  C -->|fail x N| DLQ[["Dead letter queue"]]
  DLQ --> OPS["Alert + manual review"]`,
        note: "A DLQ without an alarm is a silent graveyard — always monitor its depth.",
      },
      {
        type: "card",
        id: "scheduler",
        title: "Scheduler / Cron",
        chip: "timed jobs",
        tagline: "Run jobs at defined times or intervals.",
        problem: "Some work is periodic: reports, cleanup, syncs — not triggered by user requests.",
        how: "A scheduler fires jobs on a cron-like schedule, handling retries and concurrency.",
        used: ["Batch reports", "Cleanup jobs", "Periodic sync"],
        tradeoff: "Must handle retries and idempotency.",
        examples: ["Cron", "Kubernetes CronJob", "Airflow scheduled DAG"],
        diagram: `flowchart LR
  CRON["Scheduler<br/>0 2 * * *"] -->|trigger| JOB["Batch job"]
  JOB --> DB[("Database")]
  JOB -.retry on fail.-> JOB`,
        note: "Make scheduled jobs idempotent — they will occasionally run twice.",
      },
    ],
  },

  /* ============================================================= 9 */
  {
    id: "security",
    num: "09",
    cat: "--c-security",
    title: "Security, Identity & Access",
    intro:
      "Who are you, what may you do, and is the data protected on the wire and at rest. Security is a layer that touches every other component.",
    topics: [
      {
        type: "card",
        id: "authentication",
        title: "Authentication",
        chip: "who are you",
        tagline: "Verify the identity of the caller.",
        problem: "Before granting access, the system must know who is asking.",
        how: "Credentials are checked via password, session cookie, OAuth 2.0, OIDC, API keys, or mTLS.",
        used: ["Login", "API access", "Service identity"],
        tradeoff: "More secure flows (MFA, mTLS) add friction and complexity.",
        examples: ["Auth0", "AWS Cognito", "Okta"],
        diagram: `sequenceDiagram
  participant U as User
  participant A as Auth server
  participant S as Service
  U->>A: credentials
  A-->>U: signed token (JWT)
  U->>S: request + token
  S->>S: verify signature
  S-->>U: protected resource`,
        note: "AuthN = who you are. AuthZ = what you may do. Don't conflate them.",
      },
      {
        type: "card",
        id: "authorization",
        title: "Authorization",
        chip: "what may you do",
        tagline: "Decide what an authenticated actor is allowed to do.",
        problem: "Being logged in is not enough; access to each action must be controlled.",
        how: "Policies are evaluated via RBAC (roles), ABAC (attributes), or ACLs (per-object).",
        used: ["Admin panels", "Multi-tenant data isolation", "Document permissions"],
        tradeoff: "Fine-grained models are powerful but harder to reason about and audit.",
        examples: ["Admin/editor/viewer RBAC", "Attribute checks (region/dept)", "Per-document ACLs"],
        diagram: `flowchart TB
  REQ["Request + identity"] --> PDP{"Policy decision"}
  PDP -->|role allows| ALLOW["Allow"]
  PDP -->|no permission| DENY["Deny 403"]
  ROLES["RBAC / ABAC / ACL"] -.feeds.-> PDP`,
        note: "Default-deny: only allow what is explicitly permitted.",
      },
      {
        type: "card",
        id: "session-store",
        title: "Session Store",
        chip: "server state",
        tagline: "Persist server-side session state across requests and instances.",
        problem: "Stateless instances need somewhere shared to keep login/session data.",
        how: "Session data lives in a shared, fast store keyed by a session id cookie.",
        used: ["Login sessions", "Shopping carts", "Server-side state"],
        tradeoff: "Shared session storage is required for horizontal scaling.",
        examples: ["Redis session store", "Memcached sessions", "DB-backed sessions"],
        diagram: `flowchart LR
  U["Client (session cookie)"] --> LB["Load balancer"]
  LB --> A1["Instance 1"]
  LB --> A2["Instance 2"]
  A1 --> SS[("Shared session store")]
  A2 --> SS`,
        note: "External session store is what lets any instance serve any user (stateless app).",
      },
      {
        type: "card",
        id: "jwt",
        title: "JWT",
        chip: "token",
        tagline: "Carry signed identity and claims in a self-contained token.",
        problem: "Stateless services need to trust a token without a central session lookup.",
        how: "A signed token contains claims; services verify the signature locally.",
        used: ["Stateless auth", "API access tokens", "OIDC id tokens"],
        tradeoff: "Revocation and key rotation need planning (tokens are valid until expiry).",
        examples: ["JWT signed with RS256", "OAuth access token", "OIDC id token"],
        diagram: `flowchart LR
  JWT["JWT"] --> H["header (alg)"]
  JWT --> P["payload (claims)"]
  JWT --> SIG["signature"]
  SVC["Service"] -->|verify with public key| SIG`,
        note: "Keep JWTs short-lived; use refresh tokens + a denylist for revocation.",
      },
      {
        type: "card",
        id: "mtls",
        title: "mTLS",
        chip: "mutual auth",
        tagline: "Both client and server prove identity with certificates.",
        problem: "Service-to-service calls need strong, mutual identity, not just server TLS.",
        how: "Each side presents and validates an X.509 certificate during the TLS handshake.",
        used: ["Zero-trust service mesh", "Sensitive internal APIs"],
        tradeoff: "Certificate lifecycle management adds complexity.",
        examples: ["Istio mTLS", "Linkerd mTLS", "SPIFFE / SPIRE identity"],
        diagram: `sequenceDiagram
  participant A as Service A
  participant B as Service B
  A->>B: client cert
  B->>A: server cert
  A->>A: verify B
  B->>B: verify A
  A-->>B: encrypted, mutually trusted channel`,
        note: "A service mesh automates cert issuance/rotation so mTLS is invisible to apps.",
      },
      {
        type: "card",
        id: "encryption-rest",
        title: "Encryption at Rest",
        chip: "stored data",
        tagline: "Protect data while it sits on disk.",
        problem: "Stolen disks or snapshots must not reveal plaintext data.",
        how: "Data is encrypted on disk using keys managed by a KMS.",
        used: ["Compliance", "Protecting backups & volumes"],
        tradeoff: "Key management and rotation must be handled carefully.",
        examples: ["Encrypted EBS volumes", "DB encryption with KMS", "Encrypted S3 buckets"],
        diagram: `flowchart LR
  D["Plaintext"] -->|encrypt| ENC["Ciphertext on disk"]
  KMS["KMS (keys)"] -.provides key.-> ENC`,
        note: "At rest + in transit together close both the storage and network exposure.",
      },
      {
        type: "card",
        id: "encryption-transit",
        title: "Encryption in Transit",
        chip: "network data",
        tagline: "Protect data while it moves across the network.",
        problem: "Plaintext on the wire can be intercepted (man-in-the-middle).",
        how: "TLS encrypts connections between clients and services and between services.",
        used: ["Public HTTPS", "Internal service calls", "VPN tunnels"],
        tradeoff: "Slight handshake overhead; cert management required.",
        examples: ["HTTPS with TLS", "TLS between services", "VPN tunnel encryption"],
        diagram: `flowchart LR
  C["Client"] ===|TLS encrypted| S["Server"]
  S ===|TLS| DB[("Database")]`,
        note: "Terminate TLS at the edge, but re-encrypt internally for sensitive systems.",
      },
      {
        type: "card",
        id: "secrets",
        title: "Secrets Management",
        chip: "credentials",
        tagline: "Securely store and rotate API keys, certs, and credentials.",
        problem: "Hardcoded secrets in code or config leak and never rotate.",
        how: "Secrets live in a dedicated vault; apps fetch them at runtime with access policies.",
        used: ["DB passwords", "API keys", "Signing keys"],
        tradeoff: "Hardcoding secrets is a critical anti-pattern.",
        examples: ["AWS Secrets Manager", "HashiCorp Vault", "Google Secret Manager"],
        diagram: `flowchart LR
  APP["App"] -->|request at runtime| V["Secrets vault"]
  V -->|short-lived secret| APP
  V -. rotate .-> V`,
        note: "Never commit secrets. Inject at runtime and rotate automatically.",
      },
      {
        type: "card",
        id: "rate-limiting",
        title: "Rate Limiting / Throttling",
        chip: "fairness",
        tagline: "Protect systems and enforce fair usage by capping request rates.",
        problem: "A single client (or attacker) can overwhelm shared capacity.",
        how: "Algorithms — token bucket, leaky bucket, fixed window, sliding window — cap requests per key.",
        used: ["API quotas", "Abuse prevention", "Protecting backends"],
        tradeoff: "Too strict blocks legitimate bursts; too loose lets abuse through.",
        examples: ["Redis counter limiter", "API gateway usage plans", "NGINX limit_req"],
        diagram: `flowchart LR
  REQ["Requests"] --> TB{"Token bucket"}
  TB -->|token available| PASS["Allow"]
  TB -->|empty| BLOCK["429 Too Many Requests"]
  REFILL["Refill rate"] -.tokens.-> TB`,
        note: "Token bucket allows short bursts; sliding window gives smoother fairness.",
      },
      {
        type: "card",
        id: "firewall",
        title: "Firewall / NACL / Security Group",
        chip: "network ACL",
        tagline: "Restrict which network paths are even reachable.",
        problem: "Open ports and IP ranges expand the attack surface.",
        how: "Rules allow/deny traffic by IP, port, and protocol at network boundaries.",
        used: ["Network isolation", "Least-privilege access", "Defense in depth"],
        tradeoff: "Overly broad rules weaken security; overly tight rules break connectivity.",
        examples: ["AWS Security Groups", "Network ACLs", "iptables / cloud firewall"],
        diagram: `flowchart LR
  NET["Internet"] --> FW{"Firewall / SG"}
  FW -->|allow 443| WEB["Web tier"]
  FW -.deny all else.-> X["Blocked"]
  WEB -->|allow 5432| DB[("DB tier")]`,
        note: "Layer SGs (instance) with NACLs (subnet) for defense in depth.",
      },
    ],
  },

  /* ============================================================= 10 */
  {
    id: "reliability",
    num: "10",
    cat: "--c-reliab",
    title: "Reliability & Failure Handling",
    intro:
      "Distributed systems fail constantly. These patterns contain failure, recover gracefully, and keep the core experience alive.",
    topics: [
      {
        type: "card",
        id: "health-check",
        title: "Health Check",
        chip: "liveness",
        tagline: "Detect whether an instance should receive traffic.",
        problem: "Routing traffic to a broken instance causes errors and timeouts.",
        how: "Load balancers and orchestrators probe an endpoint; failing instances are removed.",
        used: ["LB target health", "Kubernetes probes", "Auto-replacement"],
        tradeoff: "Bad probes can flap or hide real problems.",
        examples: ["/health endpoint", "Liveness/readiness probes", "LB health checks"],
        diagram: `flowchart LR
  LB["LB / orchestrator"] -->|GET /health| N1["Instance (200 OK)"]
  LB -->|GET /health| N2["Instance (500)"]
  LB -. keep .-> N1
  LB -. remove .-> N2`,
        note: "Separate liveness (restart me) from readiness (don't send traffic yet).",
      },
      {
        type: "card",
        id: "timeout",
        title: "Timeout",
        chip: "bound waits",
        tagline: "Stop waiting forever for a slow dependency.",
        problem: "A hanging call ties up threads and cascades into resource exhaustion.",
        how: "Every network call has a deadline; exceeding it fails fast.",
        used: ["HTTP/gRPC calls", "DB queries", "Any remote dependency"],
        tradeoff: "Too short causes false failures; too long defeats the purpose.",
        examples: ["gRPC timeout", "HTTP client timeout", "DB query timeout"],
        diagram: `sequenceDiagram
  participant A as Caller
  participant B as Dependency
  A->>B: request (deadline 2s)
  Note over B: slow...
  A--xB: 2s elapsed → abort
  A->>A: fail fast, free thread`,
        note: "No timeout is a bug. Every remote call needs an explicit deadline.",
      },
      {
        type: "card",
        id: "retry",
        title: "Retry",
        chip: "recover",
        tagline: "Recover from transient failures by trying again.",
        problem: "Many failures are momentary (blip, brief overload) and succeed on retry.",
        how: "Failed idempotent operations are retried a capped number of times.",
        used: ["Transient network errors", "Brief unavailability"],
        tradeoff: "A bad retry policy can amplify an outage (retry storms).",
        examples: ["Retry idempotent GETs", "Queue consumer retries", "SDK capped retries"],
        diagram: `flowchart LR
  C["Call"] -->|fail| R1["Retry 1"]
  R1 -->|fail| R2["Retry 2"]
  R2 -->|fail| R3["Retry 3 → give up"]
  R1 -->|ok| OK["Success"]`,
        note: "Only retry idempotent operations, and always cap attempts.",
      },
      {
        type: "card",
        id: "backoff",
        title: "Exponential Backoff",
        chip: "spacing",
        tagline: "Space retries progressively to relieve pressure on a struggling system.",
        problem: "Immediate, synchronized retries hammer a recovering dependency.",
        how: "Wait grows exponentially (100ms, 200ms, 400ms…) plus random jitter.",
        used: ["Retry policies", "Reconnect loops", "Rate-limited APIs"],
        tradeoff: "Longer waits increase latency for the unlucky request.",
        examples: ["100/200/400ms spacing", "Backoff with jitter"],
        diagram: `flowchart LR
  A["Attempt 1"] -->|100ms| B["Attempt 2"]
  B -->|200ms| C["Attempt 3"]
  C -->|400ms| D["Attempt 4"]
  J["+ jitter"] -.desync.-> B`,
        note: "Jitter is essential — it prevents thousands of clients retrying in lockstep.",
      },
      {
        type: "card",
        id: "circuit-breaker",
        title: "Circuit Breaker",
        chip: "stop the bleed",
        tagline: "Temporarily stop calling a failing dependency to let it recover.",
        problem: "Relentlessly calling a dead service wastes resources and cascades failure.",
        how: "After a failure threshold the breaker 'opens' and fails fast, then probes to recover.",
        used: ["Protecting upstreams", "Preventing cascading failure"],
        tradeoff: "May reject recoverable traffic briefly while open.",
        examples: ["Hystrix", "Resilience4j", "Envoy outlier detection"],
        diagram: `stateDiagram-v2
  [*] --> Closed
  Closed --> Open: failures > threshold
  Open --> HalfOpen: after cooldown
  HalfOpen --> Closed: probe succeeds
  HalfOpen --> Open: probe fails`,
        note: "Closed = normal, Open = fail fast, Half-open = cautiously test recovery.",
      },
      {
        type: "card",
        id: "bulkhead",
        title: "Bulkhead",
        chip: "isolate",
        tagline: "Isolate resource pools so one failure can't sink the whole ship.",
        problem: "One slow dependency exhausts a shared thread pool and takes everything down.",
        how: "Separate pools (threads/connections/queues) per dependency or workload class.",
        used: ["Protecting critical paths", "Isolating noisy dependencies"],
        tradeoff: "Lower overall utilization due to reserved capacity.",
        examples: ["Per-dependency thread pools", "Separate consumers for critical vs non-critical"],
        diagram: `flowchart TB
  REQ["Incoming work"] --> P1["Pool: payments (critical)"]
  REQ --> P2["Pool: recommendations"]
  P2 -. exhausted .-> X["Degrade only recs"]
  P1 --> OK["Payments unaffected"]`,
        note: "Named after ship compartments: a breach floods one cell, not the whole hull.",
      },
      {
        type: "card",
        id: "idempotency",
        title: "Idempotency",
        chip: "safe retry",
        tagline: "Make repeated operations have the same effect as a single one.",
        problem: "Retries and at-least-once delivery can apply the same action twice (double charge).",
        how: "An idempotency key dedupes requests so duplicates are no-ops.",
        used: ["Payments", "Order creation", "Message processing"],
        tradeoff: "Requires storing and checking keys.",
        examples: ["Idempotency key on payment API", "Order dedupe key", "Event-id dedupe"],
        diagram: `sequenceDiagram
  participant C as Client
  participant S as Service
  C->>S: charge (key=abc123)
  S->>S: key seen? no → charge, store key
  S-->>C: ok
  C->>S: retry (key=abc123)
  S->>S: key seen? yes → return prior result
  S-->>C: ok (no double charge)`,
        note: "Idempotency is what makes 'at-least-once' delivery safe to build on.",
      },
      {
        type: "card",
        id: "failover",
        title: "Failover",
        chip: "switch over",
        tagline: "Shift traffic to backup instances, zones, or regions on failure.",
        problem: "When a primary dies, service must continue without manual intervention.",
        how: "Health detection triggers promotion of a standby or rerouting to a healthy site.",
        used: ["AZ failure", "Regional DB failure", "DNS/global-LB failover"],
        tradeoff: "Failover can be lossy or slow if not rehearsed.",
        examples: ["AZ failover", "Regional DB failover", "DNS-based failover"],
        diagram: `flowchart LR
  T["Traffic"] --> P["Primary"]
  P -. dies .-> X((x))
  T -->|promote| SB["Standby → new primary"]`,
        note: "Untested failover is a hope, not a plan — rehearse it regularly.",
      },
      {
        type: "card",
        id: "graceful-degradation",
        title: "Graceful Degradation",
        chip: "stay useful",
        tagline: "Keep the core experience working when optional systems fail.",
        problem: "A non-critical dependency failing shouldn't take down the whole product.",
        how: "Detect the failure and serve a reduced but functional experience (cached/fallback).",
        used: ["Feed when recs are down", "Checkout when notifications fail"],
        tradeoff: "Requires designing fallbacks for each optional dependency.",
        examples: ["Show cached feed", "Disable notifications, keep checkout"],
        diagram: `flowchart TB
  REQ["Page request"] --> CORE["Core: products + cart"]
  REQ --> RECS{"Recs service"}
  RECS -->|up| R1["Personalized"]
  RECS -.down.-> R2["Cached / popular fallback"]
  CORE --> OK["Page still works"]`,
        note: "Decide in advance which features are optional and what their fallback is.",
      },
      {
        type: "card",
        id: "disaster-recovery",
        title: "Disaster Recovery",
        chip: "RPO / RTO",
        tagline: "Restore service after a major outage within agreed loss/time limits.",
        problem: "Regions and data centers can fail entirely; you need a recovery plan.",
        how: "Backups, standby regions, and runbooks restore service; RPO/RTO set the targets.",
        used: ["Region loss", "Data corruption recovery", "Compliance"],
        tradeoff: "Hotter standbys cost more but recover faster.",
        examples: ["Cross-region backup restore", "Warm standby region", "Pilot-light setup"],
        diagram: `flowchart LR
  PRI["Primary region"] -. replicate .-> DR["DR region"]
  PRI -. disaster .-> X((x))
  DR -->|RTO: time to restore| LIVE["Service restored"]
  NOTE["RPO: acceptable data loss"]`,
        note: "RPO = how much data you can lose; RTO = how long recovery may take.",
      },
    ],
  },

  /* ============================================================= 11 */
  {
    id: "consistency",
    num: "11",
    cat: "--c-consist",
    title: "Consistency & Distributed Systems",
    intro:
      "The deep theory interviewers probe. Consistency models, CAP, consensus, and the failure modes unique to distributed systems.",
    topics: [
      {
        type: "card",
        id: "consistency-models",
        title: "Strong vs Eventual Consistency",
        chip: "models",
        tagline: "After a write, do all readers see it immediately, or only eventually?",
        problem: "Replicating data forces a choice between freshness and availability/latency.",
        how: "Strong: every read sees the latest write. Eventual: replicas converge over time; some reads are stale.",
        used: ["Strong: balances, inventory", "Eventual: feeds, counts, caches"],
        tradeoff: "Strong costs latency/availability; eventual risks stale reads.",
        examples: ["Strong: single-leader SQL", "Eventual: Dynamo-style stores, CDNs"],
        diagram: `sequenceDiagram
  participant W as Writer
  participant L as Leader
  participant R as Replica
  W->>L: write x=2
  Note over L,R: Strong → wait for replica
  L->>R: replicate x=2
  R-->>L: ack
  Note over R: Eventual → read may still see x=1 briefly`,
        note: "Most large systems mix both: strong where correctness matters, eventual elsewhere.",
      },
      {
        type: "card",
        id: "cap",
        title: "CAP Theorem",
        chip: "tradeoff law",
        tagline: "Under a network partition, choose consistency or availability — not both.",
        problem: "Networks partition; you must decide how the system behaves when they do.",
        how: "During a partition (P), you either reject writes to stay Consistent (CP) or serve possibly-stale data to stay Available (AP).",
        used: ["Reasoning about DB behavior", "Choosing CP vs AP stores"],
        tradeoff: "CP sacrifices availability under partition; AP sacrifices consistency.",
        examples: ["CP: HBase, Zookeeper", "AP: Cassandra, Dynamo"],
        diagram: `flowchart TB
  P{"Network partition?"}
  P -->|No| BOTH["Consistent + Available"]
  P -->|Yes| CHOICE{"Choose"}
  CHOICE --> CP["CP: stay consistent, reject some requests"]
  CHOICE --> AP["AP: stay available, allow stale data"]`,
        note: "CAP only forces a choice *during* partitions — pick by what your data demands.",
      },
      {
        type: "card",
        id: "acid-base",
        title: "ACID vs BASE",
        chip: "guarantees",
        tagline: "Two philosophies: strict transactions vs flexible availability.",
        problem: "Different workloads need different correctness guarantees.",
        how: "ACID = Atomic, Consistent, Isolated, Durable. BASE = Basically Available, Soft state, Eventual consistency.",
        used: ["ACID: financial/transactional", "BASE: high-scale/availability"],
        tradeoff: "ACID limits scale; BASE limits immediate correctness.",
        examples: ["ACID: PostgreSQL", "BASE: Cassandra, DynamoDB"],
        diagram: `flowchart LR
  ACID["ACID<br/>Atomic · Consistent<br/>Isolated · Durable"] --- VS(("vs"))
  VS --- BASE["BASE<br/>Basically Available<br/>Soft state · Eventual"]`,
        note: "ACID and BASE are ends of a spectrum, not a binary — many systems sit between.",
      },
      {
        type: "card",
        id: "consensus",
        title: "Consensus",
        chip: "agreement",
        tagline: "Get distributed nodes to agree on a value or a leader.",
        problem: "Replicas must agree on order/leadership despite failures and network delays.",
        how: "Algorithms like Raft or Paxos achieve agreement once a majority acknowledges.",
        used: ["Leader election", "Replicated logs", "Config coordination"],
        tradeoff: "Requires a majority quorum; adds latency.",
        examples: ["Raft", "Paxos", "ZooKeeper / etcd"],
        diagram: `flowchart TB
  L["Leader proposes value"] --> F1["Follower 1"]
  L --> F2["Follower 2"]
  L --> F3["Follower 3"]
  F1 -->|ack| L
  F2 -->|ack| L
  L -->|majority acked → commit| C["Agreed value"]`,
        note: "Consensus needs a majority — that's why clusters use an odd number of nodes.",
      },
      {
        type: "card",
        id: "quorum",
        title: "Quorum",
        chip: "majority",
        tagline: "Require enough replicas to participate in a read or write to stay correct.",
        problem: "With replicas, how many must respond for a read/write to be trustworthy?",
        how: "If R + W > N, reads and writes overlap on at least one up-to-date replica.",
        used: ["Tunable consistency", "Leaderless replication"],
        tradeoff: "Higher quorums = stronger consistency but lower availability/latency.",
        examples: ["Cassandra QUORUM", "MongoDB majority write concern"],
        diagram: `flowchart LR
  W["Write to W=2"] --> N1["Replica 1 ✓"]
  W --> N2["Replica 2 ✓"]
  R["Read from R=2"] --> N2
  R --> N3["Replica 3"]
  NOTE["N=3, R+W=4 > 3 → overlap guaranteed"]`,
        note: "Tune R and W to slide between strong consistency and high availability.",
      },
      {
        type: "card",
        id: "leader-election",
        title: "Leader Election",
        chip: "pick one",
        tagline: "Choose a single node to coordinate certain operations.",
        problem: "Some work (writes, scheduling) must have exactly one coordinator.",
        how: "Nodes use consensus/locks to elect a leader; followers take over if it dies.",
        used: ["Single-writer DBs", "Controllers", "Job coordinators"],
        tradeoff: "Election + failover takes time; risk of split brain if done wrong.",
        examples: ["ZooKeeper election", "etcd election", "K8s controller leader"],
        diagram: `flowchart TB
  N1["Node 1"] & N2["Node 2"] & N3["Node 3"] --> E{"Election"}
  E -->|wins| L["Node 1 = Leader"]
  L -. heartbeat .-> N2
  L -. dies .-> RE["Re-elect"]`,
        note: "A lease/heartbeat ensures a dead leader is detected and replaced.",
      },
      {
        type: "card",
        id: "split-brain",
        title: "Split Brain",
        chip: "failure mode",
        tagline: "Two nodes both believe they are the leader.",
        problem: "A partition can leave two halves each electing their own leader → diverging writes.",
        how: "Prevented with quorum: only the majority side may act as leader.",
        used: ["Understanding partition dangers", "Designing safe failover"],
        tradeoff: "Quorum requirements reduce availability of the minority side.",
        examples: ["Two primaries after partition", "Fenced by quorum/epoch"],
        diagram: `flowchart TB
  P["Cluster"] -. partition .-> A["Side A: 'I'm leader'"]
  P -. partition .-> B["Side B: 'I'm leader'"]
  A & B --> CONF["Conflicting writes"]
  Q["Quorum fencing"] -.prevents.-> CONF`,
        note: "Require a majority to act — the minority side must step down.",
      },
      {
        type: "card",
        id: "clock-skew",
        title: "Clock Skew",
        chip: "time drift",
        tagline: "Machine clocks are never perfectly synchronized.",
        problem: "Ordering events by wall-clock time across machines is unreliable.",
        how: "Use logical clocks (Lamport, vector) or hybrid clocks instead of raw timestamps.",
        used: ["Event ordering", "Conflict resolution", "Distributed transactions"],
        tradeoff: "Logical clocks add bookkeeping; tight time sync (TrueTime) costs infra.",
        examples: ["Lamport clocks", "Vector clocks", "Google TrueTime"],
        diagram: `flowchart LR
  M1["Machine A clock: 10:00:01"]
  M2["Machine B clock: 10:00:04"]
  M1 -. 'happened first?' .-> M2
  LOGIC["Use logical clocks, not wall time"]`,
        note: "Never assume timestamps from different machines are comparable.",
      },
    ],
  },

  /* ============================================================= 12 */
  {
    id: "scaling",
    num: "12",
    cat: "--c-scaling",
    title: "Scaling Strategies",
    intro:
      "How a system grows to handle more load — bigger machines, more machines, statelessness, and elastic, self-adjusting capacity.",
    topics: [
      {
        type: "card",
        id: "vertical-horizontal",
        title: "Vertical vs Horizontal Scaling",
        chip: "scale up / out",
        tagline: "Add more power to one machine, or add more machines.",
        problem: "Growing load eventually exceeds current capacity.",
        how: "Vertical: bigger CPU/RAM on one box. Horizontal: more instances behind a balancer.",
        used: ["Vertical: simple early wins", "Horizontal: large-scale systems"],
        tradeoff: "Vertical hits a hard ceiling; horizontal needs distributed design.",
        examples: ["Bigger DB instance", "Add app servers behind LB"],
        diagram: `flowchart LR
  subgraph Vertical
    V1["Small box"] --> V2["Bigger box"]
  end
  subgraph Horizontal
    LB["LB"] --> H1["Box"]
    LB --> H2["Box"]
    LB --> H3["Box"]
  end`,
        note: "Scale up first (simple), then out (scalable) once you hit limits.",
      },
      {
        type: "card",
        id: "stateless",
        title: "Stateless Services",
        chip: "no local state",
        tagline: "Any instance can serve any request because no state lives locally.",
        problem: "If instances hold local state, you can't freely add/remove or load-balance them.",
        how: "Move state to external stores (cache, DB, session store); instances stay interchangeable.",
        used: ["Horizontal scaling", "Easy autoscaling", "Simple failover"],
        tradeoff: "State must move to external stores (extra hop).",
        examples: ["Stateless API servers", "Session in Redis"],
        diagram: `flowchart TB
  LB["Load balancer"] --> A1["Instance (stateless)"]
  LB --> A2["Instance (stateless)"]
  LB --> A3["Instance (stateless)"]
  A1 & A2 & A3 --> EXT[("External state: cache / DB")]`,
        note: "Statelessness is the foundation that makes autoscaling and failover trivial.",
      },
      {
        type: "card",
        id: "sticky-sessions",
        title: "Sticky Sessions",
        chip: "affinity",
        tagline: "Keep a user pinned to the same backend instance.",
        problem: "Local in-memory session state requires the user to return to the same node.",
        how: "The load balancer routes a user to the same instance via a cookie or hash.",
        used: ["Legacy stateful apps", "Some realtime/connection scenarios"],
        tradeoff: "Hurts load balancing and failover flexibility.",
        examples: ["LB cookie affinity", "Source-IP hashing"],
        diagram: `flowchart LR
  U["User A"] -->|sticky| N1["Instance 1"]
  U2["User B"] -->|sticky| N2["Instance 2"]
  N1 -. dies .-> LOSS["User A session lost"]`,
        note: "Prefer external session store over stickiness — it scales and fails over better.",
      },
      {
        type: "card",
        id: "autoscaling",
        title: "Autoscaling",
        chip: "elastic",
        tagline: "Add or remove instances automatically based on load.",
        problem: "Fixed capacity wastes money at low load and fails at peak.",
        how: "Metrics (CPU, QPS, queue depth) trigger scale-out/in within set bounds.",
        used: ["Variable traffic", "Cost optimization", "Spiky workloads"],
        tradeoff: "Slow scale-up can still miss sudden spikes.",
        examples: ["Kubernetes HPA", "EC2 Auto Scaling", "Lambda concurrency"],
        diagram: `flowchart LR
  M["Metrics: CPU / QPS"] --> AS{"Autoscaler"}
  AS -->|high| UP["Add instances"]
  AS -->|low| DOWN["Remove instances"]
  UP & DOWN --> FLEET["Instance fleet"]`,
        note: "Pre-warm or over-provision a buffer for spikes faster than scale-up time.",
      },
      {
        type: "card",
        id: "backpressure",
        title: "Backpressure",
        chip: "flow control",
        tagline: "Slow producers down when consumers can't keep up.",
        problem: "Unbounded queues grow until memory runs out and the system collapses.",
        how: "Signals (429s, blocking, lag thresholds) tell producers to slow or stop.",
        used: ["Streaming pipelines", "API protection", "Queue stability"],
        tradeoff: "Slows producers — but prevents collapse.",
        examples: ["Kafka consumer lag throttling", "HTTP 429", "Bounded queue blocking"],
        diagram: `flowchart LR
  P["Producer (fast)"] --> Q[["Bounded queue"]]
  Q --> C["Consumer (slow)"]
  Q -.full → signal.-> P
  P -.slow down / 429.-> P`,
        note: "Backpressure converts overload into controlled slowdown instead of a crash.",
      },
    ],
  },

  /* ============================================================= 13 */
  {
    id: "observability",
    num: "13",
    cat: "--c-observe",
    title: "Observability & Operations",
    intro:
      "You can't run what you can't see. Logs, metrics, and traces — plus safe deployment practices — keep systems healthy and incidents short.",
    topics: [
      {
        type: "card",
        id: "three-pillars",
        title: "Logs, Metrics & Traces",
        chip: "3 pillars",
        tagline: "The three pillars of observability, each answering a different question.",
        problem: "When something breaks, you need to know what, how bad, and where.",
        how: "Logs = discrete events (what happened). Metrics = numbers over time (how bad). Traces = one request across services (where).",
        used: ["Debugging", "Capacity planning", "Latency analysis"],
        tradeoff: "Each costs storage and instrumentation effort.",
        examples: ["ELK / Splunk (logs)", "Prometheus/Datadog (metrics)", "Jaeger/OTel (traces)"],
        diagram: `flowchart TB
  SVC["Services"] --> L["Logs<br/>what happened"]
  SVC --> M["Metrics<br/>QPS · latency · errors"]
  SVC --> T["Traces<br/>request across services"]
  L & M & T --> O["Observability stack"]`,
        note: "Start with metrics for alerting, add traces to find where, logs to find why.",
      },
      {
        type: "card",
        id: "tracing",
        title: "Distributed Tracing",
        chip: "follow request",
        tagline: "Follow one request as it hops across many services.",
        problem: "In microservices, a slow request could be slow in any of a dozen services.",
        how: "A trace id propagates through every call; spans record each hop's timing.",
        used: ["Latency breakdown", "Dependency mapping", "Root-cause analysis"],
        tradeoff: "Requires consistent context propagation everywhere.",
        examples: ["OpenTelemetry", "Jaeger", "Zipkin"],
        diagram: `flowchart LR
  GW["Gateway (trace: abc)"] --> A["Service A · span 1"]
  A --> B["Service B · span 2"]
  A --> C["Service C · span 3"]
  C --> D["DB · span 4"]`,
        note: "One trace id ties every span together so you can see the full waterfall.",
      },
      {
        type: "card",
        id: "alerting",
        title: "Alerting & SLI/SLO/SLA",
        chip: "be notified",
        tagline: "Notify humans when health crosses thresholds — tied to objectives.",
        problem: "Dashboards no one watches don't prevent outages.",
        how: "SLIs are measured; SLOs are targets; alerts fire when SLOs are at risk; SLAs are contracts.",
        used: ["On-call", "Error-budget policy", "Reliability targets"],
        tradeoff: "Too many alerts cause fatigue; too few miss incidents.",
        examples: ["PagerDuty", "Datadog monitors", "CloudWatch alarms"],
        diagram: `flowchart LR
  SLI["SLI: measured (e.g. p99 latency)"] --> SLO["SLO: target (p99 < 300ms)"]
  SLO -->|at risk| AL["Alert → on-call"]
  SLA["SLA: contractual promise"] -.based on.-> SLO`,
        note: "SLI = indicator, SLO = your goal, SLA = the promise to customers.",
      },
      {
        type: "card",
        id: "dashboards",
        title: "Dashboards & Runbooks",
        chip: "operate",
        tagline: "Visualize health and document how to respond.",
        problem: "During incidents, scattered knowledge slows recovery.",
        how: "Dashboards show trends; runbooks give step-by-step response procedures.",
        used: ["Incident response", "Daily health checks", "On-call onboarding"],
        tradeoff: "Stale dashboards/runbooks mislead — they need maintenance.",
        examples: ["Grafana / Kibana", "Incident runbook", "DB failover playbook"],
        diagram: `flowchart LR
  M["Metrics"] --> DASH["Dashboard"]
  ALERT["Alert fires"] --> RB["Runbook"]
  RB --> STEP1["1. Check X"] --> STEP2["2. Mitigate"] --> STEP3["3. Escalate"]`,
        note: "A good runbook lets a half-asleep on-call engineer act correctly at 3am.",
      },
      {
        type: "card",
        id: "deployments",
        title: "Canary, Blue-Green & Feature Flags",
        chip: "safe release",
        tagline: "Roll out changes safely and roll back instantly.",
        problem: "Shipping to 100% at once turns a bug into a full outage.",
        how: "Canary sends a small % to the new version; blue-green swaps environments; flags toggle behavior without deploy.",
        used: ["Risk-limited releases", "Instant rollback", "Gradual exposure"],
        tradeoff: "More release machinery and config to manage.",
        examples: ["5% canary", "Blue/green target swap", "LaunchDarkly / Unleash"],
        diagram: `flowchart TB
  T["Traffic"] --> S{"Router"}
  S -->|95%| OLD["v1 (stable)"]
  S -->|5%| NEW["v2 (canary)"]
  NEW -. healthy .-> PROMOTE["Ramp to 100%"]
  NEW -. errors .-> ROLLBACK["Roll back"]`,
        note: "Feature flags decouple deploy from release — ship dark, enable when ready.",
      },
    ],
  },

  /* ============================================================= 14 */
  {
    id: "data-patterns",
    num: "14",
    cat: "--c-patterns",
    title: "Common Data Patterns",
    intro:
      "Battle-tested patterns for caching, separating reads from writes, and coordinating distributed transactions.",
    topics: [
      {
        type: "card",
        id: "cache-patterns",
        title: "Cache Read/Write Patterns",
        chip: "4 patterns",
        tagline: "Cache-aside, read-through, write-through, write-back — when and why.",
        problem: "Where does cache population and invalidation logic live?",
        how: "Cache-aside: app loads on miss. Read-through: cache loads on miss. Write-through: write cache+DB together. Write-back: write cache now, DB later.",
        used: ["Cache-aside: most general", "Write-through: read-after-write", "Write-back: write-heavy"],
        tradeoff: "Write-back risks data loss; write-through adds write latency.",
        examples: ["App checks Redis then PG (aside)", "Buffer writes then flush (back)"],
        diagram: `flowchart TB
  subgraph CacheAside
    A1["App"] -->|miss| DBa[("DB")]
    DBa --> A1
    A1 --> Ca["Cache"]
  end
  subgraph WriteThrough
    A2["App"] --> Cb["Cache"] --> DBb[("DB")]
  end
  subgraph WriteBack
    A3["App"] --> Cc["Cache"] -. async flush .-> DBc[("DB")]
  end`,
        note: "Default to cache-aside; reach for write-through/back only with a clear reason.",
      },
      {
        type: "card",
        id: "cqrs",
        title: "CQRS",
        chip: "split R/W",
        tagline: "Separate the read model from the write model.",
        problem: "One model optimized for writes is often bad for complex reads (and vice versa).",
        how: "Commands update the write store; a separate, denormalized read store serves queries.",
        used: ["Read-heavy + complex queries", "Different read/write scaling"],
        tradeoff: "Better scaling flexibility, more system complexity & eventual consistency.",
        examples: ["Write service + read-optimized feed service"],
        diagram: `flowchart LR
  CMD["Commands (writes)"] --> WM["Write model"]
  WM -->|events/sync| RM["Read model (denormalized)"]
  QRY["Queries (reads)"] --> RM`,
        note: "CQRS shines when reads and writes have very different shapes and scale.",
      },
      {
        type: "card",
        id: "event-sourcing",
        title: "Event Sourcing",
        chip: "events as truth",
        tagline: "Store the sequence of events as the source of truth.",
        problem: "Storing only current state loses history and the 'why' behind changes.",
        how: "Append immutable events; rebuild state by replaying them; snapshot for speed.",
        used: ["Audit-heavy domains", "Financial ledgers", "Temporal queries"],
        tradeoff: "Replay and schema evolution can be operationally harder.",
        examples: ["Balance from ledger events", "Order history as domain events"],
        diagram: `flowchart LR
  E1["Created"] --> E2["ItemAdded"] --> E3["Paid"] --> E4["Shipped"]
  E1 & E2 & E3 & E4 --> STATE["Current state (replay)"]
  SNAP["Snapshot"] -.speeds up.-> STATE`,
        note: "The event log is the truth; current state is just a cached projection of it.",
      },
      {
        type: "card",
        id: "saga",
        title: "Saga",
        chip: "distributed txn",
        tagline: "Coordinate multi-step distributed transactions with compensating actions.",
        problem: "You can't hold one ACID transaction across multiple services/databases.",
        how: "Each step commits locally; if a later step fails, prior steps run compensating actions to undo.",
        used: ["Order → payment → inventory flows", "Cross-service workflows"],
        tradeoff: "Complex failure and compensation scenarios.",
        examples: ["Order/payment/inventory with rollback", "Orchestrated or choreographed sagas"],
        diagram: `sequenceDiagram
  participant O as Order
  participant P as Payment
  participant I as Inventory
  O->>P: charge
  P-->>O: ok
  O->>I: reserve stock
  I-->>O: FAIL
  O->>P: compensate (refund)
  Note over O,I: each step undone by a compensating action`,
        note: "Sagas trade atomicity for availability — design every compensating step explicitly.",
      },
    ],
  },

  /* ============================================================= 15 */
  {
    id: "interview-map",
    num: "15",
    cat: "--c-interview",
    title: "The Interview Component Map",
    intro:
      "A repeatable checklist and answer framework. Walk these in order and you'll never freeze on a system design question.",
    topics: [
      {
        type: "card",
        id: "component-checklist",
        title: "The 18-Point Design Checklist",
        chip: "walk this",
        tagline: "From client to scaling plan — the order to reason through any design.",
        problem: "Under pressure it's easy to forget whole layers (security, async, scaling).",
        how: "Walk top-to-bottom: clients, DNS, CDN, WAF, LBs, gateway, services, cache, DB, search, object store, queues, auth, rate limiting, monitoring, replication/failover, sharding.",
        used: ["Whiteboard structure", "Self-review", "Teaching framework"],
        tradeoff: "Don't add every box — mention each, include what the problem needs.",
        examples: ["URL shortener", "Newsfeed", "Chat", "Rate limiter"],
        diagram: `flowchart TB
  A["1 Clients"] --> B["2 DNS"] --> C["3 CDN"] --> D["4 WAF"]
  D --> E["5 Global LB"] --> F["6 Regional LB"] --> G["7 API Gateway"]
  G --> H["8 App services"] --> I["9 Cache"] --> J["10 Primary DB"]
  H --> K["11 Search"] & L["12 Object store"] & M["13 Queue/Event bus"]
  N["14 Auth"] & O["15 Rate limit"] -.cross-cutting.-> G
  P["16 Monitoring"] & Q["17 Replication/Failover"] & R["18 Sharding/Scaling"] -.always.-> H`,
        note: "Touch every box verbally; deep-dive only the 3-4 the problem actually stresses.",
      },
      {
        type: "card",
        id: "answer-template",
        title: "The Per-Component Answer Template",
        chip: "say it like this",
        tagline: "For every component: Problem → Component → How → Why here → Tradeoff → Mitigation.",
        problem: "Naming technologies isn't enough; interviewers want reasoning.",
        how: "State the problem, the component, how it works, why it fits, one tradeoff, and one mitigation.",
        used: ["Every component you introduce", "Turning memorization into reasoning"],
        tradeoff: "Takes discipline — but it's what separates strong candidates.",
        examples: ['"I add a CDN because image traffic is global and read-heavy…"'],
        diagram: `flowchart LR
  P["1 Problem"] --> C["2 Component"] --> H["3 How it works"]
  H --> W["4 Why it fits here"] --> T["5 One tradeoff"] --> M["6 One mitigation"]`,
        note: 'Example: "CDN → caches images near users → tradeoff is invalidation → mitigate by versioning URLs."',
      },
    ],
  },

  /* ============================================================= 16 */
  {
    id: "tradeoffs",
    num: "16",
    cat: "--c-interview",
    title: "High-Value Tradeoffs & Final Advice",
    intro:
      "The tradeoffs interviewers reward, and the single habit that turns a memorized answer into a real engineering discussion. Every choice should connect to: latency, throughput, scale, availability, consistency, cost, security, or operational complexity.",
    type: "notes",
    topics: [
      { type: "note", title: "SQL vs NoSQL", kv: "correctness ↔ scale", meaning: "SQL for transactions and relational queries; NoSQL for massive scale and simple access patterns." },
      { type: "note", title: "Cache vs Database", kv: "speed ↔ durability", meaning: "Cache improves speed; the database gives durability and correctness. Cache is a copy, not the truth." },
      { type: "note", title: "Sync vs Async", kv: "simplicity ↔ resilience", meaning: "Sync is simpler for user-facing critical paths; async improves latency and resilience for background work." },
      { type: "note", title: "Monolith vs Microservices", kv: "speed-now ↔ scale-later", meaning: "Monolith is simpler initially; microservices help team and scaling boundaries as you grow." },
      { type: "note", title: "Strong vs Eventual", kv: "correctness ↔ availability", meaning: "Strong consistency gives correctness; eventual consistency improves availability and scale." },
      { type: "note", title: "Push vs Poll", kv: "efficiency ↔ simplicity", meaning: "Push is efficient for realtime updates; poll is simpler but wastes requests." },
      { type: "note", title: "Stateful vs Stateless", kv: "scale ↔ connection", meaning: "Stateless scales easily; stateful may be necessary for realtime or connection-heavy systems." },
      { type: "note", title: "Vertical vs Horizontal", kv: "simple ↔ unlimited", meaning: "Vertical is easy early but capped; horizontal scales far but needs distributed design." },
      { type: "note", title: "The Golden Habit", kv: "connect every choice", meaning: "Never just name a technology. Tie each choice to latency, throughput, scale, availability, consistency, cost, security, or operational complexity." },
    ],
  },
];

/* Compact one-line glossary used by search + the interview toolkit. */
window.HLD_GLOSSARY = [
  ["DNS", "maps domain names to service endpoints"],
  ["CDN", "caches content near users"],
  ["Edge compute", "runs lightweight code near users"],
  ["Reverse proxy", "front server that forwards requests to backends"],
  ["Global load balancer", "routes traffic across regions"],
  ["Regional load balancer", "distributes traffic within a region"],
  ["WAF", "filters malicious web traffic"],
  ["API gateway", "front door for APIs with auth/rate limiting/routing"],
  ["BFF", "client-specific backend layer"],
  ["Monolith", "one deployable application unit"],
  ["Microservice", "independently deployable service with one bounded context"],
  ["Container", "packaged isolated runtime unit"],
  ["Serverless", "event-driven code execution without server management"],
  ["Cache", "fast temporary storage for hot data"],
  ["Redis", "in-memory store for cache, counters, sessions, and locks"],
  ["SQL DB", "relational transactional database"],
  ["NoSQL DB", "scalable non-relational database"],
  ["Document store", "JSON-like flexible database"],
  ["Wide-column store", "distributed store for large sparse/write-heavy data"],
  ["Graph DB", "database optimized for relationships"],
  ["Time-series DB", "database optimized for time-based metrics/events"],
  ["Search engine", "full-text indexing and ranking system"],
  ["Object storage", "durable blob/file storage"],
  ["Data warehouse", "analytics-focused storage for large aggregations"],
  ["Queue", "async task buffer"],
  ["Pub/Sub", "event fan-out to many consumers"],
  ["Stream processor", "realtime event processing engine"],
  ["Authentication", "verify identity"],
  ["Authorization", "verify permissions"],
  ["JWT", "signed token carrying identity claims"],
  ["Rate limiting", "restrict request frequency"],
  ["Replication", "keep multiple copies of data"],
  ["Sharding", "split data across partitions"],
  ["Failover", "switch to backup on failure"],
  ["Idempotency", "safe retry without duplicate effect"],
  ["Circuit breaker", "stop calling failing dependency temporarily"],
  ["Tracing", "track a request across services"],
];

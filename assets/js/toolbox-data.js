/* =====================================================================
   TOOLBOX DATA — the catalog of real services/frameworks to build with,
   grouped by job, each with "use when / avoid when / managed option".
   Plus decision diagrams to pick the right tool fast.
   ===================================================================== */
window.TOOLBOX = {
  decisions: [
    {
      title: "Which database should I pick?",
      src: `flowchart TD
  S["What does the data look like?"] --> R{"Strong relations<br/>+ transactions?"}
  R -->|Yes| SQL["Relational: PostgreSQL / MySQL<br/>Aurora · Spanner · CockroachDB"]
  R -->|No| Q2{"Access pattern?"}
  Q2 -->|"Key lookups,<br/>huge scale"| KV["Key-Value: DynamoDB · Redis<br/>Aerospike"]
  Q2 -->|"Flexible JSON<br/>documents"| DOC["Document: MongoDB · Firestore"]
  Q2 -->|"Write-heavy,<br/>time-ordered"| WC["Wide-column: Cassandra · Scylla · HBase"]
  Q2 -->|"Relationships<br/>are the query"| GR["Graph: Neo4j · Neptune"]
  Q2 -->|"Metrics over<br/>time"| TS["Time-series: InfluxDB · Timescale"]
  Q2 -->|"Full-text<br/>search"| SE["Search: Elasticsearch · OpenSearch"]`,
      note: "Default to relational. Reach for a specialized store only when an access pattern demands it.",
    },
    {
      title: "Which compute model?",
      src: `flowchart TD
  C["What are you running?"] --> A{"Event-driven &<br/>spiky / short tasks?"}
  A -->|Yes| L["Serverless: AWS Lambda · Cloud Functions<br/>Cloudflare Workers (edge)"]
  A -->|No| B{"Containerized<br/>microservices?"}
  B -->|"Yes, want<br/>no servers"| F["Serverless containers: AWS Fargate"]
  B -->|"Yes, need<br/>full control"| K["Orchestrator: Kubernetes (EKS/GKE/AKS)<br/>or Amazon ECS"]
  B -->|"No, legacy /<br/>full OS"| V["Virtual machines: EC2 · GCE · Azure VM"]`,
      note: "Lambda for glue & bursts, Fargate for simple containers, Kubernetes/ECS for fleets, EC2 for full control.",
    },
    {
      title: "Which messaging system?",
      src: `flowchart TD
  M["What do you need?"] --> A{"Replayable event log<br/>+ high throughput?"}
  A -->|Yes| K["Apache Kafka · Amazon Kinesis<br/>Google Pub/Sub"]
  A -->|No| B{"Simple task queue,<br/>fully managed?"}
  B -->|Yes| SQS["Amazon SQS"]
  B -->|"Need routing /<br/>complex topologies"| R["RabbitMQ"]
  M --> C{"Fan-out one event<br/>to many subscribers?"}
  C -->|Yes| SNS["Amazon SNS · Kafka topic · Pub/Sub"]`,
      note: "Kafka = durable replayable stream. SQS = managed queue. RabbitMQ = flexible routing. SNS = fan-out.",
    },
  ],

  groups: [
    {
      id: "tb-cache",
      num: "01",
      cat: "--c-cache",
      title: "Caching & In-Memory",
      intro: "Sub-millisecond reads, counters, sessions, and rate limiting. Cache shields expensive backends.",
      items: [
        { name: "Redis", role: "In-memory store with rich data structures", use: ["Cache hot data", "Sessions, rate limiting, leaderboards", "Distributed locks, pub/sub, streams"], avoid: ["Working set far bigger than RAM", "Primary durable system of record"], cloud: "Amazon ElastiCache / MemoryDB, Redis Enterprise" },
        { name: "Memcached", role: "Simple, multi-threaded key-value cache", use: ["Pure, stateless caching", "Very high throughput, simple values"], avoid: ["Need data structures or persistence", "Need pub/sub or replication features"], cloud: "Amazon ElastiCache for Memcached" },
        { name: "Hazelcast / Ignite", role: "Distributed in-memory data grid", use: ["In-memory compute + caching together", "JVM-centric clustered caching"], avoid: ["Simple cache needs (overkill)"], cloud: "Hazelcast Cloud" },
        { name: "CDN edge cache", role: "Cache content close to users", use: ["Static assets, media, public GET APIs"], avoid: ["Highly personalized responses"], cloud: "CloudFront, Cloudflare, Akamai, Fastly" },
      ],
    },
    {
      id: "tb-sql",
      num: "02",
      cat: "--c-storage",
      title: "Relational Databases (SQL)",
      intro: "Structured data, transactions, joins, and integrity. The safe default for most systems.",
      items: [
        { name: "PostgreSQL", role: "Powerful open-source relational DB", use: ["Transactions, complex queries, JSONB", "Most general-purpose workloads"], avoid: ["Massive horizontal write scale alone"], cloud: "Amazon RDS / Aurora PostgreSQL, Cloud SQL" },
        { name: "MySQL", role: "Popular open-source relational DB", use: ["Read-heavy web apps", "Mature replication ecosystem"], avoid: ["Heavy analytical workloads"], cloud: "Amazon RDS / Aurora MySQL, Cloud SQL" },
        { name: "Amazon Aurora", role: "Cloud-native MySQL/PostgreSQL-compatible", use: ["Managed, auto-scaling storage, fast failover", "Read replicas at scale"], avoid: ["Multi-cloud portability needs"], cloud: "AWS managed" },
        { name: "CockroachDB / Spanner", role: "Distributed SQL, horizontal scale", use: ["Global, strongly-consistent transactions", "Scale writes beyond one node"], avoid: ["Small single-region apps (cost/complexity)"], cloud: "Cockroach Cloud, Google Cloud Spanner" },
      ],
    },
    {
      id: "tb-nosql",
      num: "03",
      cat: "--c-storage",
      title: "NoSQL Databases",
      intro: "Scale, flexible schemas, and write-heavy or key-based access patterns.",
      items: [
        { name: "DynamoDB", role: "Managed key-value / document store", use: ["Predictable single-digit-ms at any scale", "Serverless, pay-per-use, carts/sessions/metadata"], avoid: ["Ad-hoc queries, complex joins", "Unknown access patterns"], cloud: "AWS managed" },
        { name: "MongoDB", role: "Document database (JSON-like)", use: ["Flexible/evolving schemas", "Content, catalogs, nested data"], avoid: ["Multi-document ACID-heavy finance"], cloud: "MongoDB Atlas, Amazon DocumentDB" },
        { name: "Cassandra / ScyllaDB", role: "Wide-column, write-optimized", use: ["Massive write throughput", "Time-series-like, multi-region"], avoid: ["Strong consistency by default", "Ad-hoc queries"], cloud: "Amazon Keyspaces, Astra DB" },
        { name: "HBase", role: "Wide-column on Hadoop/HDFS", use: ["Huge sparse datasets in Hadoop ecosystems"], avoid: ["Low-latency simple apps"], cloud: "Amazon EMR HBase" },
      ],
    },
    {
      id: "tb-search",
      num: "04",
      cat: "--c-data",
      title: "Search & Analytics Stores",
      intro: "Full-text search, relevance ranking, and fast analytical aggregations.",
      items: [
        { name: "Elasticsearch / OpenSearch", role: "Full-text search + log analytics", use: ["Product/document/log search", "Faceting, relevance ranking"], avoid: ["System of record (it's a secondary index)"], cloud: "Amazon OpenSearch Service, Elastic Cloud" },
        { name: "ClickHouse", role: "Columnar OLAP database", use: ["Real-time analytics on huge datasets", "Fast aggregations / dashboards"], avoid: ["Transactional row updates"], cloud: "ClickHouse Cloud" },
        { name: "Apache Druid / Pinot", role: "Real-time analytics datastore", use: ["Sub-second analytics on streaming data", "User-facing analytics"], avoid: ["General-purpose storage"], cloud: "Imply, StarTree" },
      ],
    },
    {
      id: "tb-object",
      num: "05",
      cat: "--c-storage",
      title: "Object, Blob & File Storage",
      intro: "Durable, cheap storage for images, video, backups, and data-lake raw files.",
      items: [
        { name: "Amazon S3", role: "Durable object storage", use: ["Images, video, backups, static sites", "Data-lake landing zone"], avoid: ["Low-latency transactional updates"], cloud: "AWS managed (GCS, Azure Blob equivalents)" },
        { name: "Google Cloud Storage / Azure Blob", role: "Object storage", use: ["Same role on GCP / Azure"], avoid: ["Row-level updates"], cloud: "Managed" },
        { name: "HDFS", role: "Distributed file system", use: ["On-prem big-data / Spark / Hadoop"], avoid: ["Cloud-native greenfield (prefer object storage)"], cloud: "Amazon EMR" },
      ],
    },
    {
      id: "tb-warehouse",
      num: "06",
      cat: "--c-data",
      title: "Data Warehouse & Lake",
      intro: "Analytical querying and ML over large historical datasets (OLAP, not OLTP).",
      items: [
        { name: "Snowflake", role: "Cloud data warehouse", use: ["BI, analytics, separation of storage/compute", "Multi-cloud"], avoid: ["High-QPS transactional serving"], cloud: "SaaS" },
        { name: "BigQuery", role: "Serverless data warehouse", use: ["Pay-per-query analytics on GCP", "Massive scans"], avoid: ["Transactional workloads"], cloud: "Google Cloud" },
        { name: "Amazon Redshift", role: "Managed data warehouse", use: ["AWS-native analytics & BI"], avoid: ["High-concurrency OLTP"], cloud: "AWS" },
        { name: "Databricks / Delta Lake", role: "Lakehouse (lake + warehouse)", use: ["ML pipelines + analytics on a lake", "Unify batch + streaming"], avoid: ["Simple reporting (heavier)"], cloud: "Databricks on AWS/Azure/GCP" },
      ],
    },
    {
      id: "tb-messaging",
      num: "07",
      cat: "--c-messaging",
      title: "Messaging, Queues & Streaming",
      intro: "Decouple producers from consumers, absorb spikes, and build event-driven systems.",
      items: [
        { name: "Apache Kafka", role: "Distributed, durable event log", use: ["High-throughput event streaming", "Replayable events, multiple consumers", "Event sourcing / CDC backbone"], avoid: ["Simple task queue (overkill)", "Tiny apps with little ops capacity"], cloud: "Amazon MSK, Confluent Cloud" },
        { name: "Amazon SQS", role: "Fully-managed message queue", use: ["Simple async task buffering", "Decouple services, no ops"], avoid: ["Replay / streaming analytics", "Strict ordering at high scale (use FIFO carefully)"], cloud: "AWS managed" },
        { name: "Amazon SNS", role: "Pub/sub fan-out", use: ["Broadcast one event to many subscribers", "SQS fan-out, notifications"], avoid: ["Durable replay / log semantics"], cloud: "AWS managed" },
        { name: "RabbitMQ", role: "Flexible message broker", use: ["Complex routing (exchanges, topics)", "Per-message acknowledgement workflows"], avoid: ["Massive replayable streams (use Kafka)"], cloud: "Amazon MQ, CloudAMQP" },
        { name: "Amazon Kinesis / Pub/Sub", role: "Managed streaming", use: ["Managed Kafka-like streaming on AWS/GCP", "Real-time ingestion pipelines"], avoid: ["When you need Kafka ecosystem tooling"], cloud: "AWS / GCP managed" },
        { name: "NATS", role: "Lightweight high-speed messaging", use: ["Low-latency microservice messaging", "Edge / IoT"], avoid: ["Long-term durable log of record"], cloud: "Synadia" },
      ],
    },
    {
      id: "tb-stream",
      num: "08",
      cat: "--c-messaging",
      title: "Stream Processing",
      intro: "Compute over continuous event streams in near real time.",
      items: [
        { name: "Apache Flink", role: "Stateful stream processor", use: ["Low-latency, exactly-once stateful processing", "Complex windowing, fraud detection"], avoid: ["Simple ETL (heavier ops)"], cloud: "Amazon Kinesis Data Analytics, Ververica" },
        { name: "Kafka Streams", role: "Stream library on Kafka", use: ["Transformations inside a Kafka app", "No separate cluster needed"], avoid: ["Non-Kafka sources"], cloud: "Runs with MSK / Confluent" },
        { name: "Spark Structured Streaming", role: "Micro-batch streaming", use: ["Unify batch + streaming, ML pipelines"], avoid: ["Ultra-low-latency (<100ms) needs"], cloud: "Databricks, EMR, Dataproc" },
      ],
    },
    {
      id: "tb-compute",
      num: "09",
      cat: "--c-compute",
      title: "Compute: Containers & Orchestration",
      intro: "Where your services run, scale, and self-heal.",
      items: [
        { name: "Kubernetes (EKS/GKE/AKS)", role: "Container orchestrator", use: ["Many microservices, portability", "Fine-grained control, autoscaling, rollouts"], avoid: ["Small teams without ops capacity"], cloud: "Amazon EKS, Google GKE, Azure AKS" },
        { name: "Amazon ECS", role: "AWS-native container orchestrator", use: ["Containers on AWS without K8s complexity", "Deep AWS integration"], avoid: ["Multi-cloud portability"], cloud: "AWS managed" },
        { name: "AWS Fargate", role: "Serverless containers", use: ["Run containers without managing nodes", "Spiky or simple workloads"], avoid: ["Maximum cost efficiency at steady high scale"], cloud: "AWS (works with ECS/EKS)" },
        { name: "Docker", role: "Container packaging", use: ["Package app + deps as image", "Consistent dev → prod"], avoid: ["Nothing — it's the base unit"], cloud: "ECR / registries" },
        { name: "Nomad", role: "Simple orchestrator", use: ["Mixed workloads (containers + binaries)", "Simpler than K8s"], avoid: ["Need the huge K8s ecosystem"], cloud: "HashiCorp" },
      ],
    },
    {
      id: "tb-serverless",
      num: "10",
      cat: "--c-compute",
      title: "Compute: Serverless & VMs",
      intro: "Event-driven functions, orchestration, and raw virtual machines.",
      items: [
        { name: "AWS Lambda", role: "Functions as a service", use: ["Event-driven, spiky, short tasks", "Glue between services, lightweight APIs"], avoid: ["Long-running jobs, cold-start-sensitive paths"], cloud: "AWS (Cloud Functions, Azure Functions)" },
        { name: "AWS Step Functions", role: "Serverless workflow orchestration", use: ["Coordinate multi-step Lambda workflows", "Sagas, retries, state machines"], avoid: ["Ultra-high-frequency simple calls"], cloud: "AWS managed" },
        { name: "Cloudflare Workers", role: "Edge serverless", use: ["Logic at the edge, ultra-low latency", "Redirects, auth, A/B at POPs"], avoid: ["Heavy compute / large memory"], cloud: "Cloudflare, Lambda@Edge" },
        { name: "EC2 / GCE / Azure VM", role: "Virtual machines", use: ["Full OS control, legacy apps", "Custom kernels, GPUs, steady workloads"], avoid: ["When you want zero server management"], cloud: "Managed IaaS" },
      ],
    },
    {
      id: "tb-edge",
      num: "11",
      cat: "--c-api",
      title: "API, Load Balancing & Edge",
      intro: "The front door: route, balance, terminate TLS, and protect.",
      items: [
        { name: "Amazon API Gateway", role: "Managed API front door", use: ["REST/HTTP/WebSocket APIs", "Auth, throttling, usage plans"], avoid: ["Ultra-low-latency internal calls (adds hop)"], cloud: "AWS managed" },
        { name: "ALB / NLB", role: "Application / Network load balancer", use: ["ALB: HTTP routing, path/host rules", "NLB: TCP/UDP, extreme performance"], avoid: ["Cross-region (use global LB)"], cloud: "AWS Elastic Load Balancing" },
        { name: "CloudFront / Cloudflare", role: "CDN + edge", use: ["Cache + accelerate global traffic", "DDoS protection, TLS termination"], avoid: ["Dynamic uncacheable-only APIs (limited benefit)"], cloud: "Managed CDN" },
        { name: "NGINX / Envoy", role: "Reverse proxy / data plane", use: ["Self-managed routing, TLS, gateways", "Envoy: service mesh data plane"], avoid: ["When a managed gateway suffices"], cloud: "Self-hosted, Envoy in Istio" },
        { name: "Kong / Apigee", role: "API management", use: ["Public API products, plugins, dev portals"], avoid: ["Tiny internal-only setups"], cloud: "Kong Cloud, Google Apigee" },
      ],
    },
    {
      id: "tb-coord",
      num: "12",
      cat: "--c-consist",
      title: "Coordination & Configuration",
      intro: "Leader election, distributed locks, service discovery, and dynamic config.",
      items: [
        { name: "Apache ZooKeeper", role: "Coordination service", use: ["Leader election, locks, metadata", "Kafka/HBase coordination"], avoid: ["Simple config (heavier ops)"], cloud: "Self-managed / MSK" },
        { name: "etcd", role: "Distributed key-value (Raft)", use: ["Kubernetes state, config, leader election", "Strong consistency"], avoid: ["Large blob storage"], cloud: "Backs Kubernetes" },
        { name: "HashiCorp Consul", role: "Service discovery + config", use: ["Service mesh, health, KV config"], avoid: ["When cloud-native discovery exists"], cloud: "HCP Consul" },
      ],
    },
    {
      id: "tb-observe",
      num: "13",
      cat: "--c-observe",
      title: "Observability & Operations",
      intro: "See system health: metrics, logs, traces, and alerts.",
      items: [
        { name: "Prometheus + Grafana", role: "Metrics + dashboards", use: ["Pull-based metrics, alerting", "Kubernetes monitoring"], avoid: ["Long-term high-cardinality storage (add Thanos/Mimir)"], cloud: "Amazon Managed Prometheus/Grafana" },
        { name: "Datadog", role: "All-in-one observability SaaS", use: ["Metrics + logs + traces + APM in one", "Fast setup"], avoid: ["Tight budgets at scale"], cloud: "SaaS" },
        { name: "ELK / OpenSearch", role: "Log aggregation & search", use: ["Centralized logs, search, Kibana dashboards"], avoid: ["Pure metrics (use Prometheus)"], cloud: "Elastic Cloud, Amazon OpenSearch" },
        { name: "OpenTelemetry + Jaeger", role: "Distributed tracing", use: ["Trace requests across microservices", "Vendor-neutral instrumentation"], avoid: ["Single-service apps"], cloud: "AWS X-Ray, Tempo" },
        { name: "PagerDuty", role: "On-call & incident alerting", use: ["Route alerts to on-call, escalation"], avoid: ["Tiny teams (start with simple alerts)"], cloud: "SaaS" },
      ],
    },
    {
      id: "tb-security",
      num: "14",
      cat: "--c-security",
      title: "Security, Identity & Secrets",
      intro: "Authentication, authorization, encryption keys, and protection.",
      items: [
        { name: "Amazon Cognito / Auth0 / Okta", role: "Identity & auth providers", use: ["User sign-up/sign-in, OAuth/OIDC, SSO", "Social + enterprise login"], avoid: ["Trivial single-app basic auth"], cloud: "Managed IdP" },
        { name: "AWS IAM", role: "Cloud access control", use: ["Fine-grained permissions for AWS resources", "Roles for services (least privilege)"], avoid: ["App-level user authz (use RBAC in app)"], cloud: "AWS" },
        { name: "AWS KMS / Secrets Manager / Vault", role: "Keys & secrets", use: ["Encryption keys, rotating secrets", "DB credentials, API keys, signing keys"], avoid: ["Hardcoding secrets — ever"], cloud: "AWS KMS/Secrets Manager, HashiCorp Vault" },
        { name: "AWS WAF / Shield", role: "Web protection", use: ["Block SQLi/XSS/bots, DDoS mitigation"], avoid: ["Replacing app-level validation"], cloud: "AWS, Cloudflare WAF" },
      ],
    },
    {
      id: "tb-cicd",
      num: "15",
      cat: "--c-reliab",
      title: "CI/CD & Infrastructure as Code",
      intro: "Ship safely and manage infrastructure declaratively.",
      items: [
        { name: "Terraform", role: "Cloud-agnostic IaC", use: ["Provision infra declaratively, multi-cloud"], avoid: ["When fully committed to one cloud's native IaC"], cloud: "HCP Terraform" },
        { name: "AWS CloudFormation / CDK", role: "AWS-native IaC", use: ["Deep AWS integration, CDK in real code"], avoid: ["Multi-cloud"], cloud: "AWS" },
        { name: "GitHub Actions / Jenkins", role: "CI/CD pipelines", use: ["Build, test, deploy automation"], avoid: ["Manual deploys at any real scale"], cloud: "GitHub, self-hosted Jenkins" },
        { name: "Argo CD", role: "GitOps for Kubernetes", use: ["Declarative deploys synced from Git", "Canary/blue-green on K8s"], avoid: ["Non-Kubernetes targets"], cloud: "Akuity" },
      ],
    },
  ],

  comparisons: [
    {
      title: "SQL vs NoSQL",
      headers: ["", "SQL (Relational)", "NoSQL"],
      rows: [
        ["Data model", "Tables, rows, fixed schema", "KV / document / wide-column / graph"],
        ["Transactions", "Strong ACID", "Often limited / eventual"],
        ["Scaling", "Vertical + read replicas", "Horizontal by design"],
        ["Queries", "Rich joins, ad-hoc", "Designed around access patterns"],
        ["Best for", "Payments, orders, relations", "Massive scale, simple access"],
      ],
    },
    {
      title: "Messaging: Kafka vs RabbitMQ vs SQS vs SNS",
      headers: ["", "Kafka", "RabbitMQ", "SQS", "SNS"],
      rows: [
        ["Type", "Event log / stream", "Broker / queue", "Managed queue", "Pub/sub fan-out"],
        ["Replay", "Yes (retained log)", "No", "No", "No"],
        ["Ordering", "Per partition", "Per queue", "FIFO option", "—"],
        ["Throughput", "Very high", "Moderate", "High", "High"],
        ["Best for", "Streaming, event sourcing", "Complex routing", "Simple async tasks", "One→many notify"],
      ],
    },
    {
      title: "Compute: Kubernetes vs Serverless vs VMs",
      headers: ["", "Kubernetes / ECS", "Serverless (Lambda)", "VMs (EC2)"],
      rows: [
        ["Unit", "Containers", "Functions", "Full machine"],
        ["Scaling", "Autoscale pods", "Auto, to zero", "Manual / ASG"],
        ["Ops effort", "High", "Very low", "Medium-high"],
        ["Cold starts", "No", "Yes", "No"],
        ["Best for", "Microservice fleets", "Spiky, event-driven", "Legacy, full control"],
      ],
    },
    {
      title: "Redis vs Memcached",
      headers: ["", "Redis", "Memcached"],
      rows: [
        ["Data types", "Rich (lists, sets, streams)", "Strings only"],
        ["Persistence", "Optional (AOF/RDB)", "None"],
        ["Replication", "Yes", "No"],
        ["Extras", "Pub/sub, locks, TTL, Lua", "Pure cache"],
        ["Best for", "Cache + sessions + queues + locks", "Simple, fast cache"],
      ],
    },
    {
      title: "Monolith vs Microservices",
      headers: ["", "Monolith", "Microservices"],
      rows: [
        ["Deployment", "One unit", "Many independent units"],
        ["Team scaling", "Harder as you grow", "Independent teams"],
        ["Complexity", "Low (local calls)", "High (distributed)"],
        ["Data", "Shared DB", "DB per service"],
        ["Best for", "Early / small teams", "Large orgs, independent scale"],
      ],
    },
  ],
};

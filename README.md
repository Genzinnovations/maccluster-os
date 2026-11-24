# ⚡ MacCluster-OS: Dual-Mac AI Cluster over 40Gbps Thunderbolt

> **🚀 Build private AI infrastructure with zero cloud subscription fees.**  
> Looking for team API key budgets, PII redaction, and enterprise audit logs?  
> 👉 **[Check out PrivateGate Team Pro on Gumroad ($199)](https://flexion03.gumroad.com/l/ayfdgi)**  
> 🛒 **[Explore all GenZ Innovations Developer Tools](https://gumroad.com/flexion03)**

---

**MacCluster-OS** turns two Apple Silicon Macs (M1/M2/M3/M4) into a unified, high-performance local AI cluster connected over a 40Gbps Thunderbolt bridge with sub-millisecond failover.

Run heavy 14B–32B models locally with **$0.00 cloud token cost**, zero internet latency, and automatic failover.

---

## 🏗️ Architecture

```text
                 +-----------------------------------+
                 |           Client / App            |
                 +-----------------+-----------------+
                                   |
                 HTTP Request (Port 11435)
                                   v
             +-------------------------------------------+
             |       MacCluster-OS Failover Proxy        |
             +---------------------+---------------------+
                                   |
                +------------------+------------------+
                | Primary                             | Fallback (<1ms)
                v                                     v
     +--------------------+               +--------------------+
     |    Node 1 (Local)  |               |  Node 2 (Worker)   |
     |    10.0.0.2:11434  | <-----------> |   10.0.0.1:11434   |
     |  (qwen2.5-coder)   |  Thunderbolt  |    (llama3.1 8B)   |
     +--------------------+     40Gbps    +--------------------+
```

---

## ⚡ Benchmarks: Thunderbolt 40Gbps vs Wi-Fi 6E

| Metric | Standard Wi-Fi 6E | 40Gbps Thunderbolt Bridge | Improvement |
| :--- | :--- | :--- | :--- |
| **Roundtrip Ping Latency** | 4.2ms – 12.8ms | **0.63ms – 0.72ms** | **~10x Faster** |
| **Throughput Bandwidth** | ~800 Mbps | **~32,000 Mbps (40Gbps)** | **40x Bandwidth** |
| **Inference Token Drop** | Packet jitter under load | **0% Jitter / Zero packet loss** | **Rock Solid** |

---

## 🚀 Quickstart (2 Minutes)

### Step 1: Connect Your Macs
Connect a standard Thunderbolt 3, 4, or 5 cable directly between the two Macs.

### Step 2: Configure the Cluster
On **Node 1 (Primary)**:
```bash
bash setup_cluster.sh primary
```

On **Node 2 (Worker)**:
```bash
bash setup_cluster.sh worker
```

### Step 3: Launch the Failover Proxy
```bash
npm install
npm start
```

### Step 4: Verify Cluster Health
Visit `http://localhost:11435/cluster/health` or query via curl:
```bash
curl http://localhost:11435/cluster/health
```

---

## 🔒 Enterprise & Team Use
For commercial teams requiring scoped API keys, PII data loss prevention, and token budget limits across departments:
- **[PrivateGate — Self-Hosted Team AI Gateway ($199)](https://flexion03.gumroad.com/l/ayfdgi)**

---

## 📄 License
MIT License. Built with pride by [GenZ Innovations LLC](https://github.com/Genzinnovations).

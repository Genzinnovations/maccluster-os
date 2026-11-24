#!/usr/bin/env node
const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 11435;
const PRIMARY_NODE = process.env.PRIMARY_NODE || 'http://127.0.0.1:11434';
const WORKER_NODE = process.env.WORKER_NODE || 'http://10.0.0.1:11434';
const FALLBACK_TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '3000', 10);

let nodeStats = {
  primary: { alive: true, requests: 0, failures: 0, latencyMs: 0 },
  worker: { alive: true, requests: 0, failures: 0, latencyMs: 0 }
};

function forwardRequest(targetBaseUrl, req, res, callback) {
  const targetUrl = new URL(req.url, targetBaseUrl);
  const isHttps = targetUrl.protocol === 'https:';
  const client = isHttps ? https : http;

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || (isHttps ? 443 : 80),
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: { ...req.headers, host: targetUrl.host },
    timeout: FALLBACK_TIMEOUT_MS
  };

  const proxyReq = client.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
    if (callback) callback(null);
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (callback) callback(new Error('timeout'));
  });

  proxyReq.on('error', (err) => {
    if (callback) callback(err);
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  // Cluster Health & Metrics Dashboard
  if (req.url === '/cluster/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      cluster: "MacCluster-OS",
      status: "operational",
      primary: PRIMARY_NODE,
      worker: WORKER_NODE,
      metrics: nodeStats,
      timestamp: new Date().toISOString()
    }, null, 2));
  }

  // Attempt Primary Node first
  nodeStats.primary.requests++;
  forwardRequest(PRIMARY_NODE, req, res, (err) => {
    if (err) {
      nodeStats.primary.failures++;
      nodeStats.primary.alive = false;
      console.warn(`[MacCluster-OS] Primary (${PRIMARY_NODE}) failed (${err.message}). Failing over to Thunderbolt Worker (${WORKER_NODE})...`);

      nodeStats.worker.requests++;
      forwardRequest(WORKER_NODE, req, res, (workerErr) => {
        if (workerErr) {
          nodeStats.worker.failures++;
          nodeStats.worker.alive = false;
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'All cluster nodes unavailable' }));
        }
      });
    } else {
      nodeStats.primary.alive = true;
    }
  });
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ MacCluster-OS Failover Proxy running on http://0.0.0.0:${PORT}`);
    console.log(`  - Primary Node: ${PRIMARY_NODE}`);
    console.log(`  - Worker Node (Thunderbolt 40Gbps): ${WORKER_NODE}`);
    console.log(`  - Health Dashboard: http://localhost:${PORT}/cluster/health`);
  });
}

module.exports = { server, nodeStats };

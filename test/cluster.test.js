const assert = require('assert');
const http = require('http');
const { server } = require('../src/proxy');

server.listen(11438, '127.0.0.1', () => {
  http.get('http://127.0.0.1:11438/cluster/health', (res) => {
    assert.strictEqual(res.statusCode, 200);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      assert.strictEqual(json.cluster, 'MacCluster-OS');
      assert.strictEqual(json.status, 'operational');
      console.log('✅ Automated E2E Test Passed: MacCluster-OS Health & Routing Verified!');
      server.close();
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
});

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const TEST_PORT = 3055;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let serverProcess;
let sessionCookie = '';

function startTestServer() {
  beforeAll((done) => {
    serverProcess = spawn('node', ['server.js'], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, PORT: TEST_PORT },
      stdio: 'ignore'
    });

    const interval = setInterval(() => {
      http.get(`${BASE_URL}/api/documents`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          done();
        }
      }).on('error', () => {});
    }, 100);
  }, 10000);

  afterAll((done) => {
    if (serverProcess) {
      serverProcess.kill();
    }
    done();
  });

  beforeEach(async () => {
    sessionCookie = '';
    await request('POST', '/api/reset');
  });
}

function request(method, pathUrl, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      ...headers,
      ...(sessionCookie ? { 'Cookie': sessionCookie } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    };

    const req = http.request(`${BASE_URL}${pathUrl}`, {
      method,
      headers: reqHeaders
    }, (res) => {
      if (res.headers['set-cookie']) {
        const rawCookie = res.headers['set-cookie'][0];
        sessionCookie = rawCookie.split(';')[0];
      }
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(raw); } catch (e) { parsed = raw; }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

module.exports = { startTestServer, request, BASE_URL };

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Resolves to dist/index.js relative to this test file
const DIST_INDEX = join(__dirname, '..', '..', 'dist', 'index.js');

const INITIALIZE_REQUEST = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-client', version: '0.0.0' }
  }
}) + '\n';

test('MCP handshake: positive case - server responds to initialize with valid JSON-RPC', async (t) => {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [DIST_INDEX], {
      env: { ...process.env, DIGISAC_TOKEN: 'test-token-xyz', DIGISAC_URL: 'https://test.digisac.co' },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdoutBuffer = '';
    let stderrBuffer = '';
    let resolved = false;
    let timeoutHandle;

    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk.toString();
      const lines = stdoutBuffer.split('\n');
      // Keep the last incomplete line in the buffer
      stdoutBuffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.trim() === '') continue;

        // Every non-empty line MUST be valid JSON
        let parsed;
        try {
          parsed = JSON.parse(line);
        } catch (err) {
          child.kill();
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutHandle);
            reject(new Error(`Non-JSON bytes on stdout: ${JSON.stringify(line)}`));
          }
          return;
        }

        // Look for the initialize response
        if (parsed.id === 1 && parsed.result !== undefined) {
          try {
            assert.equal(
              parsed.result?.serverInfo?.name,
              'mcp-digisac',
              `Expected serverInfo.name to be 'mcp-digisac', got: ${JSON.stringify(parsed.result?.serverInfo)}`
            );
            child.kill();
            if (!resolved) {
              resolved = true;
              clearTimeout(timeoutHandle);
              resolve(undefined);
            }
          } catch (assertErr) {
            child.kill();
            if (!resolved) {
              resolved = true;
              clearTimeout(timeoutHandle);
              reject(assertErr);
            }
          }
        }
      }
    });

    child.stderr.on('data', (chunk) => {
      stderrBuffer += chunk.toString();
    });

    child.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutHandle);
        reject(new Error(`Child process error: ${err.message}`));
      }
    });

    child.on('exit', (code, signal) => {
      if (!resolved && signal !== 'SIGTERM' && signal !== 'SIGKILL') {
        resolved = true;
        clearTimeout(timeoutHandle);
        reject(new Error(`Child exited unexpectedly: code=${code}, signal=${signal}, stderr=${stderrBuffer}`));
      }
    });

    // Send initialize request
    child.stdin.write(INITIALIZE_REQUEST);

    // Timeout safety - cleared in resolve/reject paths above
    timeoutHandle = setTimeout(() => {
      child.kill();
      if (!resolved) {
        resolved = true;
        reject(new Error(`Timeout: no initialize response within 5 seconds. stdout so far: ${JSON.stringify(stdoutBuffer)}`));
      }
    }, 5000);
  });
});

test('MCP handshake: negative case - missing DIGISAC_TOKEN exits code 1 with no stdout', async () => {
  await new Promise((resolve, reject) => {
    const env = { ...process.env };
    delete env.DIGISAC_TOKEN;

    const child = spawn(process.execPath, [DIST_INDEX], {
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Timeout: process did not exit within 3 seconds'));
    }, 3000);

    child.on('exit', (code) => {
      clearTimeout(timeout);
      try {
        assert.equal(code, 1, `Expected exit code 1, got ${code}`);
        assert.equal(stdoutData, '', `Expected empty stdout, got: ${JSON.stringify(stdoutData)}`);
        assert.ok(
          stderrData.includes('DIGISAC_TOKEN'),
          `Expected stderr to contain 'DIGISAC_TOKEN', got: ${JSON.stringify(stderrData)}`
        );
        resolve(undefined);
      } catch (err) {
        reject(err);
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Child process error: ${err.message}`));
    });
  });
});

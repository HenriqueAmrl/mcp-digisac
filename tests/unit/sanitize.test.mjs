import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DIST_CLIENT = join(__dirname, '..', '..', 'dist', 'client', 'digisac.js');

// Helper: run a snippet in a child process with controlled env
function runSanitizeTest(envOverrides, script) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, ...envOverrides };
    for (const [k, v] of Object.entries(envOverrides)) {
      if (v === undefined) delete env[k];
    }

    const child = spawn(process.execPath, ['--input-type=module'], {
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    child.on('exit', (code) => {
      resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() });
    });

    child.on('error', reject);

    child.stdin.write(script);
    child.stdin.end();
  });
}

test('sanitizeError: Pitfall 3 guard - with no DIGISAC_TOKEN, returns message unchanged (no [REDACTED] prefix)', async () => {
  // This tests the critical Pitfall 3: when token is undefined/empty,
  // a naive implementation using `raw.replace("", "[REDACTED]")` would
  // prepend [REDACTED] to every message. The correct guard is `if (!token) return raw`.
  const result = await runSanitizeTest(
    { DIGISAC_TOKEN: undefined },
    `import { sanitizeError } from ${JSON.stringify(DIST_CLIENT)};
const result = sanitizeError(new Error('plain message'));
console.log(result);`
  );

  assert.equal(result.code, 0, `Expected exit code 0, got ${result.code}. stderr: ${result.stderr}`);
  assert.equal(result.stdout, 'plain message', `Expected 'plain message', got: ${JSON.stringify(result.stdout)}`);
  assert.ok(
    !result.stdout.includes('[REDACTED]'),
    `Expected no [REDACTED] in output when token is not set, got: ${JSON.stringify(result.stdout)}`
  );
});

test('sanitizeError: replaces token in error message when DIGISAC_TOKEN is set', async () => {
  const result = await runSanitizeTest(
    { DIGISAC_TOKEN: 'secret123' },
    `import { sanitizeError } from ${JSON.stringify(DIST_CLIENT)};
const result = sanitizeError(new Error('failed: secret123 leaked'));
console.log(result);`
  );

  assert.equal(result.code, 0, `Expected exit code 0, got ${result.code}. stderr: ${result.stderr}`);
  assert.equal(
    result.stdout,
    'failed: [REDACTED] leaked',
    `Expected token replaced with [REDACTED], got: ${JSON.stringify(result.stdout)}`
  );
});

test('sanitizeError: handles non-Error input with token present', async () => {
  const result = await runSanitizeTest(
    { DIGISAC_TOKEN: 'secret123' },
    `import { sanitizeError } from ${JSON.stringify(DIST_CLIENT)};
const result = sanitizeError('no token here');
console.log(result);`
  );

  assert.equal(result.code, 0, `Expected exit code 0, got ${result.code}. stderr: ${result.stderr}`);
  assert.equal(
    result.stdout,
    'no token here',
    `Expected message unchanged, got: ${JSON.stringify(result.stdout)}`
  );
});

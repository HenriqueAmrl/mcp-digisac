import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DIST_CONFIG = join(__dirname, '..', '..', 'dist', 'config.js');

// Helper: run a small Node.js snippet in a child process with given env
function runConfigTest(envOverrides, script) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, ...envOverrides };
    // Remove keys explicitly set to undefined
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

test('loadConfig: exits with code 1 when DIGISAC_TOKEN is not set', async () => {
  const result = await runConfigTest(
    { DIGISAC_TOKEN: undefined },
    `import { loadConfig } from ${JSON.stringify(DIST_CONFIG)};
loadConfig();`
  );

  assert.equal(result.code, 1, `Expected exit code 1, got ${result.code}. stderr: ${result.stderr}`);
  assert.ok(
    result.stderr.includes('DIGISAC_TOKEN'),
    `Expected stderr to contain 'DIGISAC_TOKEN', got: ${JSON.stringify(result.stderr)}`
  );
  assert.equal(result.stdout, '', `Expected empty stdout, got: ${JSON.stringify(result.stdout)}`);
});

test('loadConfig: returns token and custom URL when both env vars are set', async () => {
  const result = await runConfigTest(
    { DIGISAC_TOKEN: 'abc', DIGISAC_URL: 'https://example.test' },
    `import { loadConfig } from ${JSON.stringify(DIST_CONFIG)};
const config = loadConfig();
console.log(JSON.stringify(config));`
  );

  assert.equal(result.code, 0, `Expected exit code 0, got ${result.code}. stderr: ${result.stderr}`);

  let config;
  try {
    config = JSON.parse(result.stdout);
  } catch {
    assert.fail(`Could not parse config JSON: ${JSON.stringify(result.stdout)}`);
  }

  assert.deepEqual(config, { token: 'abc', url: 'https://example.test' });
});

test('loadConfig: uses default URL when DIGISAC_URL is not set', async () => {
  const result = await runConfigTest(
    { DIGISAC_TOKEN: 'abc', DIGISAC_URL: undefined },
    `import { loadConfig } from ${JSON.stringify(DIST_CONFIG)};
const config = loadConfig();
console.log(JSON.stringify(config));`
  );

  assert.equal(result.code, 0, `Expected exit code 0, got ${result.code}. stderr: ${result.stderr}`);

  let config;
  try {
    config = JSON.parse(result.stdout);
  } catch {
    assert.fail(`Could not parse config JSON: ${JSON.stringify(result.stdout)}`);
  }

  assert.equal(config.token, 'abc');
  assert.equal(config.url, 'https://api.digisac.co');
});

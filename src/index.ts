#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { DigiSacClient, sanitizeError } from './client/digisac.js';

const config = loadConfig();
const client = new DigiSacClient(config.token, config.url);

const server = new McpServer(
  { name: 'mcp-digisac', version: '0.1.0' },
  { capabilities: {} }
);

server.registerTool(
  '_ping',
  {
    description: 'Internal connectivity probe. Calls a non-existent Digisac endpoint to validate the isError return path. Will be removed in a later phase.',
    inputSchema: {},
    annotations: { readOnlyHint: true }
  },
  async () => {
    try {
      await client.get('/__noop_does_not_exist__');
      return { content: [{ type: 'text' as const, text: 'pong' }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: 'text' as const, text: 'Error: ' + message }],
        isError: true
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('mcp-digisac started on stdio (PID ' + process.pid + ')');
}

main().catch((err: unknown) => {
  console.error('Fatal error:', sanitizeError(err));
  process.exit(1);
});

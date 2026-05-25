#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { DigiSacClient, sanitizeError } from './client/digisac.js';
import { registerAgentsTools } from './tools/agents.js';
import { registerContactsTools } from './tools/contacts.js';
import { registerTicketsTools } from './tools/tickets.js';
import { registerMessagesTools } from './tools/messages.js';

const config = loadConfig();
const client = new DigiSacClient(config.token, config.url);

const server = new McpServer(
  { name: 'mcp-digisac', version: '0.1.0' },
  { capabilities: {} }
);

registerAgentsTools(server, client);
registerContactsTools(server, client);
registerTicketsTools(server, client);
registerMessagesTools(server, client);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('mcp-digisac started on stdio (PID ' + process.pid + ')');
}

main().catch((err: unknown) => {
  console.error('Fatal error:', sanitizeError(err));
  process.exit(1);
});

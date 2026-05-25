import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DigiSacClient, sanitizeError } from '../client/digisac.js';
import { EmptyInput } from '../types/digisac.js';

export function registerAgentsTools(server: McpServer, client: DigiSacClient): void {
  server.registerTool(
    'list_agents',
    {
      description: 'List all agents (users) in the Digisac account. Returns agent IDs, names, and contact info. Call this first to resolve userId values returned by list_tickets.',
      inputSchema: EmptyInput,
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const data = await client.get('/api/v1/users');
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );

  server.registerTool(
    'list_departments',
    {
      description: 'List all departments (teams) in the Digisac account. Returns department IDs and names. Call this first to resolve departmentId values returned by list_tickets.',
      inputSchema: EmptyInput,
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const data = await client.get('/api/v1/departments');
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );
}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DigiSacClient, sanitizeError, buildJsonQuery } from '../client/digisac.js';
import { ListBotsInput, GetBotInput } from '../types/digisac.js';

export function registerBotsTools(server: McpServer, client: DigiSacClient): void {
  server.registerTool(
    'list_bots',
    {
      description: 'List all bots configured in the Digisac account. Returns bot IDs and names. Use get_bot to inspect a single bot configuration.',
      inputSchema: ListBotsInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const qs = buildJsonQuery(
          undefined,
          { page: input.page ?? 1, perPage: input.perPage ?? 50 }
        );
        const data = await client.getWithQueryString('/api/v1/bots', qs);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_bot',
    {
      description: 'Get full configuration of a single bot by ID, including flowJson, contexts, settings, and current version. Use list_bots to find bot IDs.',
      inputSchema: GetBotInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const data = await client.get(`/api/v1/bots/${input.id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );
}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DigiSacClient, sanitizeError, buildJsonQuery } from '../client/digisac.js';
import { ListServicesInput, GetServiceInput } from '../types/digisac.js';

export function registerServicesTools(server: McpServer, client: DigiSacClient): void {
  server.registerTool(
    'list_services',
    {
      description: 'List all configured channels (WhatsApp, Instagram, Telegram, etc.) with type and health status. Returns channel IDs, types, and connection status.',
      inputSchema: ListServicesInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const qs = buildJsonQuery(
          undefined,
          { page: input.page ?? 1, perPage: input.perPage ?? 50 }
        );
        const data = await client.getWithQueryString('/api/v1/services', qs);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_service',
    {
      description: 'Get full details of a configured channel by ID. Use list_services to find service IDs.',
      inputSchema: GetServiceInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const data = await client.get(`/api/v1/services/${input.id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );
}

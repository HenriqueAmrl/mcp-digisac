import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DigiSacClient, sanitizeError, buildJsonQuery } from '../client/digisac.js';
import { ListTagsInput, GetTagInput } from '../types/digisac.js';

export function registerTagsTools(server: McpServer, client: DigiSacClient): void {
  server.registerTool(
    'list_tags',
    {
      description: 'List all tags available in the Digisac account. Tags have a label and a background color and can be linked to contacts.',
      inputSchema: ListTagsInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const qs = buildJsonQuery(
          undefined,
          { page: input.page ?? 1, perPage: input.perPage ?? 50 }
        );
        const data = await client.getWithQueryString('/api/v1/tags', qs);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_tag',
    {
      description: 'Get full details of a single tag by ID, including label, color, departments, and linked contacts. Use list_tags to find tag IDs.',
      inputSchema: GetTagInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const data = await client.get(`/api/v1/tags/${input.id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );
}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DigiSacClient, sanitizeError, buildJsonQuery } from '../client/digisac.js';
import { ListContactsInput, SearchContactsInput, GetContactInput } from '../types/digisac.js';

export function registerContactsTools(server: McpServer, client: DigiSacClient): void {
  server.registerTool(
    'list_contacts',
    {
      description: 'List Digisac contacts with pagination. Use search_contacts to find a specific contact by name or phone.',
      inputSchema: ListContactsInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const qs = buildJsonQuery(
          undefined,
          { page: input.page ?? 1, perPage: input.perPage ?? 50 }
        );
        const data = await client.getWithQueryString('/api/v1/contacts', qs);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );

  server.registerTool(
    'search_contacts',
    {
      description: 'Search Digisac contacts by name (case-insensitive). Also searches alternativeName and internalName fields. Use for natural-language lookups such as finding a customer by name.',
      inputSchema: SearchContactsInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        // Escape SQL wildcard chars so user input cannot alter query semantics
        const term = input.query.replace(/[%_\\]/g, '\\$&');
        const where = {
          $or: [
            { name: { $iLike: `%${term}%` } },
            { alternativeName: { $iLike: `%${term}%` } },
            { internalName: { $iLike: `%${term}%` } },
          ],
        };
        const qs = buildJsonQuery(
          where,
          { page: input.page ?? 1, perPage: input.perPage ?? 50 }
        );
        const data = await client.getWithQueryString('/api/v1/contacts', qs);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_contact',
    {
      description: 'Get the full profile of a single contact by ID. Use list_contacts or search_contacts to find contact IDs.',
      inputSchema: GetContactInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const data = await client.get(`/api/v1/contacts/${input.id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );
}

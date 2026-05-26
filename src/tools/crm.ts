import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DigiSacClient, sanitizeError, buildJsonQuery } from '../client/digisac.js';
import { ListOrganizationsInput, GetOrganizationInput, ListPeopleInput, GetPersonInput } from '../types/digisac.js';

export function registerCrmTools(server: McpServer, client: DigiSacClient): void {
  server.registerTool(
    'list_organizations',
    {
      description: 'List CRM organizations in the Digisac account. Organizations are companies or accounts linked to contacts and people.',
      inputSchema: ListOrganizationsInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const qs = buildJsonQuery(
          undefined,
          { page: input.page ?? 1, perPage: input.perPage ?? 50 }
        );
        const data = await client.getWithQueryString('/api/v1/organizations', qs);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_organization',
    {
      description: 'Get full details of a single CRM organization by ID. Use list_organizations to find organization IDs.',
      inputSchema: GetOrganizationInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const data = await client.get(`/api/v1/organizations/${input.id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );

  server.registerTool(
    'list_people',
    {
      description: 'List CRM people in the Digisac account. People are individuals in the CRM, often linked to contacts and organizations.',
      inputSchema: ListPeopleInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const qs = buildJsonQuery(
          undefined,
          { page: input.page ?? 1, perPage: input.perPage ?? 50 }
        );
        const data = await client.getWithQueryString('/api/v1/people', qs);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_person',
    {
      description: 'Get full details of a single CRM person by ID. Use list_people to find person IDs.',
      inputSchema: GetPersonInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const data = await client.get(`/api/v1/people/${input.id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );
}

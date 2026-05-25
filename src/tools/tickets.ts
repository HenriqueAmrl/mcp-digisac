import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DigiSacClient, sanitizeError, buildJsonQuery } from '../client/digisac.js';
import { ListTicketsInput, GetTicketInput } from '../types/digisac.js';

export function registerTicketsTools(server: McpServer, client: DigiSacClient): void {
  server.registerTool(
    'list_tickets',
    {
      description: 'List support tickets from Digisac. Call list_agents and list_departments first to resolve userId and departmentId values. Supports filtering by open status, agent, department, contact, and ISO date range (startPeriod, endPeriod).',
      inputSchema: ListTicketsInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const where: Record<string, unknown> = {};
        if (input.isOpen !== undefined) where['isOpen'] = input.isOpen;
        if (input.userId) where['userId'] = input.userId;
        if (input.departmentId) where['departmentId'] = input.departmentId;
        if (input.contactId) where['contactId'] = input.contactId;

        const flatParams: Record<string, string | undefined> = {};
        if (input.startPeriod) flatParams['startPeriod'] = input.startPeriod;
        if (input.endPeriod) flatParams['endPeriod'] = input.endPeriod;

        const qs = buildJsonQuery(
          where,
          { page: input.page ?? 1, perPage: input.perPage ?? 50 },
          flatParams
        );
        const data = await client.getWithQueryString('/api/v1/tickets', qs);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_ticket',
    {
      description: 'Get full details of a single ticket by ID, including SLA metrics (ticketTime, waitingTime, messagingTime). Use list_tickets to find ticket IDs.',
      inputSchema: GetTicketInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const data = await client.get(`/api/v1/tickets/${input.id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );
}

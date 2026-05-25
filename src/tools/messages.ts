import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DigiSacClient, sanitizeError } from '../client/digisac.js';
import { GetTicketMessagesInput } from '../types/digisac.js';

export function registerMessagesTools(server: McpServer, client: DigiSacClient): void {
  server.registerTool(
    'get_ticket_messages',
    {
      description: 'Get conversation history for a ticket in chronological order. Use list_tickets or get_ticket to find a ticket ID.',
      inputSchema: GetTicketMessagesInput,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const params: Record<string, string | number | boolean | undefined> = {
          page: input.page ?? 1,
          limit: input.limit ?? 50,
          'where[ticketId]': input.ticketId,
        };
        const data = await client.get('/api/v1/messages', params);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );
}

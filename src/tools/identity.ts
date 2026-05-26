import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DigiSacClient, sanitizeError } from '../client/digisac.js';
import { EmptyInput } from '../types/digisac.js';

export function registerIdentityTools(server: McpServer, client: DigiSacClient): void {
  server.registerTool(
    'get_me',
    {
      description: 'Get the authenticated user profile, confirming the token identity. Returns name, email, status, account ID, and language. Note: the response also contains sensitive credential fields (internalChatToken, otpSecretKey) - treat the output accordingly when displaying it.',
      inputSchema: EmptyInput,
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const data = await client.get('/api/v1/me');
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: 'Error: ' + sanitizeError(err) }], isError: true };
      }
    }
  );
}

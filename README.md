# mcp-digisac

An MCP (Model Context Protocol) server that lets Claude Desktop, Claude Code, and other MCP-compatible AI clients query your Digisac account as read-only tools. Once configured, you can ask Claude to list your open tickets, look up contacts, retrieve conversation history, and check your team's departments - all without leaving the chat interface. You only need a Digisac API token and your account URL to get started.

## Tools

| Tool | Description |
|------|-------------|
| `list_agents` | List all agents/users in the Digisac account |
| `list_departments` | List all departments/teams in the Digisac account |
| `list_contacts` | List contacts (paginated) |
| `search_contacts` | Search contacts by name, phone, or email |
| `get_contact` | Get a contact's full profile by ID |
| `list_tickets` | List tickets with filters (status, agent, department, date range) |
| `get_ticket` | Get a single ticket with SLA metrics (ticketTime, waitingTime, messagingTime) |
| `get_ticket_messages` | Get the full message history for a ticket in chronological order |
| `list_services` | List all configured channels (WhatsApp, Instagram, Telegram, etc.) with type and health status |
| `get_service` | Get full details of a configured channel by ID |
| `list_tags` | List all tags in the account with label and background color |
| `get_tag` | Get full details of a single tag by ID |
| `list_ticket_topics` | List all ticket topic categories for reporting |
| `list_quick_replies` | List all quick reply templates available to agents |
| `list_bots` | List all bots configured in the account |
| `get_bot` | Get full configuration of a single bot by ID |
| `list_organizations` | List CRM organizations linked to contacts |
| `get_organization` | Get full details of a single CRM organization by ID |
| `list_people` | List CRM people linked to contacts and organizations |
| `get_person` | Get full details of a single CRM person by ID |
| `get_me` | Get the authenticated user profile, confirming the token identity |

## Requirements

- Node.js >= 20
- An active Digisac account
- A Digisac API token (found in your Digisac account settings under API/Integrations)

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DIGISAC_TOKEN` | Yes | API token from your Digisac account settings (used as Bearer auth) |
| `DIGISAC_URL` | Yes | Your account base URL in the form `https://{your-slug}.digisac.app` - no `/api/v1` suffix needed, the server appends it automatically |

### Claude Desktop

Add the following block to your Claude Desktop config file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "digisac": {
      "command": "npx",
      "args": ["-y", "mcp-digisac"],
      "env": {
        "DIGISAC_TOKEN": "your-api-token-here",
        "DIGISAC_URL": "https://your-company.digisac.app"
      }
    }
  }
}
```

Replace `your-api-token-here` with your Digisac API token and `https://your-company.digisac.app` with your account URL. Restart Claude Desktop after saving the config file.

### Claude Code

Claude Code supports stdio MCP servers via the `claude mcp add` command. Run this once in your terminal:

```bash
claude mcp add --transport stdio digisac \
  --env DIGISAC_TOKEN=your-api-token-here \
  --env DIGISAC_URL=https://your-company.digisac.app \
  -- npx -y mcp-digisac
```

Replace the placeholder values with your actual Digisac API token and account URL.

## Usage Examples

Once configured, you can ask Claude questions like:

- "List my open tickets from the last 7 days"
- "Show me the messages in ticket abc123"
- "Search for contacts named Maria"
- "Which agents are in the Sales department?"
- "Get the full profile of contact with ID xyz"
- "What are the SLA metrics for ticket 456?"
- "Which WhatsApp and Instagram channels are connected?"
- "List all tags and their colors"
- "Show me the quick reply templates available"
- "Which bots are configured in the account?"
- "List the CRM organizations"
- "Who am I authenticated as?"

## Security

Your API token is read from the `DIGISAC_TOKEN` environment variable set in the MCP client config - never paste it into a chat message. The token must stay in the config file, not in the conversation. The server sanitizes the token from any error output before returning errors to the client, so your credentials will not appear in tool error messages.

## License

MIT - see [LICENSE](LICENSE).

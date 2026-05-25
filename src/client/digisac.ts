export function sanitizeError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const token = process.env.DIGISAC_TOKEN;
  if (!token) return raw;
  return raw.split(token).join('[REDACTED]');
}

export class DigiSacClient {
  constructor(private token: string, private baseUrl: string) {}

  async get(path: string): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (err) {
      throw new Error(sanitizeError(err), { cause: err });
    }
  }

  async post(_path: string, _body?: unknown): Promise<unknown> {
    throw new Error('not implemented in Phase 1');
  }
}

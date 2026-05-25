export function sanitizeError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const token = process.env.DIGISAC_TOKEN;
  if (!token) return raw;
  return raw.split(token).join('[REDACTED]');
}

// Used for messages: bracket-notation params like where[ticketId]=<uuid>&limit=50
function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

// Used for tickets and contacts: query={"where":{...},"page":N,"perPage":N}
// plus optional flat params (startPeriod, endPeriod)
export function buildJsonQuery(
  where: Record<string, unknown> | undefined,
  pagination: { page?: number; perPage?: number },
  flatParams?: Record<string, string | undefined>
): string {
  const queryObj: Record<string, unknown> = {};
  if (where && Object.keys(where).length > 0) {
    queryObj['where'] = where;
  }
  if (pagination.page !== undefined) queryObj['page'] = pagination.page;
  if (pagination.perPage !== undefined) queryObj['perPage'] = pagination.perPage;

  const parts: string[] = [];
  parts.push('query=' + encodeURIComponent(JSON.stringify(queryObj)));

  if (flatParams) {
    for (const [k, v] of Object.entries(flatParams)) {
      if (v !== undefined) {
        parts.push(`${k}=${encodeURIComponent(v)}`);
      }
    }
  }

  return parts.join('&');
}

export class DigiSacClient {
  constructor(private token: string, private baseUrl: string) {}

  async get(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<unknown> {
    try {
      let url = `${this.baseUrl}${path}`;
      if (params) {
        const qs = buildQuery(params);
        if (qs.length > 0) {
          url += '?' + qs;
        }
      }
      const response = await fetch(url, {
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

  async getWithQueryString(path: string, queryString: string): Promise<unknown> {
    try {
      const url = queryString.length > 0
        ? `${this.baseUrl}${path}?${queryString}`
        : `${this.baseUrl}${path}`;
      const response = await fetch(url, {
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

  async post(_path: string, _body: unknown): Promise<unknown> {
    throw new Error('POST not implemented');
  }
}

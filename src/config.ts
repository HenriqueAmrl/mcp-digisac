export function loadConfig(): { token: string; url: string } {
  const token = process.env.DIGISAC_TOKEN;
  const url = process.env.DIGISAC_URL;

  if (!token) {
    console.error('Error: DIGISAC_TOKEN environment variable is required');
    process.exit(1);
  }

  return { token, url: url ?? 'https://api.digisac.co' };
}

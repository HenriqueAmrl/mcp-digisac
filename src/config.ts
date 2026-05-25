export function loadConfig(): { token: string; url: string } {
  const token = process.env.DIGISAC_TOKEN;
  const url = process.env.DIGISAC_URL;

  if (!token) {
    console.error('Error: DIGISAC_TOKEN environment variable is required');
    process.exit(1);
  }

  if (!url) {
    console.error(
      'Error: DIGISAC_URL environment variable is required. ' +
      'Set DIGISAC_URL=https://{your-slug}.digisac.app (no /api/v1 suffix - that is added automatically)'
    );
    process.exit(1);
  }

  return { token, url: url.replace(/\/$/, '') };
}

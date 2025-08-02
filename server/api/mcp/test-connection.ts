import { defineEventHandler, readBody } from 'h3';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const url = body?.url;
  if (!url || typeof url !== 'string') {
    return { ok: false, error: 'Missing or invalid URL.' };
  }

  try {
    // Only allow http(s) URLs
    if (!/^https?:\/\//.test(url)) {
      return { ok: false, error: 'URL must start with http:// or https://.' };
    }
    // Use MCP Client SDK to check connection (protocol-aware)
    const client = new Client({
      name: 'connection-tester',
      version: '1.0.0',
    });
    const transport = new StreamableHTTPClientTransport(new URL(url));
    await client.connect(transport);
    try {
      const resources = await client.listResources();
      console.log('[MCP test-connection] listResources result:', resources);
      return { ok: true };
    } catch (e: any) {
      console.log('[MCP test-connection] listResources error:', e);
      // If error is -32601 (Method not found), treat as successful MCP handshake
      if (e?.message && /-32601/.test(e.message)) {
        return { ok: true, warning: 'Server does not support listResources, but is MCP-compatible.' };
      }
      return { ok: false, error: e?.message || 'MCP connection failed.' };
    }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'MCP connection failed.' };
  }
});

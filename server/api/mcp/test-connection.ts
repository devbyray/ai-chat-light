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
    // Try all standard MCP client methods and log results
    const results: Record<string, { ok: boolean; error?: string }> = {};
    // Helper to test a method
    const testMethod = async (name: string, fn: () => Promise<any>) => {
      try {
        const res = await fn();
        console.log(`[MCP test-connection] ${name} result:`, res);
        results[name] = { ok: true };
      } catch (e: any) {
        console.log(`[MCP test-connection] ${name} error:`, e);
        if (e?.message && /-32601/.test(e.message)) {
          results[name] = { ok: false, error: 'Method not found (-32601)' };
        } else {
          results[name] = { ok: false, error: e?.message || 'Unknown error' };
        }
      }
    };
    // List of standard MCP client methods to test
    await testMethod('listPrompts', () => client.listPrompts());
    await testMethod('listResources', () => client.listResources());
    await testMethod('listTools', () => client.listTools());
    // Consider connection ok if any method succeeded
    const anyOk = Object.values(results).some(r => r.ok);
    if (anyOk) {
      return { ok: true, capabilities: results };
    }
    // If all failed, show a user-friendly error message
    let errorMsg = 'Could not connect to the MCP server or it does not support any standard features (prompts, resources, or tools). Please check the server URL and ensure it is a valid MCP server.';
    // If all failed with -32601, clarify that the server does not support any standard MCP methods
    const allMethodNotFound = Object.values(results).every(r => r.error === 'Method not found (-32601)');
    if (allMethodNotFound) {
      errorMsg = 'The MCP server responded, but does not support any of the standard MCP features (listPrompts, listResources, or listTools). Please verify the server implementation or try a different server.';
    }
    return { ok: false, capabilities: results, error: errorMsg };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'MCP connection failed.' };
  }
});

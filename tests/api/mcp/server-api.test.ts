import { describe, it, expect, beforeEach } from 'vitest';
import { $fetch } from 'ofetch';

const baseUrl = 'http://localhost:3000/api/mcp';

// Helper to clear all MCP servers before each test (requires a test-only endpoint or direct DB access in real projects)
const clearServers = async () => {
  const servers = await $fetch(baseUrl);
  for (const s of servers) {
    await $fetch(`${baseUrl}/${s.id}/delete`, { method: 'DELETE' });
  }
};

describe('MCP Server API', () => {
  beforeEach(async () => {
    await clearServers();
  });

  it('should create a new MCP server', async () => {
    const data = {
      name: 'Test Server',
      url: 'http://localhost:4000',
      description: 'A test MCP server',
    };
    const created = await $fetch(baseUrl, { method: 'POST', body: data });
    expect(created).toMatchObject({ name: data.name, url: data.url, description: data.description, enabled: true });
    expect(created.id).toBeDefined();
  });

  it('should prevent duplicate URLs', async () => {
    const data = { name: 'A', url: 'http://dup', description: '' };
    await $fetch(baseUrl, { method: 'POST', body: data });
    const res = await $fetch(baseUrl, { method: 'POST', body: data });
    expect(res.error).toBe('A server with this URL already exists');
  });

  it('should list all MCP servers', async () => {
    await $fetch(baseUrl, { method: 'POST', body: { name: 'A', url: 'http://a', description: '' } });
    await $fetch(baseUrl, { method: 'POST', body: { name: 'B', url: 'http://b', description: '' } });
    const servers = await $fetch(baseUrl);
    expect(servers.length).toBe(2);
    expect(servers.map((s: any) => s.name)).toContain('A');
    expect(servers.map((s: any) => s.name)).toContain('B');
  });

  it('should update an MCP server', async () => {
    const created = await $fetch(baseUrl, { method: 'POST', body: { name: 'C', url: 'http://c', description: '' } });
    const updated = await $fetch(`${baseUrl}/${created.id}/patch`, { method: 'PATCH', body: { name: 'C2', enabled: false } });
    expect(updated.name).toBe('C2');
    expect(updated.enabled).toBe(false);
  });

  it('should delete an MCP server', async () => {
    const created = await $fetch(baseUrl, { method: 'POST', body: { name: 'D', url: 'http://d', description: '' } });
    const res = await $fetch(`${baseUrl}/${created.id}/delete`, { method: 'DELETE' });
    expect(res.success).toBe(true);
    const servers = await $fetch(baseUrl);
    expect(servers.find((s: any) => s.id === created.id)).toBeUndefined();
  });
});

import prisma from '@/server/db/prisma';
import { defineEventHandler, readBody, getRouterParam } from 'h3';

// PATCH /api/mcp/[id] - Update an MCP server
export default defineEventHandler(async (event) => {
  if (event.method !== 'PATCH') {
    return { error: 'Method not allowed' };
  }
  const id = Number(getRouterParam(event, 'id'));
  if (!id) {
    return { error: 'Invalid ID' };
  }
  const data = await readBody(event);
  try {
    const updated = await prisma.mCPServer.update({
      where: { id },
      data,
    });
    return updated;
  } catch (e) {
    const message = typeof e === 'object' && e && 'message' in e ? (e as any).message : String(e);
    return { error: 'Update failed', details: message };
  }
});

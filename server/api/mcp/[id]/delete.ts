import prisma from '@/server/db/prisma';
import { defineEventHandler, getRouterParam } from 'h3';

// DELETE /api/mcp/[id] - Delete an MCP server
export default defineEventHandler(async (event) => {
  if (event.method !== 'DELETE') {
    return { error: 'Method not allowed' };
  }
  const id = Number(getRouterParam(event, 'id'));
  if (!id) {
    return { error: 'Invalid ID' };
  }
  try {
    await prisma.mCPServer.delete({ where: { id } });
    return { success: true };
  } catch (e) {
    const message = typeof e === 'object' && e && 'message' in e ? (e as any).message : String(e);
    return { error: 'Delete failed', details: message };
  }
});

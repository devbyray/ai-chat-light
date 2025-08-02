import prisma from '@/server/db/prisma';
import { defineEventHandler, readBody, getQuery, getRouterParam } from 'h3';

// GET /api/mcp/[id] - Get a single MCP server by ID
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id) {
    return { error: 'Invalid ID' };
  }
  const server = await prisma.mCPServer.findUnique({ where: { id } });
  if (!server) {
    return { error: 'MCP server not found' };
  }
  return server;
});

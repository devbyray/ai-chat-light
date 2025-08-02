import prisma from '@/server/db/prisma';
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    const servers = await prisma.mCPServer.findMany();
    return servers;
  }

  if (event.method === 'POST') {
    const data = await readBody(event);
    // Basic validation
    if (!data?.name || !data?.url) {
      return { error: 'Name and URL are required' };
    }
    // Prevent duplicate URLs
    const exists = await prisma.mCPServer.findUnique({ where: { url: data.url } });
    if (exists) {
      return { error: 'A server with this URL already exists' };
    }
    try {
      const server = await prisma.mCPServer.create({ data });
      return server;
    } catch (e) {
      const message = typeof e === 'object' && e && 'message' in e ? (e as any).message : String(e);
      return { error: 'Create failed', details: message };
    }
  }

  return { error: 'Method not allowed' };
});

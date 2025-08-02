import prisma from '@/server/db/prisma';
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    const servers = await prisma.mCPServer.findMany();
    return servers;
  }

  if (event.method === 'POST') {
    const data = await readBody(event);
    // TODO: Add validation for name, url, etc.
    const server = await prisma.mCPServer.create({ data });
    return server;
  }

  return { error: 'Method not allowed' };
});

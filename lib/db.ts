import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@/app/generated/prisma/client'

// En desarrollo Next.js recarga los módulos con cada cambio: guardamos el cliente en
// globalThis para no abrir una conexión nueva cada vez.
const globalForPrisma = globalThis as unknown as { db?: PrismaClient }

export const db =
  globalForPrisma.db ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' }),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.db = db
}

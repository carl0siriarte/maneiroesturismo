import { PrismaClient } from '@prisma/client'

export function createPrismaClient(url?: string) {
  return new PrismaClient({
    errorFormat: 'pretty',
    rejectOnNotFound: false,
    datasources: { db: { url: url || process.env.DATABASE_URL } },
  })
}

let prisma = createPrismaClient()

export async function setPrismaDatabaseURL(url: string) {
  await prisma.$disconnect()
  prisma = createPrismaClient(url)
}

export { Prisma, PrismaClient } from '@prisma/client'
export { prisma }

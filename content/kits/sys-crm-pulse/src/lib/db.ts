import { PrismaClient } from "@prisma/client";

/**
 * Em dev o hot reload recria os módulos a cada alteração. Sem este cache no
 * globalThis, cada reload abriria um novo pool de conexões até o Postgres
 * recusar novas ligações.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

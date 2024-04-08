import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "@/prisma";

const client = new prisma();

export const adapter = new PrismaAdapter(client.session, client.user);

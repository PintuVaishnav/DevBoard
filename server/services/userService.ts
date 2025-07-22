// server/services/userService.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserById = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = async (userData: { name: string; email: string }) => {
  return await prisma.user.create({
    data: userData,
  });
};

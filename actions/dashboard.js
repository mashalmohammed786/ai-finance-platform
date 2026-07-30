"use server";

import { db } from "../lib/prisma";
import { checkUser } from "../lib/checkUser";
import { revalidatePath } from "next/cache";

// Helper to safely serialize Prisma Decimal/BigInt types into plain JS numbers
const serializeTransaction = (obj) => {
  if (!obj) return obj;
  const serialized = { ...obj };

  if (serialized.balance && typeof serialized.balance.toNumber === "function") {
    serialized.balance = serialized.balance.toNumber();
  }
  if (serialized.amount && typeof serialized.amount.toNumber === "function") {
    serialized.amount = serialized.amount.toNumber();
  }
  return serialized;
};

export async function createAccount(data) {
  try {
    // Automatically retrieves or creates the user in your Prisma DB
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    // Convert balance input to float
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // Check existing user accounts
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // Make default if it's the user's first account or explicitly checked
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : Boolean(data.isDefault);

    // Use Prisma Transaction to ensure atomic default updates
    const account = await db.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.account.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await tx.account.create({
        data: {
          ...data,
          balance: balanceFloat,
          userId: user.id,
          isDefault: shouldBeDefault,
        },
      });
    });

    const serializedAccount = serializeTransaction(account);
    revalidatePath("/dashboard");

    return { success: true, data: serializedAccount };
  } catch (error) {
    return { success: false, error: error.message || "Failed to create account" };
  }
}

export async function getUserAccounts() {
  // Automatically retrieves or creates the user in your Prisma DB
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  return accounts.map(serializeTransaction);
}

export async function getDashboardData() {
  // Automatically retrieves or creates the user in your Prisma DB
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    include: {
      account: {
        select: {
          name: true,
        },
      },
    },
  });

  return transactions.map(serializeTransaction);
}
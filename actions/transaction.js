"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) throw new Error("Account not found");

    const balanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = Number(account.balance) + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteTransaction(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Fetch the transaction to ensure ownership and get amount details for account balance reversal
    const transaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!transaction) throw new Error("Transaction not found");

    const account = await db.account.findUnique({
      where: { id: transaction.accountId },
    });

    if (!account) throw new Error("Account not found");

    // Reverse the balance change: if it was an expense, add it back. If income, subtract it.
    const balanceChange =
      transaction.type === "EXPENSE"
        ? Number(transaction.amount)
        : -Number(transaction.amount);

    const newBalance = Number(account.balance) + balanceChange;

    await db.$transaction(async (tx) => {
      // Delete the transaction
      await tx.transaction.delete({
        where: { id },
      });

      // Update the associated account balance
      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: newBalance },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Failed to delete transaction");
  }
}

export async function scanReceipt(fileOrFormData) {
  try {
    let file;
    if (fileOrFormData instanceof FormData) {
      file = fileOrFormData.get("file");
    } else {
      file = fileOrFormData;
    }

    if (!file) throw new Error("No file provided");

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in valid JSON format:
      {
        "amount": number,
        "date": "YYYY-MM-DD",
        "description": "string",
        "category": "Housing" | "Transportation" | "Groceries" | "Utilities" | "Entertainment" | "Food & Dining" | "Shopping" | "Healthcare" | "Education" | "Travel" | "Other Expense"
      }
    `;

    // Fast-path active models: gemini-flash-latest tried first
    const candidateModels = [
      "gemini-flash-latest",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    let result = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
        });

        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64String,
              mimeType: file.type || "image/jpeg",
            },
          },
        ]);

        if (result) break; // Successfully scanned!
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed, attempting next fallback...`);
      }
    }

    if (!result) {
      throw lastError || new Error("Failed to scan receipt with available Gemini models.");
    }

    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanText);

    return {
      amount: parseFloat(data.amount) || 0,
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description || "Receipt Expense",
      category: data.category || "Other Expense",
      type: "EXPENSE",
    };
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error(
      error.message || "Failed to scan receipt. Please enter details manually."
    );
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}
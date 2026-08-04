"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        ...(accountId ? { accountId } : {}),
      },
      _sum: {
        amount: true,
      },
    });

    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses: expenses._sum.amount
        ? expenses._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw new Error(error.message);
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const budget = await db.budget.upsert({
      where: { userId: user.id },
      update: { amount },
      create: {
        userId: user.id,
        amount,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message };
  }
}

export async function checkBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const { budget, currentExpenses } = await getCurrentBudget(accountId);

    if (!budget) {
      return { success: true, exceeded: false };
    }

    const budgetAmount = budget.amount;
    const isExceeded = currentExpenses >= budgetAmount;
    const percentageUsed = (currentExpenses / budgetAmount) * 100;

    // Send email notification if budget is exceeded and user has an email
    if (isExceeded && user?.email) {
      try {
        await resend.emails.send({
          from: "Finance Platform <onboarding@resend.dev>",
          to: user.email,
          subject: "⚠️ Budget Alert: You have exceeded your monthly limit!",
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #ef4444;">Budget Exceeded Notice</h2>
              <p>Hello,</p>
              <p>You have spent <strong>₹${currentExpenses}</strong> this month, which has crossed your set budget limit of <strong>₹${budgetAmount}</strong>.</p>
              <p>Please review your expenses on your dashboard to stay on track.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send budget alert email:", emailError);
      }
    }

    return {
      success: true,
      exceeded: isExceeded,
      currentExpenses,
      budgetAmount,
      percentageUsed,
    };
  } catch (error) {
    console.error("Error checking budget alert:", error);
    return { success: false, error: error.message };
  }
}
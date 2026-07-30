import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
  },
  { cron: "0 0 * * *" }, // Run daily at midnight
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { nextRecurringDate: { lte: new Date() } },
              { nextRecurringDate: null },
            ],
          },
        });
      }
    );

    if (recurringTransactions.length > 0) {
      await step.run("process-transactions", async () => {
        for (const transaction of recurringTransactions) {
          await db.$transaction(async (tx) => {
            await tx.transaction.create({
              data: {
                type: transaction.type,
                amount: transaction.amount,
                description: `${transaction.description} (Recurring)`,
                date: new Date(),
                category: transaction.category,
                userId: transaction.userId,
                accountId: transaction.accountId,
                isRecurring: false,
              },
            });

            // Update account balance
            const balanceChange =
              transaction.type === "EXPENSE"
                ? -Number(transaction.amount)
                : Number(transaction.amount);

            await tx.account.update({
              where: { id: transaction.accountId },
              data: { balance: { increment: balanceChange } },
            });

            // Update next recurring date
            const nextDate = calculateNextRecurringDate(
              transaction.date,
              transaction.recurringInterval
            );

            await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                lastProcessed: new Date(),
                nextRecurringDate: nextDate,
              },
            });
          });
        }
      });
    }

    return { processed: recurringTransactions.length };
  }
);

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, // Run on the 1st of every month
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { accounts: true },
      });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const insights = await generateFinancialInsights(stats);

        return { userId: user.id, insights };
      });
    }
  }
);

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

async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = Number(t.amount);
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    { totalExpenses: 0, totalIncome: 0, byCategory: {} }
  );
}

async function generateFinancialInsights(stats) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Analyze this monthly financial stats summary:
    Total Income: $${stats.totalIncome}
    Total Expenses: $${stats.totalExpenses}
    Expenses by Category: ${JSON.stringify(stats.byCategory)}

    Provide 3 actionable, encouraging financial insights and spending tips.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Keep tracking your expenses to maintain financial growth!";
  }
}

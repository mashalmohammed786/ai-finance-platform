"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDailyFinanceReport() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || !user.email) throw new Error("User or email not found");

    // Get today's start and end times
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's transactions
    const todayTransactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { date: "desc" },
    });

    // Calculate totals for today
    const totalIncome = todayTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const totalExpense = todayTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    // Format currency helper
    const formatINR = (val) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(val || 0);

    const todayDateStr = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate HTML list of transactions or empty state
    const txRows =
      todayTransactions.length > 0
        ? todayTransactions
            .map(
              (t) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; color: #333;">${t.description || t.category}</td>
                <td style="padding: 10px; color: ${t.type === "INCOME" ? "#16a34a" : "#dc2626"}; font-weight: bold;">
                  ${t.type === "INCOME" ? "+" : "-"}${formatINR(t.amount.toNumber())}
                </td>
              </tr>
            `
            )
            .join("")
        : `<tr><td colspan="2" style="padding: 15px; text-align: center; color: #777;">No transactions recorded today.</td></tr>`;

    // Send email via Resend
    await resend.emails.send({
      from: "Finance Platform <onboarding@resend.dev>",
      to: user.email,
      subject: `📊 Your Daily Finance Report - ${todayDateStr}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-bottom: 5px;">Daily Financial Report</h2>
          <p style="color: #6b7280; font-size: 14px; margin-top: 0;">${todayDateStr}</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

          <div style="display: flex; gap: 15px; margin-bottom: 20px;">
            <div style="flex: 1; background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
              <p style="margin: 0; font-size: 12px; color: #166534; font-weight: bold;">TODAY'S INCOME</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; color: #15803d; font-weight: bold;">${formatINR(totalIncome)}</p>
            </div>
            <div style="flex: 1; background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca;">
              <p style="margin: 0; font-size: 12px; color: #991b1b; font-weight: bold;">TODAY'S EXPENSES</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; color: #b91c1c; font-weight: bold;">${formatINR(totalExpense)}</p>
            </div>
          </div>

          <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 10px;">Today's Activity</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f9fafb; text-align: left; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 10px; color: #4b5563;">Description</th>
                <th style="padding: 10px; color: #4b5563;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${txRows}
            </tbody>
          </table>

          <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
            You received this email because you requested a daily financial digest from your finance tracker.
          </p>
        </div>
      `,
    });

    return { success: true, message: "Daily report email sent successfully!" };
  } catch (error) {
    console.error("Error sending daily report:", error);
    return { success: false, error: error.message };
  }
}
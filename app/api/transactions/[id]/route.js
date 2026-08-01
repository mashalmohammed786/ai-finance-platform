import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await params if required in your Next.js version, or access directly depending on your setup
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // First find the user in the database via clerkUserId
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Verify user ownership of the transaction before deletion
    const transaction = await db.transaction.findUnique({
      where: { id },
      include: {
        account: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    // Ensure the transaction belongs to the database user
    if (transaction.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You do not own this transaction" },
        { status: 403 }
      );
    }

    // Reverse account balance adjustment upon deletion:
    // If it was an EXPENSE, deleting it should ADD the money back (increment).
    // If it was an INCOME, deleting it should SUBTRACT the money (decrement).
    const amountNum = Number(transaction.amount);
    const balanceChange =
      transaction.type === "EXPENSE" ? amountNum : -amountNum;

    await db.$transaction([
      // Delete the transaction
      db.transaction.delete({
        where: { id },
      }),
      // Revert the balance on the associated account
      db.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Transaction deleted and account balance updated successfully",
    });
  } catch (error) {
    console.error("ERROR_DELETE_TRANSACTION:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
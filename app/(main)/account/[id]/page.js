import React, { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { deleteTransaction } from "@/actions/transaction"; // 1. Import your server action directly
import { notFound } from "next/navigation";
import { CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TransactionTable } from "./_components/transaction-table";
import { AccountChart } from "./_components/account-chart";

export default async function AccountPage({ params }) {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  // Helper to format values in Indian Rupees (INR)
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);

  // Define clean Server Action wrappers using the imported function
  async function handleDeleteSingle(transactionId) {
    "use server";
    return await deleteTransaction(transactionId);
  }

  async function handleDeleteBulk(selectedIds) {
    "use server";
    await Promise.all(selectedIds.map((id) => deleteTransaction(id)));
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pt-28 pb-16">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
      </Link>

      {/* Account Info Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            {account.name}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">
            {account.type.toLowerCase()} Account
          </p>
        </div>

        <div className="text-left md:text-right">
          <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider">
            Current Balance
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {formatINR(account.balance)}
          </p>
        </div>
      </div>

      {/* 1. Transaction Bar Chart */}
      <Suspense fallback={<div>Loading chart...</div>}>
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* 2. Interactive Transaction Table */}
      <Suspense fallback={<div>Loading transactions...</div>}>
        <TransactionTable
          transactions={transactions}
          accountId={account.id}
          onDeleteTransaction={handleDeleteSingle}
          onDeleteSelected={handleDeleteBulk}
        />
      </Suspense>
    </div>
  );
}
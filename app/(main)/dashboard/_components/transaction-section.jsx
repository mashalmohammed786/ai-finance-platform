"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TransactionTable } from "../../account/[id]/_components/transaction-table";

export function TransactionSection({ transactions }) {
  const router = useRouter();

  // Handle single deletion
  const handleDeleteTransaction = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete transaction");
      }

      // Refresh server components and table data
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message);
    }
  };

  // Handle bulk deletion
  const handleDeleteSelected = async (ids) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} transactions?`)) return;

    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/transactions/${id}`, { method: "DELETE" })
        )
      );

      router.refresh();
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Failed to delete some transactions");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
        Transactions
      </h2>
      <TransactionTable
        transactions={transactions}
        onDeleteTransaction={handleDeleteTransaction}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
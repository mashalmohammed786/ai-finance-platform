"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths, isSameMonth } from "date-fns";

export function DashboardOverview({ accounts, transactions }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts?.find((a) => a.isDefault)?.id || accounts?.[0]?.id || "ALL"
  );

  const filteredTransactions = transactions.filter((t) => {
    if (selectedAccountId === "ALL") return true;
    return t.accountId === selectedAccountId;
  });

  const currentDate = new Date();
  const months = Array.from({ length: 6 })
    .map((_, i) => subMonths(currentDate, 5 - i))
    .reverse();

  const chartData = months.map((month) => {
    const monthTransactions = filteredTransactions.filter((t) =>
      isSameMonth(new Date(t.date), month)
    );

    const income = monthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = monthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      month: format(month, "MMM"),
      Income: income,
      Expense: expense,
    };
  });

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          Financial Overview
        </CardTitle>
        <Select
          value={selectedAccountId}
          onValueChange={setSelectedAccountId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Accounts</SelectItem>
            {accounts?.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
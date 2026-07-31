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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths, isSameMonth } from "date-fns";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
];

export function DashboardOverview({ accounts = [], transactions = [] }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts?.find((a) => a.isDefault)?.id || accounts?.[0]?.id || "ALL"
  );

  // Filter transactions by selected account
  const filteredTransactions = transactions.filter((t) => {
    if (selectedAccountId === "ALL") return true;
    return t.accountId === selectedAccountId;
  });

  // 1. Prepare Bar Chart Data (Last 6 Months Income vs Expense)
  const currentDate = new Date();
  const months = Array.from({ length: 6 })
    .map((_, i) => subMonths(currentDate, 5 - i));

  const barChartData = months.map((month) => {
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

  // 2. Prepare Pie Chart Data (Expenses by Category)
  const expenseTransactions = filteredTransactions.filter(
    (t) => t.type === "EXPENSE"
  );

  const categoryTotals = expenseTransactions.reduce((acc, t) => {
    const cat = t.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + Number(t.amount);
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
    value,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Transaction Bar Chart */}
      <Card className="lg:col-span-2 bg-card text-card-foreground border-border shadow-xl rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
          <CardTitle className="text-lg font-bold text-foreground">
            Monthly Overview
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[160px] text-xs bg-background border-border text-foreground focus:ring-primary/20 rounded-xl">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              <SelectItem value="ALL">All Accounts</SelectItem>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.75rem",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                />
                <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Expense Pie Chart */}
      <Card className="bg-card text-card-foreground border-border shadow-xl rounded-2xl">
        <CardHeader className="pb-2 border-b border-border">
          <CardTitle className="text-lg font-bold text-foreground">
            Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {pieChartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              No expense data recorded.
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="hsl(var(--card))"
                  >
                    {pieChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.75rem",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
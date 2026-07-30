import React, { Suspense } from "react";
import { getUserAccounts, getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet, ArrowUpRight } from "lucide-react";
import { AccountCard } from "./_components/account-card";
import { BudgetProgress } from "./_components/budget-progress";
import { DashboardOverview } from "./_components/transaction-overview";

export default async function DashboardPage() {
  // Fetch user accounts and dashboard transactions in parallel
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  // Find the default account and fetch its budget
  const defaultAccount = accounts?.find((account) => account.isDefault);
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  // Calculate total balance safely
  const totalBalance = accounts?.reduce(
    (sum, account) => sum + Number(account.balance || 0),
    0
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pt-28 pb-16">
      {/* 1. Interactive Monthly Budget Component (With Edit/Save) */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      {/* 2. Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Net Worth
            </CardTitle>
            <Wallet className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">
              ${totalBalance?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {accounts?.length || 0} Connected Accounts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Recent Transactions
            </CardTitle>
            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">
              {transactions?.length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Recorded this month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm flex items-center justify-center p-6">
          <CreateAccountDrawer>
            <button className="flex flex-col items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm">
              <div className="p-3 bg-blue-50 rounded-full border border-blue-100">
                <Plus className="h-6 w-6" />
              </div>
              <span>Add New Bank Account</span>
            </button>
          </CreateAccountDrawer>
        </Card>
      </div>

      {/* 3. Transaction Bar Chart Overview */}
      <Suspense fallback={<div>Loading Overview Chart...</div>}>
        <DashboardOverview
          accounts={accounts || []}
          transactions={transactions || []}
        />
      </Suspense>

      {/* 4. Accounts Section (With Default Toggle Switch) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Your Accounts
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accounts?.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>
    </div>
  );
}
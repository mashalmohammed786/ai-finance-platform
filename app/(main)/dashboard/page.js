import React, { Suspense } from "react";
import { getUserAccounts, getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet, ArrowUpRight, Landmark, CreditCard } from "lucide-react";
import { AccountCard } from "./_components/account-card";
import { BudgetProgress } from "./_components/budget-progress";
import { DashboardOverview } from "./_components/transaction-overview";

export const dynamic = "force-dynamic"; // <--- Add this line here

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
      {/* 1. Interactive Monthly Budget Component */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      {/* 2. Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Net Worth */}
        <Card className="bg-card text-card-foreground border-border shadow-xl rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Net Worth
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              ${totalBalance?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Landmark className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>{accounts?.length || 0} Connected Accounts</span>
            </p>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-card text-card-foreground border-border shadow-xl rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Transactions
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {transactions?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {transactions?.filter((t) => t.type === "EXPENSE").length || 0} Expenses
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {transactions?.filter((t) => t.type === "INCOME").length || 0} Incomes
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Add New Bank Account Card */}
        <Card className="bg-card/50 hover:bg-accent/50 border-border hover:border-primary/50 transition-all shadow-xl rounded-2xl flex items-center justify-center p-6 border-dashed group">
          <CreateAccountDrawer>
            <button className="flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground font-semibold text-sm transition-colors">
              <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <span>Add New Bank Account</span>
            </button>
          </CreateAccountDrawer>
        </Card>
      </div>

      {/* 3. Transaction Bar & Pie Chart Overview */}
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Overview Chart...</div>}>
        <DashboardOverview
          accounts={accounts || []}
          transactions={transactions || []}
        />
      </Suspense>

      {/* 4. Accounts Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
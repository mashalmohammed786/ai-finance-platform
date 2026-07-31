"use client";

import React, { useState, useEffect } from "react";
import { updateBudget } from "@/actions/budget";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }
    await updateBudgetFn(amount);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  const budgetAmount = initialBudget?.amount || 0;
  const percentUsed =
    budgetAmount > 0
      ? Math.min(Math.round((currentExpenses / budgetAmount) * 100), 100)
      : 0;

  return (
    <Card className="bg-card text-card-foreground border-border shadow-xl rounded-2xl relative overflow-hidden">
      {/* Ambient Blue Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardContent className="p-6 space-y-4 relative z-10">
        <div className="flex justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Budget Progress
            </p>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-36 bg-background text-foreground border-border focus:border-blue-500 focus:ring-blue-500/20 h-9 rounded-xl text-sm"
                  placeholder="Amount"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                  className="h-9 w-9 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-xl"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="h-9 w-9 bg-muted hover:bg-accent text-muted-foreground border border-border rounded-xl"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  ${currentExpenses.toFixed(2)}{" "}
                  <span className="text-muted-foreground text-lg font-medium">
                    / ${budgetAmount.toFixed(2)}
                  </span>
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-7 w-7 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-muted rounded-lg transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              percentUsed >= 90
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                : percentUsed >= 75
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
            }`}
          >
            {percentUsed}% Used
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5 border border-border">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentUsed >= 90
                ? "bg-gradient-to-r from-rose-500 to-red-600"
                : percentUsed >= 75
                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-500"
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
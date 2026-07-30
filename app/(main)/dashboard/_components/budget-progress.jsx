"use client";

import React, { useState, useEffect } from "react";
import { updateBudget } from "@/actions/budget";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  const percentUsed = budgetAmount > 0
    ? Math.min(Math.round((currentExpenses / budgetAmount) * 100), 100)
    : 0;

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-blue-200">
              Monthly Budget Progress
            </p>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32 bg-white/10 text-white border-white/20 placeholder:text-white/50 h-8"
                  placeholder="Amount"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                  className="h-8 w-8 hover:bg-white/20 text-white"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="h-8 w-8 hover:bg-white/20 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-extrabold">
                  ${currentExpenses.toFixed(2)} / ${budgetAmount.toFixed(2)}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 text-blue-200 hover:text-white hover:bg-white/20"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
          <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
            {percentUsed}% Used
          </span>
        </div>
        <Progress value={percentUsed} className="bg-white/20 h-2" extraClass="bg-white" />
      </CardContent>
    </Card>
  );
}
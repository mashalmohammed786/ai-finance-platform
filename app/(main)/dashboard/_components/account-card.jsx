"use client";

import React, { useEffect } from "react";
import { updateDefaultAccount } from "@/actions/account";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (checked) => {
    if (isDefault) {
      toast.warning("You must have at least one default account");
      return;
    }

    try {
      await updateDefaultFn(id);
    } catch (err) {
      // Handled in useEffect error block
    }
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  return (
    <Card className="bg-card hover:bg-accent/50 border-border hover:border-blue-500/40 shadow-xl rounded-2xl transition-all duration-300 relative overflow-hidden group">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {name}
          </CardTitle>
          <div
            className="flex items-center space-x-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <span className="text-xs text-muted-foreground font-medium">Default</span>
            <Switch
              checked={isDefault}
              onCheckedChange={handleDefaultChange}
              disabled={updateDefaultLoading}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-foreground">
            ${Number(balance || 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground capitalize mt-2 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground font-medium">
              {type?.toLowerCase()} account
            </span>
            <span>•</span>
            <span>{account._count?.transactions || 0} Transactions</span>
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}
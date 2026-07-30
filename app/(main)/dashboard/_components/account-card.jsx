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
    <Card className="hover:shadow-md transition-shadow bg-white border-slate-200 relative overflow-hidden group">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            {name}
          </CardTitle>
          <div
            className="flex items-center space-x-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <span className="text-xs text-slate-500 font-medium">Default</span>
            <Switch
              checked={isDefault}
              onCheckedChange={handleDefaultChange}
              disabled={updateDefaultLoading}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-extrabold text-slate-900">
            ${Number(balance || 0).toFixed(2)}
          </div>
          <p className="text-xs text-slate-400 capitalize mt-1">
            {type?.toLowerCase()} Account • {account._count?.transactions || 0} Transactions
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}
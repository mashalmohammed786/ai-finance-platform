"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import useFetch from "@/hooks/use-fetch";
import { createAccount } from "@/actions/dashboard";
import { Loader2, Landmark, DollarSign, Wallet } from "lucide-react";
import { toast } from "sonner";

const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().min(1, "Initial balance is required"),
  isDefault: z.boolean().default(false),
});

export default function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    data: newAccount,
    error,
    fn: createAccountFn,
    loading: createAccountLoading,
  } = useFetch(createAccount);

  useEffect(() => {
    if (newAccount && !createAccountLoading) {
      toast.success("Account created successfully!");
      reset();
      setOpen(false);
    }
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [newAccount, createAccountLoading, error]);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-lg mx-auto">
        <DrawerHeader className="border-b border-slate-800/80 pb-4">
          <DrawerTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <Landmark className="h-5 w-5" />
            </div>
            Create New Bank Account
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Account Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Account Name
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="e.g. Main Checking, Savings"
                  {...register("name")}
                  className="pl-9 bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Account Type
              </label>
              <Select
                onValueChange={(val) => setValue("type", val)}
                defaultValue={watch("type")}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-100 rounded-xl focus:ring-blue-500/20">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="CURRENT">Current Account</SelectItem>
                  <SelectItem value="SAVINGS">Savings Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Initial Balance */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Initial Balance
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("balance")}
                  className="pl-9 bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                />
              </div>
              {errors.balance && (
                <p className="text-xs text-rose-400 mt-1">{errors.balance.message}</p>
              )}
            </div>

            {/* Default Switch */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-slate-200">
                  Set as Default Account
                </label>
                <p className="text-xs text-slate-400">
                  Selected automatically for new transactions
                </p>
              </div>
              <Switch
                checked={watch("isDefault")}
                onCheckedChange={(val) => setValue("isDefault", val)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl"
                >
                  Cancel
                </Button>
              </DrawerClose>

              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20"
                disabled={createAccountLoading}
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
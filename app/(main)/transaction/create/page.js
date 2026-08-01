"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultCategories } from "@/data/categories";
import useFetch from "@/hooks/use-fetch";
import { createTransaction, scanReceipt } from "@/actions/transaction";
import { getUserAccounts } from "@/actions/dashboard";
import { Loader2, Sparkles, Upload, Camera, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  accountId: z.string().min(1, "Account is required"),
  category: z.string().min(1, "Category is required"),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
});

export default function AddTransactionPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [scanning, setScanning] = useState(false);

  // Helper to format values in Indian Rupees (INR)
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      accountId: "",
      category: "",
      isRecurring: false,
    },
  });

  const {
    data: transactionResult,
    loading: transactionLoading,
    fn: createTxFn,
  } = useFetch(createTransaction);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const accs = await getUserAccounts();
        setAccounts(accs || []);
        const defaultAcc = accs?.find((a) => a.isDefault) || accs?.[0];
        if (defaultAcc) {
          setValue("accountId", defaultAcc.id);
        }
      } catch (err) {
        console.error("Failed to load accounts:", err);
      }
    }
    loadAccounts();
  }, [setValue]);

  useEffect(() => {
    if (transactionResult?.success) {
      toast.success("Transaction recorded successfully!");
      router.push("/dashboard");
    }
  }, [transactionResult, router]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");

  const filteredCategories = defaultCategories.filter(
    (c) => c.type === type
  );

  const onSubmit = async (data) => {
    await createTxFn({
      ...data,
      amount: parseFloat(data.amount),
      date: new Date(data.date),
    });
  };

  const handleReceiptScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const res = await scanReceipt(file);
      if (res) {
        setValue("type", "EXPENSE");
        setValue("amount", res.amount.toString());
        setValue("description", res.description || "Scanned Receipt");

        if (res.date) {
          const formattedDate = new Date(res.date).toISOString().split("T")[0];
          setValue("date", formattedDate);
        }

        if (res.category) {
          const categoryExists = defaultCategories.some(
            (c) => c.name.toLowerCase() === res.category.toLowerCase()
          );
          setValue("category", categoryExists ? res.category : "Other Expense");
        }

        toast.success("Receipt scanned & fields auto-filled!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to scan receipt");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-16 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-foreground tracking-tight">Add Transaction</h1>
      </div>

      {/* AI Receipt Scanner Card with Camera & Gallery Options */}
      <Card className="bg-card text-card-foreground border-border shadow-xl rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-bold text-foreground flex items-center justify-center md:justify-start gap-2 text-base">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Automated AI Receipt Scanner
            </h3>
            <p className="text-xs text-muted-foreground">
              Capture a photo using your camera or upload a file from your gallery.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
            {/* 1. Camera Capture Button */}
            <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all">
              {scanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <span>Camera</span>
              <input
                type="file"
                accept="image/*"
                capture="environment" // Forces rear camera on mobile devices
                className="hidden"
                onChange={handleReceiptScan}
                disabled={scanning}
              />
            </label>

            {/* 2. Gallery / File Upload Button */}
            <label className="cursor-pointer inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl border border-border transition-all">
              {scanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>Gallery / File</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleReceiptScan}
                disabled={scanning}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card className="bg-card text-card-foreground border-border shadow-xl rounded-2xl">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-xl font-bold text-foreground">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </label>
                <Select
                  onValueChange={(val) => {
                    setValue("type", val);
                    setValue("category", "");
                  }}
                  value={watch("type")}
                >
                  <SelectTrigger className="bg-background border-border text-foreground focus:ring-primary rounded-xl h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Amount (₹)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount")}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 rounded-xl h-11"
                />
                {errors.amount && (
                  <p className="text-xs text-destructive font-medium">{errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Bank Account */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bank Account
                </label>
                <Select
                  onValueChange={(val) => setValue("accountId", val)}
                  value={watch("accountId")}
                >
                  <SelectTrigger className="bg-background border-border text-foreground focus:ring-primary rounded-xl h-11">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({formatINR(acc.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.accountId && (
                  <p className="text-xs text-destructive font-medium">{errors.accountId.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                <Select
                  onValueChange={(val) => setValue("category", val)}
                  value={watch("category")}
                >
                  <SelectTrigger className="bg-background border-border text-foreground focus:ring-primary rounded-xl h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive font-medium">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </label>
                <Input
                  type="date"
                  {...register("date")}
                  className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 rounded-xl h-11 dark:[color-scheme:dark]"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <Input
                  placeholder="e.g. Grocery store, Salary"
                  {...register("description")}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 rounded-xl h-11"
                />
              </div>
            </div>

            {/* Recurring Toggle Panel */}
            <div className="flex items-center justify-between rounded-xl bg-background border border-border p-4">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-foreground">
                  Recurring Transaction
                </label>
                <p className="text-xs text-muted-foreground">
                  Automatically repeat this transaction on a schedule
                </p>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={(val) => setValue("isRecurring", val)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Recurring Interval Select */}
            {isRecurring && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recurring Interval
                </label>
                <Select
                  onValueChange={(val) => setValue("recurringInterval", val)}
                  value={watch("recurringInterval")}
                >
                  <SelectTrigger className="bg-background border-border text-foreground focus:ring-primary rounded-xl h-11">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20 transition-all text-base mt-4"
              disabled={transactionLoading}
            >
              {transactionLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Recording Transaction...
                </>
              ) : (
                "Save Transaction"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
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
import { Loader2, Sparkles, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:underline">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Add Transaction</h1>
      </div>

      {/* AI Receipt Scanner Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Automated AI Receipt Scanner
            </h3>
            <p className="text-xs text-slate-600">
              Upload a receipt photo to automatically extract amount, date, and description.
            </p>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md transition">
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Scan Receipt
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReceiptScan}
              disabled={scanning}
            />
          </label>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  onValueChange={(val) => {
                    setValue("type", val);
                    setValue("category", "");
                  }}
                  value={watch("type")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount")}
                />
                {errors.amount && (
                  <p className="text-xs text-red-500">{errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Account</label>
                <Select
                  onValueChange={(val) => setValue("accountId", val)}
                  value={watch("accountId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} (${Number(acc.balance).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.accountId && (
                  <p className="text-xs text-red-500">{errors.accountId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  onValueChange={(val) => setValue("category", val)}
                  value={watch("category")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-red-500">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" {...register("date")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="e.g. Grocery store, Salary" {...register("description")} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Recurring Transaction</label>
                <p className="text-xs text-muted-foreground">
                  Automatically repeat this transaction on a schedule
                </p>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={(val) => setValue("isRecurring", val)}
              />
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Recurring Interval</label>
                <Select
                  onValueChange={(val) => setValue("recurringInterval", val)}
                  value={watch("recurringInterval")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-6 text-base shadow-lg shadow-blue-500/20 mt-4"
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
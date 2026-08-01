"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format, isSameDay } from "date-fns";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

export function TransactionTable({
  transactions = [],
  onDeleteSelected,
  onEditTransaction,
  onDeleteTransaction,
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [recurringFilter, setRecurringFilter] = useState("ALL");
  const [scopeFilter, setScopeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState(""); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [deletingId, setDeletingId] = useState(null);

  const { loading: deleteLoading, fn: deleteFn } = useFetch(onDeleteTransaction);
  const { loading: bulkDeleteLoading, fn: bulkDeleteFn } = useFetch(onDeleteSelected);

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const formattedDate = format(new Date(t.date), "MMM dd, yyyy").toLowerCase();
        const matchesSearch =
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formattedDate.includes(searchTerm.toLowerCase());

        let matchesDate = true;
        if (dateFilter) {
          const selectedDate = new Date(dateFilter);
          const txDate = new Date(t.date);
          matchesDate = isSameDay(txDate, selectedDate);
        }

        const matchesType =
          typeFilter === "ALL" || t.type?.toUpperCase() === typeFilter;

        const matchesRecurring =
          recurringFilter === "ALL" ||
          (recurringFilter === "RECURRING" && t.isRecurring) ||
          (recurringFilter === "NON_RECURRING" && !t.isRecurring);

        const matchesScope =
          scopeFilter === "ALL" ||
          (t.scope && t.scope.toUpperCase() === scopeFilter) ||
          (scopeFilter === "PERSONAL" && t.isPersonal) ||
          (scopeFilter === "WORKING" && !t.isPersonal);

        return (
          matchesSearch &&
          matchesDate &&
          matchesType &&
          matchesRecurring &&
          matchesScope
        );
      })
      .sort((a, b) => {
        const { key, direction } = sortConfig;
        let valA = a[key];
        let valB = b[key];

        if (key === "date") {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } else if (key === "amount") {
          valA = Number(valA);
          valB = Number(valB);
        } else if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [
    transactions,
    searchTerm,
    dateFilter,
    typeFilter,
    recurringFilter,
    scopeFilter,
    sortConfig,
  ]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(filteredAndSortedTransactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (onDeleteSelected && selectedIds.length > 0) {
      try {
        await bulkDeleteFn(selectedIds);
        setSelectedIds([]);
        router.refresh();
      } catch (error) {
        console.error("Bulk delete error:", error);
      }
    }
  };

  const handleDeleteSingle = async (id) => {
    if (onDeleteTransaction) {
      try {
        setDeletingId(id);
        await deleteFn(id);
        router.refresh();
      } catch (error) {
        console.error("Single delete error:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (transaction) => {
    if (onEditTransaction) {
      onEditTransaction(transaction);
    } else {
      router.push(`/transaction/create?edit=${transaction.id}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search description, category, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative flex items-center">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-10 py-2 px-3 pr-8 text-sm border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-datetime-edit]:text-foreground [&::-webkit-datetime-edit-fields-wrapper]:text-foreground"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground"
                title="Clear date filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px] text-xs border-border bg-background text-foreground">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recurringFilter} onValueChange={setRecurringFilter}>
            <SelectTrigger className="w-[140px] text-xs border-border bg-background text-foreground">
              <SelectValue placeholder="All Frequencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Frequencies</SelectItem>
              <SelectItem value="RECURRING">Recurring</SelectItem>
              <SelectItem value="NON_RECURRING">Non-Recurring</SelectItem>
            </SelectContent>
          </Select>

          <Select value={scopeFilter} onValueChange={setScopeFilter}>
            <SelectTrigger className="w-[140px] text-xs border-border bg-background text-foreground">
              <SelectValue placeholder="All Scopes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Scopes</SelectItem>
              <SelectItem value="PERSONAL">Personal</SelectItem>
              <SelectItem value="WORKING">Working</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              disabled={bulkDeleteLoading}
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5"
            >
              <Trash2 className={`h-4 w-4 ${bulkDeleteLoading ? "animate-spin" : ""}`} />
              {bulkDeleteLoading ? "Deleting..." : `Delete (${selectedIds.length})`}
            </Button>
          )}
        </div>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    filteredAndSortedTransactions.length > 0 &&
                    selectedIds.length === filteredAndSortedTransactions.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-muted-foreground"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-1">
                  Date
                  {sortConfig.key === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-muted-foreground"
                onClick={() => handleSort("description")}
              >
                <div className="flex items-center gap-1">
                  Description
                  {sortConfig.key === "description" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead
                className="text-right cursor-pointer select-none text-muted-foreground"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end gap-1">
                  Amount
                  {sortConfig.key === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No transactions found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transaction) => {
                const isSelected = selectedIds.includes(transaction.id);
                const isDeletingThis = deletingId === transaction.id && deleteLoading;

                return (
                  <TableRow
                    key={transaction.id}
                    className={`border-b border-border transition-opacity ${
                      isSelected ? "bg-muted/50" : ""
                    } ${isDeletingThis ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        disabled={isDeletingThis}
                        onCheckedChange={(checked) =>
                          handleSelectRow(transaction.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground text-xs sm:text-sm">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {transaction.description || "Uncategorized"}
                        </span>
                        {transaction.isRecurring && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          >
                            <RefreshCw className="h-2.5 w-2.5 animate-spin-slow" />
                            Recurring
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs border-border">
                        {transaction.category?.toLowerCase() || "General"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold text-sm ${
                        transaction.type === "EXPENSE"
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {transaction.type === "EXPENSE" ? "-" : "+"}
                      {formatINR(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            disabled={isDeletingThis}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {onDeleteTransaction && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              disabled={isDeletingThis}
                              onSelect={(e) => {
                                e.preventDefault();
                                handleDeleteSingle(transaction.id);
                              }}
                            >
                              <Trash2
                                className={`mr-2 h-4 w-4 ${
                                  isDeletingThis ? "animate-spin" : ""
                                }`}
                              />
                              {isDeletingThis ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
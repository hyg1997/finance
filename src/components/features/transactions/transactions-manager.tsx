"use client";

import {
  Search,
  Filter,
  Calendar,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useMemo, memo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TransactionWithGroup, Group } from "@/types/supabase";

import { DeleteTransactionDialog } from "./delete-transaction-dialog";

interface TransactionsManagerProps {
  transactions: TransactionWithGroup[];
  groups: Group[];
}

export const TransactionsManager = memo(function TransactionsManager({
  transactions,
  groups,
}: TransactionsManagerProps) {
  const t = useTranslations("transactions");
  const tCommon = useTranslations("common");
  const currency = useTranslations("currency");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.concept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.group?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesGroup =
        selectedGroup === "all" || transaction.group_id === selectedGroup;
      const matchesType =
        selectedType === "all" || transaction.type === selectedType;

      return matchesSearch && matchesGroup && matchesType;
    });
  }, [transactions, searchTerm, selectedGroup, selectedType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 z-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("all")}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {tCommon("all")}
          </Button>
          <Button
            variant={selectedType === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("income")}
            className="flex items-center gap-2"
          >
            <ArrowUpRight className="h-4 w-4" />
            {t("income")}
          </Button>
          <Button
            variant={selectedType === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("expense")}
            className="flex items-center gap-2"
          >
            <ArrowDownRight className="h-4 w-4" />
            {t("expense")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedGroup === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGroup("all")}
            className="flex items-center gap-2"
          >
            <Tag className="h-4 w-4" />
            {t("allGroups")}
          </Button>
          {groups?.map((group) => (
            <Button
              key={group.id}
              variant={selectedGroup === group.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGroup(group.id)}
              className="flex items-center gap-2"
            >
              <Tag className="h-4 w-4" />
              {group.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions?.map((transaction) => (
          <Card
            key={transaction.id}
            className={cn(
              "hover:shadow-md transition-shadow",
              transaction.type === "income"
                ? "border-l-4 border-green-600 dark:border-green-400"
                : "border-l-4 border-red-600 dark:border-red-400"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-xl text-foreground">
                        {transaction.concept || t("noDescription")}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="flex mr-[-0.5rem]">
                    <DeleteTransactionDialog transaction={transaction} />
                  </div>
                  <span
                    className={cn(
                      "text-lg md:text-xl font-semibold",
                      transaction.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}{currency("symbol")}
                    {transaction.amount.toFixed(2)}
                  </span>
                  {transaction.group && (
                    <Badge variant="secondary" className="text-sm">
                      <Tag className="h-4 w-4 mr-1" />
                      {transaction.group.name}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTransactions?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">{t("noTransactions")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
});

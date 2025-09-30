import { ArrowUpRight, ArrowDownRight, Calendar, Tag } from "lucide-react";
import { TransactionWithGroup } from "@/types/supabase";
import { cn } from "@/lib/styles";
import { formatDate, formatTime } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { memo } from "react";

interface RecentTransactionsProps {
  transactions: TransactionWithGroup[] | null;
  locale: string;
}

export const RecentTransactions = memo(async function RecentTransactions({
  transactions,
  locale,
}: RecentTransactionsProps) {
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tTransactions = await getTranslations({
    locale,
    namespace: "transactions",
  });
  const currency = await getTranslations({ locale, namespace: "currency" });

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground animate-slide-up">
        {t("recentTransactions")}
      </h2>
      {transactions && transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction, index) => {
            const isIncome = transaction.type === "income";

            return (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
                  "bg-card/50 hover:bg-card/80"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      isIncome
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    )}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground truncate">
                        {transaction.concept || "No description"}
                      </p>
                    </div>
                    {transaction.group && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        <span>{transaction.group.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(transaction.created_at)}</span>
                      <span>•</span>
                      <span>{formatTime(transaction.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={cn(
                      "font-bold text-sm",
                      isIncome
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {isIncome ? "+" : "-"}
                    {currency("symbol")}
                    {transaction.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {tTransactions(transaction.type)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {t("noTransactions")}
            </h3>
            <p className="text-muted-foreground">
              {t("noTransactionsDescription")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

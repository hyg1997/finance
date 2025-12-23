import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { UserBalance } from "@/types/supabase";
import { cardStyles, gradientStyles, cn, getColorClasses } from "@/lib/styles";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getTranslations } from "next-intl/server";
import { memo } from "react";

interface GroupsSectionProps {
  balances: UserBalance[] | null;
  locale: string;
}

export const GroupsSection = memo(async function GroupsSection({
  balances,
  locale,
}: GroupsSectionProps) {
  const t = await getTranslations({ locale, namespace: "dashboard.groups" });
  const currency = await getTranslations({ locale, namespace: "currency" });

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground animate-slide-up">
        {t("title")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {balances?.map((group, index) => {
          const isPositive = group.available_amount > 0;
          const percentage =
            group.max_amount > 0
              ? (group.available_amount / group.max_amount) * 100
              : 0;

          const colorClasses = getColorClasses(percentage);

          return (
            <Card
              key={group.group_id}
              className={cn(
                cardStyles.interactive,
                gradientStyles.card,
                colorClasses.hover
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg font-semibold text-card-foreground truncate">
                      {group.group_name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                <div className="space-y-3">
                  <ProgressBar
                    percentage={percentage}
                    colors={colorClasses}
                    showLabel={true}
                    className="mb-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("limit")}
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {currency("symbol")}
                      {group.max_amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("available")}
                    </p>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <ArrowUpRight
                          className={`h-3 w-3 ${colorClasses.text
                              .replace("text-", "text-")
                              .split(" ")[0]
                            }`}
                        />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`font-bold ${colorClasses.text}`}>
                        {currency("symbol")}
                        {group.available_amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!balances || balances.length === 0) && (
        <Card className={cardStyles.empty}>
          <CardContent className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
              <PiggyBank className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {t("noGroups")}
              </h3>
              <p className="text-muted-foreground mx-auto">
                {t("noGroupsDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

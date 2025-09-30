import { TrendingUp, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { memo } from "react";

import { Card, CardTitle } from "@/components/ui/card";
import { cardStyles, gradientStyles, cn } from "@/lib/styles";
import { UserSummary } from "@/types/supabase";

interface SummaryCardsProps {
  summary: UserSummary | null;
  locale: string;
}

export const SummaryCards = memo(async function SummaryCards({
  summary,
  locale,
}: SummaryCardsProps) {
  const t = await getTranslations({ locale, namespace: "dashboard.summary" });
  const currency = await getTranslations({ locale, namespace: "currency" });

  const cards = [
    {
      title: t("generalLimit"),
      value: summary?.general_max,
      icon: TrendingUp,
      style: cn(cardStyles.glowing, gradientStyles.success),
      iconColor: "text-success-foreground",
      valueColor: "text-success-foreground",
      delay: "0s",
    },
    {
      title: t("totalAvailable"),
      value: summary?.total_available,
      icon: Wallet,
      style: cn(cardStyles.glowing, gradientStyles.primary),
      iconColor: "text-primary-foreground",
      valueColor: "text-primary-foreground",
      delay: "0.1s",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className={card.style}
            style={{ animationDelay: card.delay }}
          >
            <div
              className={`p-6 text-2xl sm:text-3xl font-bold ${card.valueColor} flex items-center justify-between`}
            >
              <div>
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <span>
                  {currency("symbol")}
                  {card.value?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Icon
                className={`h-10 w-10 ${card.iconColor} group-hover:scale-110 transition-transform duration-200`}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
});

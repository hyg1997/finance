"use client";

import { Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, memo, useCallback, useEffect } from "react";

import { createTransaction, updateTransaction } from "@/app/server-actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getExchangeRate, usdToPen } from "@/lib/services/exchange-rate-service";
import { Group, TransactionFormData, TransactionType, Currency } from "@/types/supabase";

interface TransactionFormProps {
  groups: Group[];
  onSubmit?: (data: FormData) => Promise<void>;
  onCancel: () => void;
  onSuccess?: () => void;
  initialData?: TransactionFormData;
  transactionId?: string;
  isEditing?: boolean;
}

export const TransactionForm = memo(function TransactionForm({
  groups,
  onSubmit,
  onCancel,
  onSuccess,
  initialData,
  transactionId,
  isEditing = false,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>(
    initialData || {
      concept: "",
      amount: 0,
      type: "income",
      groupId: "",
      inputCurrency: "PEN",
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [exchangeRate, setExchangeRate] = useState<number>(3.75);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const { toast } = useToast();
  const t = useTranslations("currencySelector");
  const tCommon = useTranslations("common");

  // Fetch exchange rate on mount
  useEffect(() => {
    async function fetchRate() {
      const rate = await getExchangeRate();
      setExchangeRate(rate);
    }
    fetchRate();
  }, []);

  // Calculate converted amount when amount or currency changes
  useEffect(() => {
    if (formData.inputCurrency === "USD" && formData.amount > 0) {
      const penAmount = formData.amount * exchangeRate;
      setConvertedAmount(penAmount);
    } else {
      setConvertedAmount(0);
    }
  }, [formData.amount, formData.inputCurrency, exchangeRate]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.concept.trim()) {
      newErrors["concept"] = "Concept is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors["amount"] = "Amount must be greater than 0";
    }

    if (!formData.type) {
      newErrors["type"] = "Transaction type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Convert USD to PEN if needed before saving
      let amountToSave = formData.amount;
      if (formData.inputCurrency === "USD") {
        amountToSave = await usdToPen(formData.amount);
      }

      const formDataObj = new FormData();
      formDataObj.append("concept", formData.concept);
      formDataObj.append("amount", amountToSave.toString());
      formDataObj.append("type", formData.type);
      if (formData.groupId) {
        formDataObj.append("group_id", formData.groupId);
      }

      if (onSubmit) {
        await onSubmit(formDataObj);
      } else if (isEditing && transactionId) {
        await updateTransaction(transactionId, formDataObj);
      } else {
        await createTransaction(formDataObj);
      }

      toast({
        variant: "success",
        title: isEditing ? "Transaction Updated!" : "Transaction Created!",
        description: isEditing
          ? "The transaction has been updated successfully."
          : "The transaction has been saved successfully.",
      });

      if (!isEditing) {
        setFormData({
          concept: "",
          amount: 0,
          type: "income",
          groupId: "",
          inputCurrency: "PEN",
        });
      }

      onSuccess?.();
    } catch {
      toast({
        title: "Error",
        description: isEditing ? "Error updating transaction" : "Error creating transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="space-y-2">
        <label
          htmlFor="concept"
          className="text-sm font-medium text-foreground flex items-center gap-2"
        >
          Concept *
          {formData.concept && <CheckCircle className="h-4 w-4 text-success" />}
        </label>
        <Input
          id="concept"
          type="text"
          value={formData.concept}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, concept: e.target.value }))
          }
          placeholder="Enter transaction concept"
          disabled={isLoading}
          className={`transition-all duration-200 ${errors["concept"]
              ? "border-destructive focus:ring-destructive"
              : "focus:ring-primary/20"
            }`}
          required
          aria-describedby={errors["concept"] ? "concept-error" : undefined}
          aria-invalid={!!errors["concept"]}
        />
        {errors["concept"] && (
          <p
            id="concept-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors["concept"]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="amount"
          className="text-sm font-medium text-foreground flex items-center gap-2"
        >
          Amount *
          {formData.amount && formData.amount > 0 ? (
            <CheckCircle className="h-4 w-4 text-success" />
          ) : null}
        </label>
        <div className="flex gap-2">
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount === 0 ? "" : formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amount: e.target.value === "" ? 0 : parseFloat(e.target.value),
              }))
            }
            placeholder="0.00"
            disabled={isLoading}
            className={`transition-all duration-200 flex-1 ${errors["amount"]
                ? "border-destructive focus:ring-destructive"
                : "focus:ring-primary/20"
              }`}
            required
            aria-describedby={errors["amount"] ? "amount-error" : undefined}
            aria-invalid={!!errors["amount"]}
          />
          <Select
            value={formData.inputCurrency || "PEN"}
            onValueChange={(value: Currency) =>
              setFormData((prev) => ({ ...prev, inputCurrency: value }))
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-28 transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PEN">{t("pen")}</SelectItem>
              <SelectItem value="USD">{t("usd")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors["amount"] && (
          <p
            id="amount-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors["amount"]}
          </p>
        )}

        {/* Currency conversion preview */}
        {formData.inputCurrency === "USD" && formData.amount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
            <RefreshCw className="h-3 w-3" />
            <span>
              {t("convertedAmount")}: S/.{convertedAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs">
              ({t("exchangeRate")}: 1 USD = {exchangeRate.toFixed(2)} PEN)
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="type"
          className="text-sm font-medium text-foreground flex items-center gap-2"
        >
          Transaction Type *
          {formData.type && <CheckCircle className="h-4 w-4 text-success" />}
        </label>
        <Select
          value={formData.type}
          onValueChange={(value: TransactionType) =>
            setFormData((prev) => ({ ...prev, type: value }))
          }
          disabled={isLoading}
          required
        >
          <SelectTrigger
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            aria-describedby={errors["type"] ? "type-error" : undefined}
            aria-invalid={!!errors["type"]}
          >
            <SelectValue placeholder="Select transaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income" className="flex items-center gap-2">
              Income
            </SelectItem>
            <SelectItem value="expense" className="flex items-center gap-2">
              Expense
            </SelectItem>
          </SelectContent>
        </Select>
        {errors["type"] && (
          <p id="type-error" className="text-sm text-destructive" role="alert">
            {errors["type"]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="group" className="text-sm font-medium text-foreground">
          Group (Optional)
        </label>
        <Select
          value={formData.groupId || ""}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              groupId: value === "all" ? "" : value,
            }))
          }
          disabled={isLoading}
        >
          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder="Select a group (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="text-muted-foreground">No group</span>
            </SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1 relative">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            tCommon("save")
          )}
        </Button>
      </div>
    </form>
  );
});

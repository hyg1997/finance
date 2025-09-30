"use client";

import { Loader2, CheckCircle } from "lucide-react";
import { useState, memo, useCallback } from "react";

import { createTransaction } from "@/app/server-actions/transaction-actions";
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
import { Group, TransactionFormData, TransactionType } from "@/types/supabase";

interface TransactionFormProps {
  groups: Group[];
  onSubmit?: (data: FormData) => Promise<void>;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const TransactionForm = memo(function TransactionForm({
  groups,
  onSubmit,
  onCancel,
  onSuccess,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    concept: "",
    amount: 0,
    type: "income",
    groupId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

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
      const formDataObj = new FormData();
      formDataObj.append("concept", formData.concept);
      formDataObj.append("amount", formData.amount.toString());
      formDataObj.append("type", formData.type);
      if (formData.groupId) {
        formDataObj.append("group_id", formData.groupId);
      }

      if (onSubmit) {
        await onSubmit(formDataObj);
      } else {
        await createTransaction(formDataObj);
      }

      toast({
        variant: "success",
        title: "Transaction Created!",
        description: "The transaction has been saved successfully.",
      });

      setFormData({
        concept: "",
        amount: 0,
        type: "income",
        groupId: "",
      });

      onSuccess?.();
    } catch {
      toast({
        title: "Error",
        description: "Error creating transaction",
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
          className={`transition-all duration-200 ${
            errors["concept"]
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
          className={`transition-all duration-200 ${
            errors["amount"]
              ? "border-destructive focus:ring-destructive"
              : "focus:ring-primary/20"
          }`}
          required
          aria-describedby={errors["amount"] ? "amount-error" : undefined}
          aria-invalid={!!errors["amount"]}
        />
        {errors["amount"] && (
          <p
            id="amount-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors["amount"]}
          </p>
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
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1 relative">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
});

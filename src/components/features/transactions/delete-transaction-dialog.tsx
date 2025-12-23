"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { deleteTransaction } from "@/app/server-actions/transaction-actions";
import { TransactionWithGroup } from "@/types/supabase";

interface DeleteTransactionDialogProps {
  transaction: TransactionWithGroup;
}

export function DeleteTransactionDialog({
  transaction,
}: DeleteTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("transactions");
  const tCommon = useTranslations("common");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTransaction(transaction.id);
      toast({
        title: t("deleteSuccess"),
        description: t("deleteSuccessDescription"),
      });
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: t("deleteError"),
        description: t("deleteErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{t("deleteTitle")}</ModalTitle>
            <ModalDescription>
              {t("deleteDescription", {
                concept: transaction.concept || t("noDescription"),
                amount: transaction.amount.toFixed(2),
              })}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t("deleting") : t("delete")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

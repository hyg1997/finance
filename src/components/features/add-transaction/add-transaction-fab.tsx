"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { FloatingActionButton } from "@/components/ui/floating-action-button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";
import { Group } from "@/types/supabase";

import { TransactionForm } from "./transaction-form";

interface AddTransactionFABProps {
  groups?: Group[];
  onTransactionAdded?: () => void;
}

export function AddTransactionFAB({
  groups = [],
  onTransactionAdded,
}: AddTransactionFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("addTransaction");

  const handleTransactionSuccess = () => {
    setIsOpen(false);
    onTransactionAdded?.();
  };

  return (
    <>
      <FloatingActionButton
        onClick={() => setIsOpen(true)}
        icon={<Plus className="h-6 w-6" />}
        label={t("label")}
        aria-label={t("ariaLabel")}
      />

      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{t("title")}</ModalTitle>
            <ModalDescription>{t("description")}</ModalDescription>
          </ModalHeader>

          <div className="p-6 pt-0">
            <TransactionForm
              groups={groups}
              onCancel={() => setIsOpen(false)}
              onSuccess={handleTransactionSuccess}
            />
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}

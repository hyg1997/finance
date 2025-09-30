import { z } from "zod";

// Función para obtener mensajes de error traducidos
const getErrorMessages = () => ({
  required: "Este campo es requerido",
  invalidEmail: "Email inválido",
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `Debe tener máximo ${max} caracteres`,
  positiveNumber: "Debe ser un número positivo",
  invalidType: "Tipo inválido",
});

const errorMessages = getErrorMessages();

export const transactionSchema = z.object({
  concept: z
    .string()
    .min(1, errorMessages.required)
    .max(100, errorMessages.maxLength(100)),
  amount: z
    .number()
    .positive(errorMessages.positiveNumber),
  type: z.enum(["income", "expense"], {
    message: errorMessages.invalidType,
  }),
  group_id: z.string().min(1, errorMessages.required),
});

export const groupSchema = z.object({
  name: z
    .string()
    .min(1, errorMessages.required)
    .max(50, errorMessages.maxLength(50)),
  description: z
    .string()
    .max(200, errorMessages.maxLength(200))
    .optional(),
});

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, errorMessages.required)
    .max(100, errorMessages.maxLength(100)),
  email: z
    .string()
    .email(errorMessages.invalidEmail),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type GroupFormData = z.infer<typeof groupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;

const VALIDATION_RULES = {
  transaction: {
    amount: {
      min: 0.01,
      max: 999999.99,
    },
    concept: {
      minLength: 1,
      maxLength: 255,
    },
  },
  group: {
    name: {
      minLength: 1,
      maxLength: 100,
    },
    percentage: {
      min: 0.01,
      max: 100,
    },
  },
} as const;

export function validateTransactionForm(
  data: Partial<TransactionFormData>
): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {};

  if (data.amount === undefined || data.amount === null) {
    errors["amount"] = errorMessages.required;
  } else if (data.amount < VALIDATION_RULES.transaction.amount.min) {
    errors["amount"] = `Debe ser al menos ${VALIDATION_RULES.transaction.amount.min}`;
  } else if (data.amount > VALIDATION_RULES.transaction.amount.max) {
    errors["amount"] = `No debe exceder ${VALIDATION_RULES.transaction.amount.max}`;
  }

  if (!data.concept || data.concept.trim().length === 0) {
    errors["concept"] = errorMessages.required;
  } else if (
    data.concept.length < VALIDATION_RULES.transaction.concept.minLength
  ) {
    errors["concept"] = errorMessages.minLength(VALIDATION_RULES.transaction.concept.minLength);
  } else if (
    data.concept.length > VALIDATION_RULES.transaction.concept.maxLength
  ) {
    errors["concept"] = errorMessages.maxLength(VALIDATION_RULES.transaction.concept.maxLength);
  }

  if (!data.type) {
    errors["type"] = errorMessages.required;
  } else if (!["income", "expense"].includes(data.type)) {
    errors["type"] = errorMessages.invalidType;
  }

  return errors;
}

export function validateGroupForm(
  data: Partial<GroupFormData>
): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors["name"] = errorMessages.required;
  } else if (data.name.length < VALIDATION_RULES.group.name.minLength) {
    errors["name"] = errorMessages.minLength(VALIDATION_RULES.group.name.minLength);
  } else if (data.name.length > VALIDATION_RULES.group.name.maxLength) {
    errors["name"] = errorMessages.maxLength(VALIDATION_RULES.group.name.maxLength);
  }

  return errors;
}

export function hasValidationErrors(
  errors: Record<string, string | undefined>
): boolean {
  return Object.values(errors).some(
    (error) => error !== undefined && error !== ""
  );
}

export function sanitizeString(input: string): string {
  return input.trim();
}

export function sanitizeNumber(input: number | string): number {
  const num = typeof input === "string" ? parseFloat(input) : input;
  return isNaN(num) ? 0 : num;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

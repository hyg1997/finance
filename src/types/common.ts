export type RequiredNonNull<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

export type PickRequired<T, K extends keyof T> = Required<Pick<T, K>>;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export interface ApiResponse<TData = unknown, TError = string> {
  data: TData | null;
  error: TError | null;
  loading: boolean;
  success: boolean;
}

export interface AsyncState<TData = unknown, TError = Error> {
  data: TData | null;
  error: TError | null;
  loading: boolean;
  lastFetch?: Date;
}

export interface FieldError {
  message: string;
  type: "required" | "pattern" | "min" | "max" | "custom";
}

export interface ValidationState {
  isValid: boolean;
  errors: Record<string, FieldError>;
  touched: Record<string, boolean>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface SortParams<T = string> {
  field: T;
  direction: "asc" | "desc";
}

export interface FilterParams<T = Record<string, unknown>> {
  filters: T;
  search?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithClassName {
  className?: string;
}

export interface WithLoading {
  loading?: boolean;
}

export interface WithDisabled {
  disabled?: boolean;
}

export interface BaseComponentProps
  extends WithChildren,
    WithClassName,
    WithLoading,
    WithDisabled {}

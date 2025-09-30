import { useState, useCallback, useEffect } from "react";

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

interface UseAsyncOptions {
  immediate?: boolean;
}

interface UseAsyncReturn<T, TArgs extends unknown[] = unknown[]> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: (...args: TArgs) => Promise<T | null>;
  reset: () => void;
}

export function useAsync<T, TArgs extends unknown[] = unknown[]>(
  asyncFunction: (...args: TArgs) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T, TArgs> {
  const { immediate = false } = options;

  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: TArgs): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await asyncFunction(...args);
        setState({ data: result, error: null, isLoading: false });
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, error: errorObj, isLoading: false });
        return null;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as TArgs));
    }
  }, [execute, immediate]);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    execute,
    reset,
  };
}
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { readNumber } from '@/lib/format';

export type ParamSchema<T> = {
  [K in keyof T]: {
    key: string;
    fallback: T[K] extends number ? number : string;
    min?: number;
    max?: number;
  };
};

/**
 * Keeps calculator state in the URL query string so every scenario is a
 * shareable link, and reads incoming params to pre-fill pSEO landing pages.
 */
export function useUrlState<T extends Record<string, number | string>>(
  schema: ParamSchema<T>,
  onExternalChange?: (state: T) => void,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const readFromParams = useCallback((params: URLSearchParams): T => {
    const next = {} as T;
    (Object.keys(schemaRef.current) as (keyof T)[]).forEach((field) => {
      const def = schemaRef.current[field];
      const raw = params.get(def.key);
      if (typeof def.fallback === 'number') {
        next[field] = readNumber(raw, def.fallback, def.min ?? 0, def.max ?? Number.MAX_SAFE_INTEGER) as T[keyof T];
      } else {
        next[field] = (raw ?? def.fallback) as T[keyof T];
      }
    });
    return next;
  }, []);

  const [state, setState] = useState<T>(() => readFromParams(searchParams));

  const serialized = searchParams.toString();
  useEffect(() => {
    const next = readFromParams(new URLSearchParams(serialized));
    setState((current) => {
      const changed = (Object.keys(next) as (keyof T)[]).some((key) => next[key] !== current[key]);
      if (!changed) return current;
      onExternalChange?.(next);
      return next;
    });
    // onExternalChange intentionally excluded: callers pass inline closures.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, readFromParams]);

  const update = useCallback(
    (patch: Partial<T>, options: { replace?: boolean } = {}) => {
      const next = { ...state, ...patch };
      const params = new URLSearchParams(searchParams.toString());
      (Object.keys(schemaRef.current) as (keyof T)[]).forEach((field) => {
        const def = schemaRef.current[field];
        const value = next[field];
        if (value === def.fallback || value === '' || value === undefined) params.delete(def.key);
        else params.set(def.key, String(value));
      });
      setSearchParams(params, { replace: options.replace ?? true });
      setState(next);
    },
    [state, searchParams, setSearchParams],
  );

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams();
    (Object.keys(schemaRef.current) as (keyof T)[]).forEach((field) => {
      const def = schemaRef.current[field];
      const value = state[field];
      if (value !== def.fallback && value !== '' && value !== undefined) {
        params.set(def.key, String(value));
      }
    });
    const query = params.toString();
    return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
  }, [state]);

  return { state, update, shareUrl };
}

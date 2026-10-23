import { useCallback, useEffect, useState } from 'react';

export interface Preset<T> {
  id: string;
  name: string;
  savedAt: number;
  values: T;
}

const STORAGE_KEY = 'modelmath.presets.v1';

type PresetStore = Record<string, Preset<unknown>[]>;

function readStore(): PresetStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as PresetStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: PresetStore) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event('modelmath:presets-changed'));
  } catch {
    /* storage may be unavailable in private mode — presets are best-effort */
  }
}

/** Named, namespaced presets persisted in localStorage. */
export function usePresets<T>(namespace: string) {
  const [presets, setPresets] = useState<Preset<T>[]>([]);

  const refresh = useCallback(() => {
    const store = readStore();
    setPresets((store[namespace] as Preset<T>[] | undefined) ?? []);
  }, [namespace]);

  useEffect(() => {
    refresh();
    window.addEventListener('modelmath:presets-changed', refresh);
    return () => window.removeEventListener('modelmath:presets-changed', refresh);
  }, [refresh]);

  const save = useCallback(
    (name: string, values: T) => {
      const store = readStore();
      const existing = (store[namespace] as Preset<T>[] | undefined) ?? [];
      const trimmed = name.trim().slice(0, 48) || 'Untitled preset';
      const next = [
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: trimmed, savedAt: Date.now(), values },
        ...existing.filter((preset) => preset.name !== trimmed),
      ].slice(0, 8);
      store[namespace] = next as Preset<unknown>[];
      writeStore(store);
      setPresets(next);
    },
    [namespace],
  );

  const remove = useCallback(
    (id: string) => {
      const store = readStore();
      const existing = (store[namespace] as Preset<T>[] | undefined) ?? [];
      const next = existing.filter((preset) => preset.id !== id);
      store[namespace] = next as Preset<unknown>[];
      writeStore(store);
      setPresets(next);
    },
    [namespace],
  );

  return { presets, save, remove };
}

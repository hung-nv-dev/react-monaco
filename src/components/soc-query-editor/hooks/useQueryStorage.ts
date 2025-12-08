import { useState, useEffect, useCallback } from 'react';
import type { SavedQuery } from '../SOCQueryEditor.types';

const DEFAULT_STORAGE_KEY = 'socql-saved-queries';
const HISTORY_KEY = 'socql-query-history';
const MAX_HISTORY_ITEMS = 50;

export interface QueryHistory {
  query: string;
  timestamp: string;
}

export interface UseQueryStorageOptions {
  storageKey?: string;
  maxHistoryItems?: number;
  enabled?: boolean;
}

export interface UseQueryStorageReturn {
  savedQueries: SavedQuery[];
  saveQuery: (query: SavedQuery) => void;
  deleteQuery: (id: string) => void;
  updateQuery: (id: string, updates: Partial<SavedQuery>) => void;
  getQueryById: (id: string) => SavedQuery | undefined;
  queryHistory: QueryHistory[];
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  exportQueries: () => string;
  importQueries: (json: string) => boolean;
}

export function useQueryStorage(options: UseQueryStorageOptions = {}): UseQueryStorageReturn {
  const { storageKey = DEFAULT_STORAGE_KEY, maxHistoryItems = MAX_HISTORY_ITEMS, enabled = true } = options;

  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);

  useEffect(() => {
    if (!enabled) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedQueries(parsed);
      }
      const history = localStorage.getItem(HISTORY_KEY);
      if (history) {
        const parsed = JSON.parse(history);
        if (Array.isArray(parsed)) setQueryHistory(parsed);
      }
    } catch {
      // Ignore storage errors
    }
  }, [storageKey, enabled]);

  const persistQueries = useCallback((queries: SavedQuery[]) => {
    if (!enabled) return;
    try { localStorage.setItem(storageKey, JSON.stringify(queries)); } catch { /* ignore */ }
  }, [storageKey, enabled]);

  const persistHistory = useCallback((history: QueryHistory[]) => {
    if (!enabled) return;
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* ignore */ }
  }, [enabled]);

  const saveQuery = useCallback((query: SavedQuery) => {
    setSavedQueries((prev) => {
      const idx = prev.findIndex((q) => q.id === query.id);
      const newQueries = idx >= 0 ? [...prev.slice(0, idx), query, ...prev.slice(idx + 1)] : [query, ...prev];
      persistQueries(newQueries);
      return newQueries;
    });
  }, [persistQueries]);

  const deleteQuery = useCallback((id: string) => {
    setSavedQueries((prev) => {
      const newQueries = prev.filter((q) => q.id !== id);
      persistQueries(newQueries);
      return newQueries;
    });
  }, [persistQueries]);

  const updateQuery = useCallback((id: string, updates: Partial<SavedQuery>) => {
    setSavedQueries((prev) => {
      const newQueries = prev.map((q) => q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q);
      persistQueries(newQueries);
      return newQueries;
    });
  }, [persistQueries]);

  const getQueryById = useCallback((id: string) => savedQueries.find((q) => q.id === id), [savedQueries]);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    setQueryHistory((prev) => {
      const newHistory: QueryHistory[] = [
        { query, timestamp: new Date().toISOString() },
        ...prev.filter((h) => h.query !== query),
      ].slice(0, maxHistoryItems);
      persistHistory(newHistory);
      return newHistory;
    });
  }, [maxHistoryItems, persistHistory]);

  const clearHistory = useCallback(() => {
    setQueryHistory([]);
    if (enabled) {
      try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
    }
  }, [enabled]);

  const exportQueries = useCallback(() => JSON.stringify(savedQueries, null, 2), [savedQueries]);

  const importQueries = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) return false;

      const validQueries = parsed.filter((q): q is SavedQuery =>
        typeof q === 'object' && typeof q.id === 'string' && typeof q.name === 'string' && typeof q.query === 'string'
      );
      if (validQueries.length === 0) return false;

      setSavedQueries((prev) => {
        const existingIds = new Set(prev.map((q) => q.id));
        const newQueries = [...prev, ...validQueries.filter((q) => !existingIds.has(q.id))];
        persistQueries(newQueries);
        return newQueries;
      });
      return true;
    } catch {
      return false;
    }
  }, [persistQueries]);

  return {
    savedQueries, saveQuery, deleteQuery, updateQuery, getQueryById,
    queryHistory, addToHistory, clearHistory,
    exportQueries, importQueries,
  };
}

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Json } from '@/integrations/supabase/types';

interface UseSectionStateOptions<T> {
  initialData: T;
  onSave: (data: T) => void;
  debounceMs?: number;
}

/**
 * Custom hook for managing section-level state with debounced autosave.
 * Prevents input focus loss and slider reset issues by maintaining local state.
 */
export function useSectionState<T extends Record<string, unknown>>({
  initialData,
  onSave,
  debounceMs = 400,
}: UseSectionStateOptions<T>) {
  const [localData, setLocalData] = useState<T>(initialData);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Sync local state when initial data changes (from DB load)
  // But only on first load or when data comes from server
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLocalData(initialData);
    }
  }, [initialData]);

  // Update a single field
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setLocalData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Debounce the save
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        setHasLocalChanges(true);
        onSave(newData);
      }, debounceMs);
      
      return newData;
    });
  }, [onSave, debounceMs]);

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<T>) => {
    setLocalData((prev) => {
      const newData = { ...prev, ...updates };
      
      // Debounce the save
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        setHasLocalChanges(true);
        onSave(newData);
      }, debounceMs);
      
      return newData;
    });
  }, [onSave, debounceMs]);

  // Reset local changes flag when save completes
  const markSaved = useCallback(() => {
    setHasLocalChanges(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    data: localData,
    updateField,
    updateFields,
    hasLocalChanges,
    markSaved,
    setData: setLocalData,
  };
}

/**
 * Merge new section data with existing data to prevent overwrites.
 * Ensures arrays and nested objects are properly merged.
 */
export function mergeSectionData<T extends Record<string, unknown>>(
  existing: T | null | undefined,
  updates: Partial<T>
): T {
  if (!existing) {
    return updates as T;
  }

  const merged = { ...existing };

  for (const key in updates) {
    const updateValue = updates[key];
    const existingValue = existing[key];

    if (Array.isArray(updateValue)) {
      // For arrays, replace entirely (for things like parental_concerns)
      merged[key] = updateValue as T[Extract<keyof T, string>];
    } else if (
      typeof updateValue === 'object' &&
      updateValue !== null &&
      typeof existingValue === 'object' &&
      existingValue !== null &&
      !Array.isArray(existingValue)
    ) {
      // For nested objects, merge recursively
      merged[key] = {
        ...existingValue,
        ...updateValue,
      } as T[Extract<keyof T, string>];
    } else {
      // For primitives, replace
      merged[key] = updateValue as T[Extract<keyof T, string>];
    }
  }

  return merged;
}

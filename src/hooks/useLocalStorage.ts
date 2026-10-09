import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type StoredValueParser<T> = (value: unknown) => T;
export type LocalStorageState<T> = [T, Dispatch<SetStateAction<T>>, string];

// The parser must validate unknown JSON and throw if it cannot produce T.
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  parseStoredValue: StoredValueParser<T>,
): LocalStorageState<T> {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return initialValue;
      const parsed: unknown = JSON.parse(saved);
      return parseStoredValue(parsed);
    } catch {
      return initialValue;
    }
  });
  const [storageError, setStorageError] = useState<string>('');

  useEffect(() => {
    // Cancel pending writes on cleanup, including React Strict Mode's replay.
    const timeout = window.setTimeout(() => {
      try {
        const serialized = JSON.stringify(value);
        if (serialized === undefined) throw new TypeError('Value is not JSON serializable');
        localStorage.setItem(key, serialized);
        setStorageError('');
      } catch {
        setStorageError('Your browser could not save changes. You can keep using the tracker, but changes may be lost when you reload.');
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [key, value]);

  return [value, setValue, storageError];
}

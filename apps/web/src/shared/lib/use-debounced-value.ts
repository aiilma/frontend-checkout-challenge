import { useEffect, useState } from 'react';

export const useDebouncedValue = <T>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);
  const serialized = JSON.stringify(value);

  useEffect(() => {
    if (JSON.stringify(debounced) === serialized) return;
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [debounced, delayMs, serialized, value]);

  return debounced;
};

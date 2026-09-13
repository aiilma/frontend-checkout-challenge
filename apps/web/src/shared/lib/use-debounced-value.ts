import { useEffect, useRef, useState } from 'react';

export const useDebouncedValue = <T>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);
  const serialized = JSON.stringify(value);
  const applied = useRef(serialized);
  const latest = useRef(value);

  useEffect(() => {
    latest.current = value;
  });

  useEffect(() => {
    if (applied.current === serialized) return;
    const timer = setTimeout(() => {
      applied.current = serialized;
      setDebounced(latest.current);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [delayMs, serialized]);

  return debounced;
};

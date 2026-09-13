export const indexBy = <T, K>(items: readonly T[], keyOf: (item: T) => K) => {
  const index = new Map<K, T>();
  for (const item of items) index.set(keyOf(item), item);
  return index;
};

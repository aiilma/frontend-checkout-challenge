const attempt = <T>(action: () => T, fallback: T): T => {
  try {
    return action();
  } catch {
    return fallback;
  }
};

export const readStored = (key: string) => attempt(() => localStorage.getItem(key), null);

export const writeStored = (key: string, value: string) => {
  attempt(() => {
    localStorage.setItem(key, value);
  }, undefined);
};

export const removeStored = (key: string) => {
  attempt(() => {
    localStorage.removeItem(key);
  }, undefined);
};

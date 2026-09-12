import { readStored, removeStored, writeStored } from '@/shared/lib/storage';

const TOKEN_KEY = 'checkout.session.token';

type CreateToken = () => Promise<string>;

let creating: Promise<string> | null = null;

const createOnce = (create: CreateToken) => {
  creating ??= create()
    .then((token) => {
      writeStored(TOKEN_KEY, token);
      return token;
    })
    .finally(() => {
      creating = null;
    });
  return creating;
};

export const ensureToken = (create: CreateToken) => {
  const stored = readStored(TOKEN_KEY);
  return stored ? Promise.resolve(stored) : createOnce(create);
};

export const renewToken = (create: CreateToken) => {
  removeStored(TOKEN_KEY);
  return createOnce(create);
};

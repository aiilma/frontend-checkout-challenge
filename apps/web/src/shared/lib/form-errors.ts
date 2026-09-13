import { type FieldValues, type Path, type UseFormSetError } from 'react-hook-form';

import { type ApiErrorField } from '@/shared/api/error';

const toFormPath = (path: string) => path.replace(/^body\//, '').replaceAll('/', '.');

export const applyFieldErrors = <T extends FieldValues, P extends Path<T>>(
  fields: ApiErrorField[],
  setError: UseFormSetError<T>,
  isFormPath: (path: string) => path is P,
  messageFor: (path: P) => string,
) => {
  for (const field of fields) {
    const path = toFormPath(field.path);
    if (isFormPath(path)) setError(path, { type: 'server', message: messageFor(path) });
  }
};

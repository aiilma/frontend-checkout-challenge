import { type FieldValues, type Path, type UseFormSetError } from 'react-hook-form';

import { type ApiErrorField } from '@/shared/api/error';

const SERVER_FIELD_MESSAGE = 'Сервер не принял значение. Проверьте поле и отправьте снова.';

const toFormPath = (path: string) => path.replace(/^body\//, '').replaceAll('/', '.');

export const applyFieldErrors = <T extends FieldValues>(
  fields: ApiErrorField[],
  setError: UseFormSetError<T>,
) => {
  for (const field of fields) {
    setError(toFormPath(field.path) as Path<T>, { type: 'server', message: SERVER_FIELD_MESSAGE });
  }
};

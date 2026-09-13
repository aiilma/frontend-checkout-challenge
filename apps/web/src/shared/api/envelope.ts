import { type AxiosResponse } from 'axios';
import { z } from 'zod';

import { parseFailure } from './error';

const envelopeSchema = z.object({
  data: z.unknown(),
  meta: z.object({ requestId: z.string() }),
});

export const parseEnvelope = (response: AxiosResponse<unknown>): unknown => {
  if (response.status === 204) return undefined;
  const envelope = envelopeSchema.safeParse(response.data);
  if (!envelope.success) throw parseFailure(response, envelope.error);
  return envelope.data.data;
};

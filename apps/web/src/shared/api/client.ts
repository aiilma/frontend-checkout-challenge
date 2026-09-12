import axios from 'axios';

import { apiBaseUrl } from '@/shared/config/env';

export const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  headers: { Accept: 'application/json' },
});

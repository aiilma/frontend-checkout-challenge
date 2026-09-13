import { type Static } from '@sinclair/typebox';

import { type SandboxSchema } from '@checkout/contracts';

export type Sandbox = Static<typeof SandboxSchema>;
export type SandboxCard = Sandbox['cards'][number];

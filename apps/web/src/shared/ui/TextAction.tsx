import { type ComponentProps } from 'react';

import { Glyph } from '@/shared/ui/Glyph';
import { Button } from '@/shared/ui/shadcn/button';

interface TextActionProps extends ComponentProps<'button'> {
  glyph: 'plus' | 'minus' | 'arrow';
}

export const TextAction = ({ glyph, children, type = 'button', ...props }: TextActionProps) => (
  <Button variant="text" type={type} {...props}>
    <Glyph name={glyph} />
    {children}
  </Button>
);

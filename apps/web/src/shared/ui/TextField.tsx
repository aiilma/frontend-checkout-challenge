import { type ComponentProps, useId } from 'react';

import { Glyph } from '@/shared/ui/Glyph';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';

interface TextFieldProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
}

export const TextField = ({ label, error, className, ...props }: TextFieldProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className="mt-1 flex items-center gap-1 text-caption">
          <Glyph name="arrow" className="text-accent" />
          {error}
        </span>
      )}
    </div>
  );
};

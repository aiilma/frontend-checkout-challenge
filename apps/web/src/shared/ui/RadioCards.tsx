import { useId } from 'react';

import { cn } from '@/shared/lib/cn';

import { Glyph } from '@/shared/ui/Glyph';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/shadcn/radio-group';

export interface RadioCardOption {
  value: string;
  title: string;
  description?: string;
}

interface RadioCardsProps {
  label: string;
  options: RadioCardOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorGlyphClassName?: string;
}

export const RadioCards = ({
  label,
  options,
  value,
  onChange,
  error,
  disabled,
  className,
  itemClassName,
  labelClassName = 'text-muted',
  descriptionClassName = 'text-muted',
  errorGlyphClassName = 'text-warning',
}: RadioCardsProps) => {
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <span id={labelId} className={cn('mb-2 block text-caption', labelClassName)}>
        {label}
      </span>
      <RadioGroup
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        {options.map((option) => (
          <RadioGroupItem key={option.value} value={option.value} className={itemClassName}>
            <span className="flex flex-col">
              <span>{option.title}</span>
              {option.description && (
                <span className={cn('text-caption', descriptionClassName)}>
                  {option.description}
                </span>
              )}
            </span>
          </RadioGroupItem>
        ))}
      </RadioGroup>
      {error && (
        <span id={errorId} className="mt-2 flex items-center gap-1 text-caption">
          <Glyph name="arrow" className={errorGlyphClassName} />
          {error}
        </span>
      )}
    </div>
  );
};

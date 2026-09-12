import { useId } from 'react';

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
}: RadioCardsProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <RadioGroup
        aria-label={label}
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
                <span className="text-caption text-muted">{option.description}</span>
              )}
            </span>
          </RadioGroupItem>
        ))}
      </RadioGroup>
      {error && (
        <span id={errorId} className="mt-1 flex items-center gap-1 text-caption">
          <Glyph name="arrow" className="text-accent" />
          {error}
        </span>
      )}
    </div>
  );
};

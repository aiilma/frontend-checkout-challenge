import { type ReactNode } from 'react';

interface FormSectionProps {
  title?: string;
  children: ReactNode;
}

export const FormSection = ({ title, children }: FormSectionProps) => (
  <section className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
    {title === undefined ? <div /> : <h2 className="text-section">{title}</h2>}
    <div className="flex flex-col gap-6">{children}</div>
  </section>
);

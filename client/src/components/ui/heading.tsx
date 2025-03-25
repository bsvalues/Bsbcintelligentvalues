import { ReactNode } from 'react';

interface HeadingProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function Heading({ title, description, children }: HeadingProps) {
  return (
    <div className="flex flex-col gap-1 mb-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
import { ReactNode } from 'react';

interface HeadingProps {
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function Heading({ title, description, children, icon, actions }: HeadingProps) {
  return (
    <div className="flex flex-col gap-2 mb-8 pb-4 border-b border-border">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 bg-primary/10 rounded-md text-primary">{icon}</div>}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
          </div>
        </div>
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
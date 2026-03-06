import { ReactNode } from 'react';

interface ModuleHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function ModuleHeader({ title, description, actions }: ModuleHeaderProps) {
  return (
    <div className="module-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="module-title">{title}</h1>
        <p className="module-description max-w-xl">{description}</p>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

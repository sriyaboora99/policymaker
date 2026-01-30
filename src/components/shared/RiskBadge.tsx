import { RiskLevel } from '@/types/policy';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const levelConfig = {
  low: {
    className: 'risk-low',
    icon: Info,
    label: 'Low Risk',
  },
  medium: {
    className: 'risk-medium',
    icon: AlertCircle,
    label: 'Medium Risk',
  },
  high: {
    className: 'risk-high',
    icon: AlertTriangle,
    label: 'High Risk',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function RiskBadge({ level, showLabel = true, size = 'md' }: RiskBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <span className={cn('risk-badge', config.className, sizeConfig[size])}>
      <Icon className={cn(
        size === 'sm' && 'h-3 w-3',
        size === 'md' && 'h-4 w-4',
        size === 'lg' && 'h-5 w-5',
      )} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

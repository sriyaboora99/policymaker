import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

const variantStyles = {
  default: 'before:bg-gradient-to-r before:from-secondary before:to-accent',
  primary: 'before:bg-gradient-to-r before:from-primary before:to-primary/80',
  success: 'before:bg-gradient-to-r before:from-success before:to-success/80',
  warning: 'before:bg-gradient-to-r before:from-warning before:to-warning/80',
  destructive: 'before:bg-gradient-to-r before:from-destructive before:to-destructive/80',
};

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className,
  variant = 'default'
}: StatCardProps) {
  return (
    <div className={cn('stat-card', variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          {trend.direction === 'up' && (
            <TrendingUp className="h-4 w-4 text-success" />
          )}
          {trend.direction === 'down' && (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          {trend.direction === 'neutral' && (
            <Minus className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={cn(
            'text-sm font-medium',
            trend.direction === 'up' && 'text-success',
            trend.direction === 'down' && 'text-destructive',
            trend.direction === 'neutral' && 'text-muted-foreground'
          )}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

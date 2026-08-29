import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs))
}

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'stable'
  change?: number
  unit?: string
  className?: string
  iconClassName?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  change,
  unit,
  className,
  iconClassName,
}: StatCardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  const trendColor =
    trend === 'up'
      ? 'text-green-600'
      : trend === 'down'
        ? 'text-red-600'
        : 'text-muted-foreground'

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10',
              iconClassName
            )}
          >
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      {(trend ?? change !== undefined) && (
        <div className={cn('mt-3 flex items-center gap-1 text-xs font-medium', trendColor)}>
          <TrendIcon className="h-3.5 w-3.5" />
          {change !== undefined && (
            <span>
              {change > 0 ? '+' : ''}
              {change}%
            </span>
          )}
          <span className="text-muted-foreground font-normal">vs last month</span>
        </div>
      )}
    </div>
  )
}

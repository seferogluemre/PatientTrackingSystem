
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard = ({ title, value, icon, description, trend, className }: StatsCardProps) => {
  return (
    <div className={cn(
      "bg-white border border-slate-200 rounded-xl p-5 shadow-card transition-all hover:shadow-card-hover",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          
          {trend && (
            <div className="flex items-center mt-1">
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded",
                trend.isPositive 
                  ? "text-green-800 bg-green-100" 
                  : "text-red-800 bg-red-100"
              )}>
                {trend.isPositive ? "+" : "-"}{trend.value}%
              </span>
              <span className="text-xs text-slate-500 ml-1">geçen haftaya göre</span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-slate-500 mt-2">{description}</p>
          )}
        </div>
        
        <div className="w-10 h-10 rounded-lg bg-clinic/10 flex items-center justify-center text-clinic">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

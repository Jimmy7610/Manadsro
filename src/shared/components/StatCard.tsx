import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

/**
 * Månadsro – Statistikkort med stor siffra.
 */
export default function StatCard({
  label,
  value,
  subtitle,
  icon,
  trend = 'neutral',
  className = '',
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${trend} ${className}`}>
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        {icon && <span className="stat-card__icon">{icon}</span>}
      </div>
      <div className="stat-card__value">{value}</div>
      {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
    </div>
  );
}

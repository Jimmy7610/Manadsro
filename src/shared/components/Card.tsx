import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'accent';
  animate?: boolean;
  style?: React.CSSProperties;
}

/**
 * Månadsro – Baskomponent för kort.
 * Används i dashboard och på alla sidor.
 */
export default function Card({
  children,
  className = '',
  variant = 'default',
  animate = true,
  style,
}: CardProps) {
  const classes = [
    'mr-card',
    `mr-card--${variant}`,
    animate ? 'animate-fade-in' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}

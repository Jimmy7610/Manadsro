import './LogoMark.css';

/**
 * Månadsro – Logo med måne + graf.
 * CSS/SVG-baserad logo, inga externa bilder.
 *
 * INSTÄLLNING - Logotypens storlek och färg kan justeras i CSS
 */

interface LogoMarkProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function LogoMark({ size = 32, showText = false, className = '' }: LogoMarkProps) {
  return (
    <div className={`logo-mark ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-mark__icon"
      >
        {/* Bakgrundscirkel */}
        <circle cx="16" cy="16" r="14" fill="var(--accent)" opacity="0.12" />
        {/* Måne */}
        <path
          d="M20 10a8 8 0 01-4 14 8 8 0 010-16"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Liten graf */}
        <path
          d="M10 22l4-6 3 3 5-7"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showText && <span className="logo-mark__text">Månadsro</span>}
    </div>
  );
}

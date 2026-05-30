import './VersionBadge.css';

/**
 * Månadsro – Versionsbricka.
 * Fast placerad i övre högra hörnet på alla sidor.
 *
 * INSTÄLLNING - Appnamn och buildnummer visas här
 */
const APP_NAME = 'Månadsro';
const BUILD_NUMBER = 'Build 18';

export default function VersionBadge() {
  return (
    <div className="version-badge">
      <span className="version-badge__text">{APP_NAME} • {BUILD_NUMBER}</span>
    </div>
  );
}

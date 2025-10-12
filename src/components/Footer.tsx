import React from 'react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

// Import version from package.json
import packageJson from '../../package.json';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span className="app-name">{t('app.title')}</span>
        <span className="version-info">v{packageJson.version}</span>
      </div>
    </footer>
  );
};

export default Footer;
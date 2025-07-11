import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { useTranslation } from 'react-i18next';
import './App.css';
import './styles/ThemeSelector.css';
import { store } from './store';
import TournamentBoard from './features/board/TournamentBoard';
import TournamentControls from './features/tournament/TournamentControls';
import PlayerManagement from './features/players/PlayerManagement';
import TournamentSettings from './features/settings/TournamentSettings';
import TournamentSummary from './features/tournament/TournamentSummary';

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

// Main application content
function AppContent() {
  const { t, i18n } = useTranslation();
  const [currentTheme, setCurrentTheme] = useState('default');
  const [activeTab, setActiveTab] = useState(0);

  const changeTheme = (theme: string) => {
    // Remove all existing theme classes
    document.documentElement.classList.remove(
      'theme-vegas-red',
      'theme-vegas-green',
      'theme-london',
      'theme-paris',
      'theme-netherlands',
      'dark-theme'
    );

    // Add the selected theme class
    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`);
    }

    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    // Load saved theme preference from local storage if available
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== 'default') {
      changeTheme(savedTheme);
      setCurrentTheme(savedTheme);
    }
  }, []);

  return (
    <div className="container">
      <div className="app-header">
        <div className="header-controls">
          <select 
            className="language-selector"
            value={i18n.language} 
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="he">עברית</option>
          </select>
          
          <div className="theme-selector">
            <div 
              className={`theme-option theme-vegas-blue ${currentTheme === 'default' ? 'active' : ''}`}
              onClick={() => changeTheme('default')}
              title="Vegas Blue"
            />
            <div 
              className={`theme-option theme-vegas-red ${currentTheme === 'vegas-red' ? 'active' : ''}`}
              onClick={() => changeTheme('vegas-red')}
              title="Vegas Red"
            />
            <div 
              className={`theme-option theme-vegas-green ${currentTheme === 'vegas-green' ? 'active' : ''}`}
              onClick={() => changeTheme('vegas-green')}
              title="Vegas Green"
            />
            <div 
              className={`theme-option theme-london ${currentTheme === 'london' ? 'active' : ''}`}
              onClick={() => changeTheme('london')}
              title="London"
            />
            <div 
              className={`theme-option theme-paris ${currentTheme === 'paris' ? 'active' : ''}`}
              onClick={() => changeTheme('paris')}
              title="Paris"
            />
            <div 
              className={`theme-option theme-netherlands ${currentTheme === 'netherlands' ? 'active' : ''}`}
              onClick={() => changeTheme('netherlands')}
              title="Netherlands"
            />
          </div>
        </div>
      </div>

      <div className="tournament-display">
        <TournamentBoard />
        <TournamentControls />
      </div>

      <div className="tab-container">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 0 ? 'active' : ''}`}
            onClick={() => setActiveTab(0)}
          >
            {t('player.management')}
          </button>
          <button 
            className={`tab-button ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            {t('tournament.setup')}
          </button>
          <button 
            className={`tab-button ${activeTab === 2 ? 'active' : ''}`}
            onClick={() => setActiveTab(2)}
          >
            {t('tournament.summary')}
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 0 && <PlayerManagement />}
          {activeTab === 1 && <TournamentSettings />}
          {activeTab === 2 && <TournamentSummary />}
        </div>
      </div>
    </div>
  );
}

export default App;

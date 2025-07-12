import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { deleteTournament, importHistory, replaceHistory } from '../history/historySlice';
import { formatCurrency } from '../../utils/tournament';
import { formatDuration } from '../../utils/history';
import { downloadHistoryCSV, importHistoryFromCSV } from '../../utils/csv';
import TournamentStatistics from './TournamentStatistics';
import type { RootState } from '../../store';
import type { SavedTournament } from '../../types';
import './TournamentHistory.css';
import './history-buttons.css';

const TournamentHistory: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const savedTournaments = useAppSelector((state: RootState) => (state as any).history.savedTournaments);
  const [selectedTournament, setSelectedTournament] = useState<SavedTournament | null>(null);
  const [showStatistics, setShowStatistics] = useState<boolean>(false);
  
  const handleTournamentSelect = (tournament: SavedTournament) => {
    setSelectedTournament(tournament);
    setShowStatistics(false);
  };
  
  const handleDeleteTournament = (id: string) => {
    if (window.confirm(t('history.confirmDelete'))) {
      dispatch(deleteTournament(id));
      if (selectedTournament?.id === id) {
        setSelectedTournament(null);
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const handleExportCSV = () => {
    // Add date to filename in format YYYY-MM-DD
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // Gets YYYY-MM-DD format
    const filename = `tournament-history-${dateStr}.csv`;
    
    downloadHistoryCSV(savedTournaments, filename);
    alert(t('history.exportSuccess'));
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const importedTournaments = importHistoryFromCSV(content);
      
      if (importedTournaments) {
        if (window.confirm(t('confirm.replaceData'))) {
          dispatch(replaceHistory(importedTournaments));
        } else {
          dispatch(importHistory(importedTournaments));
        }
        alert(t('history.importSuccess'));
      } else {
        alert(t('history.importError'));
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };
  
  return (
    <div className="tournament-history">
      <h2>{t('history.title')}</h2>
      
      {/* Always show import button for data transfer */}
      <div className="export-import-buttons" style={{ marginBottom: '20px' }}>
        {savedTournaments.length > 0 && (
          <button 
            className="export-csv-btn"
            onClick={handleExportCSV}
            title={t('history.exportCSV')}
          >
            {t('history.exportCSV')}
          </button>
        )}
        <button 
          className="import-csv-btn"
          onClick={handleImportClick}
          title={t('history.importCSV')}
        >
          {t('history.importCSV')}
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          style={{ display: 'none' }} 
          accept=".csv"
          onChange={handleImportCSV}
        />
      </div>
      
      {savedTournaments.length === 0 ? (
        <div className="no-tournaments">
          <p>{t('history.noTournaments')}</p>
        </div>
      ) : (
        <>
          <div className="tab-buttons" style={{ marginBottom: '20px' }}>
            <button 
              className={`tab-button ${!showStatistics ? 'active' : ''}`}
              onClick={() => setShowStatistics(false)}
            >
              {t('history.savedTournaments')}
            </button>
            <button 
              className={`tab-button ${showStatistics ? 'active' : ''}`}
              onClick={() => setShowStatistics(true)}
            >
              {t('history.statistics')}
            </button>
          </div>
          
          {showStatistics ? (
            <TournamentStatistics />
          ) : (
            <div className="history-container">
              <div className="tournaments-list">
                <h3>{t('history.savedTournaments')}</h3>
                {savedTournaments.map((tournament: SavedTournament) => (
                  <div 
                    key={tournament.id} 
                    className={`tournament-item ${selectedTournament?.id === tournament.id ? 'selected' : ''}`}
                    onClick={() => handleTournamentSelect(tournament)}
                  >
                    <div className="tournament-item-header">
                      <h4>{tournament.name}</h4>
                      <span className="tournament-date">{formatDate(tournament.date)}</span>
                    </div>
                    <div className="tournament-item-details">
                      <span>{t('tournament.entryFee')}: {formatCurrency(tournament.entryFee)}</span>
                      <span>{t('statistics.totalPlayers')}: {tournament.totalPlayers}</span>
                      <span>{t('statistics.totalEntries')}: {tournament.totalEntries}</span>
                      <span>{t('statistics.prizePool')}: {formatCurrency(tournament.totalPrizePool)}</span>
                      <span>{t('history.duration')}: {formatDuration(tournament.duration)}</span>
                    </div>
                    <button 
                      className="delete-tournament-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTournament(tournament.id);
                      }}
                    >
                      {t('history.delete')}
                    </button>
                  </div>
                ))}
              </div>
              
              {selectedTournament && (
                <div className="tournament-details">
                  <h3>{t('history.tournamentDetails')}</h3>
                  <div className="tournament-header">
                    <h2>{selectedTournament.name}</h2>
                    <div className="tournament-meta">
                      <span>{formatDate(selectedTournament.date)}</span>
                      <span>{t('history.duration')}: {formatDuration(selectedTournament.duration)}</span>
                    </div>
                  </div>
                  
                  <div className="tournament-stats">
                    <div className="stat-box">
                      <div className="stat-label">{t('tournament.entryFee')}</div>
                      <div className="stat-value">{formatCurrency(selectedTournament.entryFee)}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">{t('tournament.startingChips')}</div>
                      <div className="stat-value">{selectedTournament.startingChips.toLocaleString()}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">{t('statistics.totalPlayers')}</div>
                      <div className="stat-value">{selectedTournament.totalPlayers}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">{t('statistics.totalEntries')}</div>
                      <div className="stat-value">{selectedTournament.totalEntries}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">{t('statistics.prizePool')}</div>
                      <div className="stat-value">{formatCurrency(selectedTournament.totalPrizePool)}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">{t('tournament.playWithAnte')}</div>
                      <div className="stat-value">{selectedTournament.playWithAnte ? t('settings.on') : t('settings.off')}</div>
                    </div>
                  </div>
                  
                  <h3>{t('history.finalStandings')}</h3>
                  <div className="players-standings">
                    <div className="players-list-header">
                      <div className="player-position">{t('statistics.position')}</div>
                      <div className="player-name">{t('player.name')}</div>
                      <div className="player-entries">{t('statistics.entries')}</div>
                      <div className="player-chips">{t('player.chips')}</div>
                      <div className="player-cash">{t('statistics.cashEquivalent')}</div>
                      <div className="player-profit">{t('statistics.profit')}</div>
                    </div>
                    
                    {/* Sort players by profit before displaying */}
                    {[...selectedTournament.players]
                      .sort((a, b) => b.profit - a.profit)
                      .map((player) => (
                      <div key={player.id} className="player-row">
                        <div className="player-position">{player.finalPosition}</div>
                        <div className="player-name">{player.name}</div>
                        <div className="player-entries">{player.entries}</div>
                        <div className="player-chips">{player.finalChips.toLocaleString()}</div>
                        <div className="player-cash">{formatCurrency(player.cashEquivalent)}</div>
                        <div className={`player-profit ${player.profit >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(player.profit)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TournamentHistory;

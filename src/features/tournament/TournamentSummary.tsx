import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { 
  calculateStatistics, 
  formatCurrency, 
  exportTournamentSummaryAsText,
  exportTournamentSummaryAsImage,
  calculateProfit
} from '../../utils/tournament';
import { createTournamentRecord } from '../../utils/history';
import { updateFinalChips } from '../tournament/tournamentSlice';
import { saveTournament } from '../history/historySlice';
import type { RootState } from '../../store';
import type { Player } from '../../types';
import { format } from 'date-fns';
import './TournamentSummary.css';

const TournamentSummary = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const playersList = useAppSelector((state: RootState) => (state as any).players.list);
  const { 
    entryFee, 
    startingChips, 
    name: tournamentName, 
    cashoutPlaces,
    finalChips: savedFinalChips,
    playWithAnte
  } = useAppSelector((state: RootState) => (state as any).tournament.settings);
  const tournamentState = useAppSelector((state: RootState) => (state as any).tournament.state);
  
  const [finalChips, setFinalChips] = useState<Record<string, number>>(savedFinalChips || {});
  const [players, setPlayers] = useState<Player[]>([]);
  
  const stats = calculateStatistics(playersList, entryFee, startingChips);
  
  // Calculate entries for each player
  useEffect(() => {
    const playersWithEntries = playersList.map((player: Player) => ({
      ...player,
      entries: player.rebuys + 1
    }));
    setPlayers(playersWithEntries);
  }, [playersList]);

  // Handle updating chip counts for active players
  const handleUpdateChips = (playerId: string, chips: number) => {
    const updated = { ...finalChips, [playerId]: chips };
    setFinalChips(updated);
    dispatch(updateFinalChips(updated));
  };

  // Export tournament summary
  const handleExportSummaryAsText = () => {
    exportTournamentSummaryAsText(
      tournamentName, 
      players, 
      entryFee, 
      startingChips, 
      cashoutPlaces,
      finalChips,
      playWithAnte
    );
  };

  const handleExportSummaryAsImage = () => {
    exportTournamentSummaryAsImage(
      tournamentName, 
      players, 
      entryFee, 
      startingChips, 
      cashoutPlaces,
      finalChips,
      playWithAnte
    );
  };

  const handleSaveTournament = () => {
    const tournamentRecord = createTournamentRecord(
      tournamentName,
      players,
      entryFee,
      startingChips,
      tournamentState.elapsedTime,
      finalChips,
      playWithAnte
    );
    dispatch(saveTournament(tournamentRecord));
    
    // Show a confirmation message
    alert(t('tournament.savedSuccessfully'));
  };

  return (
    <div className="tournament-summary">
      <div className="summary-header">
        <h2>{t('tournament.summary')}</h2>
        <div className="export-buttons">
          <button 
            className="export-btn"
            onClick={handleExportSummaryAsText}
          >
            {t('export.asText')}
          </button>
          <button 
            className="export-image-btn"
            onClick={handleExportSummaryAsImage}
          >
            {t('export.asImage')}
          </button>
          <button 
            className="save-tournament-btn"
            onClick={handleSaveTournament}
          >
            {t('tournament.save')}
          </button>
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-box">
          <div className="stat-label">{t('tournament.name')}</div>
          <div className="stat-value">{tournamentName}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">{t('tournament.entryFee')}</div>
          <div className="stat-value">{formatCurrency(entryFee)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">{t('statistics.totalEntries')}</div>
          <div className="stat-value">{stats.totalEntries}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">{t('statistics.prizePool')}</div>
          <div className="stat-value">{formatCurrency(stats.totalPrizePool)}</div>
        </div>
      </div>

      <h3 className="players-title">{t('statistics.playersList')}</h3>
      <p className="chips-edit-instruction">
        {tournamentState.isRunning ? t('statistics.finalChipsInstructions') : t('statistics.finalStandings')}
      </p>

      <div className="players-list">
        <div className="players-list-header">
          <div className="player-name">{t('player.name')}</div>
          <div className="player-entries">{t('statistics.entries')}</div>
          <div className="player-chips">{t('player.chips')}</div>
          <div className="player-status">{t('player.status')}</div>
        </div>
        
        {players
          .sort((a, b) => {
            // Active players first, sorted by chips
            if (a.active && !b.active) return -1;
            if (!a.active && b.active) return 1;
            
            // Then by chip count for active players
            if (a.active && b.active) {
              const aChips = finalChips[a.id] !== undefined ? finalChips[a.id] : a.chips;
              const bChips = finalChips[b.id] !== undefined ? finalChips[b.id] : b.chips;
              return bChips - aChips;
            }
            
            // Then by name for eliminated players
            return a.name.localeCompare(b.name);
          })
          .map((player) => {
            const playerChips = finalChips[player.id] !== undefined ? finalChips[player.id] : player.chips;
            
            return (
              <div key={player.id} className={`player-row ${player.active ? 'active' : 'eliminated'}`}>
                <div className="player-name">{player.name}</div>
                <div className="player-entries">{player.entries}</div>
                <div className="player-chips">
                  {player.active ? (
                    <input
                      type="number"
                      value={playerChips}
                      onChange={(e) => handleUpdateChips(player.id, Number(e.target.value))}
                      min={0}
                      step={100}
                      className="chip-input"
                    />
                  ) : (
                    playerChips.toLocaleString()
                  )}
                </div>
                <div className="player-status">
                  {player.active ? (
                    <span className="status-active">{t('player.active')}</span>
                  ) : (
                    <span className="status-eliminated">
                      {t('player.eliminated')} {player.eliminatedAt && `${t('player.atLevel')} ${player.eliminatedAt}`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default TournamentSummary;

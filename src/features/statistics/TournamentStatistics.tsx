import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { 
  calculateStatistics, 
  calculateCashEquivalent, 
  formatCurrency, 
  calculatePrizeDistribution,
  exportTournamentSummaryAsText,
  exportTournamentSummaryAsImage
} from '../../utils/tournament';
import { updateFinalChips } from '../../features/tournament/tournamentSlice';
import type { RootState } from '../../store';
import type { Player } from '../../types';
import { format } from 'date-fns';
import { toPng } from 'html-to-image';
import './Statistics.css';

interface TournamentStatisticsProps {
  displayMode?: 'full' | 'board';
}

const TournamentStatistics: React.FC<TournamentStatisticsProps> = ({ displayMode = 'full' }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  // Using non-null assertion since we know these state slices exist
  const playersList = useAppSelector((state: RootState) => (state as any).players.list);
  const { 
    entryFee, 
    startingChips, 
    name: tournamentName, 
    numberOfWinners,
    cashoutPlaces,
    finalChips: savedFinalChips,
    playWithAnte 
  } = useAppSelector((state: RootState) => (state as any).tournament.settings);
  const tournamentState = useAppSelector((state: RootState) => (state as any).tournament.state);
  
  const [chipCount, setChipCount] = useState(startingChips);
  const [cashEquivalent, setCashEquivalent] = useState(entryFee);
  const [showSummary, setShowSummary] = useState(false);
  const [finalChips, setFinalChips] = useState<Record<string, number>>(savedFinalChips || {});
  const [players, setPlayers] = useState<Player[]>([]);
  const statsCardRef = useRef<HTMLDivElement>(null);
  
  const stats = calculateStatistics(playersList, entryFee, startingChips);
  
  // Calculate entries for each player
  useEffect(() => {
    const playersWithEntries = playersList.map((player: Player) => ({
      ...player,
      entries: player.rebuys + 1
    }));
    setPlayers(playersWithEntries);
  }, [playersList]);

  const handleCalculate = () => {
    const cash = calculateCashEquivalent(chipCount, startingChips, entryFee);
    setCashEquivalent(cash);
  };

  const exportTournamentResults = () => {
    try {
      // Sort players by profit (descending), using final chips if available
      const sortedPlayers = [...players].sort((a, b) => {
        const aChips = a.active ? (finalChips[a.id] !== undefined ? finalChips[a.id] : a.chips) : 0;
        const bChips = b.active ? (finalChips[b.id] !== undefined ? finalChips[b.id] : b.chips) : 0;
        
        const aEntryCost = entryFee * (1 + a.rebuys);
        const bEntryCost = entryFee * (1 + b.rebuys);
        const aCashEquivalent = a.active ? calculateCashEquivalent(aChips, startingChips, entryFee) : 0;
        const bCashEquivalent = b.active ? calculateCashEquivalent(bChips, startingChips, entryFee) : 0;
        const aProfit = a.active ? aCashEquivalent - aEntryCost : -aEntryCost;
        const bProfit = b.active ? bCashEquivalent - bEntryCost : -bEntryCost;
        
        // Sort by profit (descending)
        return bProfit - aProfit;
      });
      
      // Calculate prize distribution
      const prizeDistribution = calculatePrizeDistribution(stats.totalPrizePool, cashoutPlaces || numberOfWinners);
      
      // Create the export content
      const date = format(new Date(), 'yyyy-MM-dd HH:mm');
      let content = `${tournamentName} - ${date}\n\n`;
      
      // Tournament Info
      content += `${t('statistics.tournamentInfo')}:\n`;
      content += `${t('tournament.entryFee')}: ${formatCurrency(entryFee)}\n`;
      content += `${t('tournament.startingChips')}: ${startingChips}\n`;
      content += `${t('statistics.totalEntries')}: ${stats.totalEntries}\n`;
      content += `${t('statistics.totalPrizePool')}: ${formatCurrency(stats.totalPrizePool)}\n\n`;
      
      // Winners and Prizes
      if (tournamentState.isRunning) {
        content += `${t('statistics.currentStandings')}:\n`;
      } else {
        content += `${t('statistics.finalStandings')}:\n`;
      }
      
      // Add player rankings
      sortedPlayers.forEach((player, index) => {
        const position = index + 1;
        const prize = position <= (cashoutPlaces || numberOfWinners) ? prizeDistribution[index] : 0;
        const playerChips = finalChips[player.id] !== undefined ? finalChips[player.id] : player.chips;
        const status = player.active ? 
          `${playerChips.toLocaleString()} ${t('player.chips')}` : 
          (player.eliminated ? `${t('player.eliminated')} ${t('player.atLevel')} ${player.eliminatedAt}` : t('player.inactive'));
        
        content += `${position}. ${player.name} - ${status}`;
        if (prize > 0) {
          content += ` - ${formatCurrency(prize)}`;
        }
        content += `\n`;
      });
      
      // Create a download link
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tournamentName.replace(/\s+/g, '-')}-results-${format(new Date(), 'yyyyMMdd')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success message
      alert(t('statistics.exportSuccess'));
    } catch (error) {
      console.error('Error exporting tournament results:', error);
      alert(t('statistics.exportError'));
    }
  };

  const exportAsImage = async () => {
    try {
      if (!statsCardRef.current) return;
      
      // Create a clone of the stats card without buttons for a cleaner image
      const originalElement = statsCardRef.current;
      const clonedElement = originalElement.cloneNode(true) as HTMLElement;
      
      // Remove only specific buttons while keeping stats data
      const buttonsToRemove = clonedElement.querySelectorAll('.export-buttons, .calculate-btn');
      buttonsToRemove.forEach(btn => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      });
      
      // Keep the input fields but make them read-only for the image
      const inputs = clonedElement.querySelectorAll('input');
      inputs.forEach(input => {
        input.setAttribute('readonly', 'true');
        input.style.border = 'none';
        input.style.background = 'transparent';
      });
      
      // Add tournament title and date to the top
      const titleDiv = document.createElement('div');
      titleDiv.className = 'image-export-title';
      titleDiv.innerHTML = `
        <h2>${tournamentName}</h2>
        <p>${format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
      `;
      clonedElement.insertBefore(titleDiv, clonedElement.firstChild);
      
      // Add player standings to the export
      const standingsDiv = document.createElement('div');
      standingsDiv.className = 'image-export-standings';
      
      // Sort players by profit
      const sortedPlayers = [...players].sort((a, b) => {
        const aChips = a.active ? (finalChips[a.id] !== undefined ? finalChips[a.id] : a.chips) : 0;
        const bChips = b.active ? (finalChips[b.id] !== undefined ? finalChips[b.id] : b.chips) : 0;
        
        const aEntryCost = entryFee * (1 + a.rebuys);
        const bEntryCost = entryFee * (1 + b.rebuys);
        const aCashEquivalent = a.active ? calculateCashEquivalent(aChips, startingChips, entryFee) : 0;
        const bCashEquivalent = b.active ? calculateCashEquivalent(bChips, startingChips, entryFee) : 0;
        const aProfit = a.active ? aCashEquivalent - aEntryCost : -aEntryCost;
        const bProfit = b.active ? bCashEquivalent - bEntryCost : -bEntryCost;
        
        // Sort by profit (descending)
        return bProfit - aProfit;
      });
      
      // Calculate prize distribution
      const prizeDistribution = calculatePrizeDistribution(stats.totalPrizePool, cashoutPlaces || numberOfWinners);
      
      // Create standings HTML
      let standingsHTML = `<h3>${tournamentState.isRunning ? t('statistics.currentStandings') : t('statistics.finalStandings')}</h3><div class="standings-list">`;
      
      sortedPlayers.slice(0, 10).forEach((player, index) => {
        const position = index + 1;
        const prize = position <= (cashoutPlaces || numberOfWinners) ? prizeDistribution[index] : 0;
        const playerChips = finalChips[player.id] !== undefined ? finalChips[player.id] : player.chips;
        const status = player.active 
          ? `${playerChips.toLocaleString()} ${t('player.chips')}` 
          : (player.eliminated ? `${t('player.eliminated')} ${t('player.atLevel')} ${player.eliminatedAt}` : t('player.inactive'));
        
        const prizeText = prize > 0 ? ` - ${formatCurrency(prize)}` : '';
        standingsHTML += `
          <div class="standing-item ${position <= 3 ? 'top-position' : ''}">
            <span class="position">${position}</span>
            <span class="player-name">${player.name}</span>
            <span class="player-status">${status}</span>
            <span class="prize">${prizeText}</span>
          </div>
        `;
      });
      
      standingsHTML += '</div>';
      standingsDiv.innerHTML = standingsHTML;
      clonedElement.appendChild(standingsDiv);
      
      // Style modifications for export
      clonedElement.style.background = 'linear-gradient(180deg, #0a2447, #072c5e)';
      clonedElement.style.padding = '30px';
      clonedElement.style.borderRadius = '10px';
      clonedElement.style.color = '#fff';
      clonedElement.style.width = '800px';
      clonedElement.style.maxWidth = '100%';
      clonedElement.style.border = '1px solid rgba(0, 102, 204, 0.5)';
      clonedElement.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
      
      // Add title style
      const titleElement = clonedElement.querySelector('.image-export-title') as HTMLElement;
      if (titleElement) {
        titleElement.style.background = 'linear-gradient(90deg, #000927, #00215a, #000927)';
        titleElement.style.padding = '15px';
        titleElement.style.marginLeft = '-30px';
        titleElement.style.marginRight = '-30px';
        titleElement.style.marginTop = '-30px';
        titleElement.style.marginBottom = '20px';
        titleElement.style.borderBottom = '2px solid #0066cc';
      }
      
      // Append to body temporarily (invisible)
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      document.body.appendChild(clonedElement);
      
      // Generate the image
      const dataUrl = await toPng(clonedElement, { 
        quality: 0.95,
        backgroundColor: '#061832',
        width: 800,
        height: clonedElement.offsetHeight
      });
      
      // Remove the clone
      document.body.removeChild(clonedElement);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${tournamentName.replace(/\s+/g, '-')}-stats-${format(new Date(), 'yyyyMMdd')}.png`;
      link.href = dataUrl;
      link.click();
      
      // Show success message
      alert(t('statistics.exportImageSuccess'));
    } catch (error) {
      console.error('Error exporting image:', error);
      alert(t('statistics.exportError'));
    }
  };

  const handleUpdateFinalChips = (playerId: string, chips: number) => {
    const updated = { ...finalChips, [playerId]: chips };
    setFinalChips(updated);
    dispatch(updateFinalChips(updated));
  };

  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  return (
    <div className={`statistics-card ${displayMode === 'board' ? 'board-mode' : ''}`} ref={statsCardRef}>
      {displayMode === 'full' && <h3 className="statistics-title">{t('statistics.title')}</h3>}
      
      <div className={`stats-grid ${displayMode === 'board' ? 'stats-grid-board' : ''}`}>
        <div className="stat-box">
          <div className="stat-label">{t('statistics.totalEntries')}</div>
          <div className="stat-value">{stats.totalEntries}</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-label">{t('statistics.activePlayers')}</div>
          <div className="stat-value">
            {stats.activePlayers} <span className="stat-ratio">/ {stats.totalPlayers}</span>
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-label">{t('statistics.totalPrizePool')}</div>
          <div className="stat-value">{formatCurrency(stats.totalPrizePool)}</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-label">{t('statistics.averageChipStack')}</div>
          <div className="stat-value">{stats.averageChipStack.toLocaleString()}</div>
        </div>
      </div>
      
      {displayMode === 'board' && (
        <div className="player-statistics">
          <h4 className="statistics-title">{t('statistics.playersList')}</h4>
          <div className="players-list-board">
            <div className="players-list-header">
              <div className="player-list-name">{t('player.name')}</div>
              <div className="player-list-entries">{t('statistics.entries')}</div>
              <div className="player-list-status">{t('player.status')}</div>
            </div>
            <div className="players-list-content">
              {players
                // Sort by profit (high to low), then by name
                .sort((a, b) => {
                  const aChips = a.active ? (finalChips[a.id] !== undefined ? finalChips[a.id] : a.chips) : 0;
                  const bChips = b.active ? (finalChips[b.id] !== undefined ? finalChips[b.id] : b.chips) : 0;
                  
                  // Calculate profit for both players
                  const aEntryCost = entryFee * (1 + a.rebuys);
                  const bEntryCost = entryFee * (1 + b.rebuys);
                  const aCashEquivalent = a.active ? calculateCashEquivalent(aChips, startingChips, entryFee) : 0;
                  const bCashEquivalent = b.active ? calculateCashEquivalent(bChips, startingChips, entryFee) : 0;
                  const aProfit = a.active ? aCashEquivalent - aEntryCost : -aEntryCost;
                  const bProfit = b.active ? bCashEquivalent - bEntryCost : -bEntryCost;
                  
                  const profitComparison = bProfit - aProfit;
                  // If profits are the same, sort by name
                  return profitComparison === 0 ? a.name.localeCompare(b.name) : profitComparison;
                })
                .map((player: Player) => (
                  <div key={player.id} className={`player-list-item ${player.active ? 'active' : 'eliminated'}`}>
                    <div className="player-list-name">{player.name}</div>
                    <div className="player-list-entries">{player.entries}</div>
                    <div className="player-list-status">
                      {player.active ? 
                        <span className="status-active">{t('player.active')}</span> : 
                        <span className="status-eliminated">{t('player.eliminated')}</span>
                      }
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      
      {displayMode === 'full' && (
        <>
          <hr className="divider" />
          
          <div className="cash-equivalent-section">
            <h4 className="section-title">{t('statistics.cashEquivalent')}</h4>
            
            <div className="cash-calculator">
              <div className="form-group">
                <label htmlFor="chipCount">{t('player.chips')}</label>
                <input
                  id="chipCount"
                  type="number"
                  value={chipCount}
                  onChange={(e) => setChipCount(Number(e.target.value))}
                  min={0}
                  step={100}
                  className="chip-input"
                />
              </div>
              
              <button 
                className="calculate-btn"
                onClick={handleCalculate}
              >
                {t('statistics.calculate')}
              </button>
              
              <div className="cash-result">
                <div className="cash-label">{t('statistics.cashEquivalent')}:</div>
                <div className="cash-value">{formatCurrency(cashEquivalent)}</div>
              </div>
            </div>
          </div>
          
          <hr className="divider" />
          
          <div className="tournament-summary-section">
            <h4 className="section-title">{t('tournament.summary')}</h4>
            
            <button 
              className="summary-toggle-btn"
              onClick={toggleSummary}
            >
              {showSummary ? t('settings.hide') : t('settings.show')} {t('tournament.summary')}
            </button>
            
            {showSummary && (
              <div className="summary-content">
                <p className="summary-instructions">{t('statistics.finalChipsInstructions')}</p>
                
                <div className="final-chips-list">
                  {players
                    .sort((a: Player, b: Player) => {
                      const aChips = finalChips[a.id] !== undefined ? finalChips[a.id] : a.chips;
                      const bChips = finalChips[b.id] !== undefined ? finalChips[b.id] : b.chips;
                      
                      // Calculate profit for both players
                      const aEntryCost = entryFee * (1 + a.rebuys);
                      const bEntryCost = entryFee * (1 + b.rebuys);
                      const aCashEquivalent = calculateCashEquivalent(aChips, startingChips, entryFee);
                      const bCashEquivalent = calculateCashEquivalent(bChips, startingChips, entryFee);
                      const aProfit = aCashEquivalent - aEntryCost;
                      const bProfit = bCashEquivalent - bEntryCost;
                      
                      return bProfit - aProfit;
                    })
                    .map((player: Player) => (
                    <div key={player.id} className="final-chip-item">
                      <span className="player-name">{player.name}</span>
                      <div className="chip-input-container">
                        <input
                          type="number"
                          value={finalChips[player.id] !== undefined ? finalChips[player.id] : player.chips}
                          onChange={(e) => handleUpdateFinalChips(player.id, Number(e.target.value))}
                          min={0}
                          step={100}
                          className="final-chip-input"
                        />
                        <span className="chip-label">{t('player.chips')}</span>
                      </div>
                      <span className="player-status">
                        {player.active ? 
                          <span className="active-tag">{t('player.active')}</span> : 
                          <span className="eliminated-tag">{t('player.eliminated')}</span>
                        }
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="summary-export-buttons">
                  <button 
                    className="summary-export-btn"
                    onClick={() => exportTournamentSummaryAsText(
                      tournamentName,
                      players,
                      entryFee,
                      startingChips,
                      cashoutPlaces || numberOfWinners,
                      undefined,
                      playWithAnte
                    )}
                  >
                    {t('statistics.exportSummaryText')}
                  </button>
                  
                  <button 
                    className="summary-export-image-btn"
                    onClick={() => exportTournamentSummaryAsImage(
                      tournamentName,
                      players,
                      entryFee,
                      startingChips,
                      cashoutPlaces || numberOfWinners,
                      undefined,
                      playWithAnte
                    )}
                  >
                    {t('statistics.exportSummaryImage')}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <hr className="divider" />
          
          <div className="export-section">
            <h4 className="section-title">{t('statistics.export')}</h4>
            
            <div className="export-buttons">
              <button 
                className="export-btn"
                onClick={exportTournamentResults}
              >
                {t('statistics.exportText')}
              </button>
              
              <button 
                className="export-image-btn"
                onClick={exportAsImage}
              >
                {t('statistics.exportAsImage')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TournamentStatistics;

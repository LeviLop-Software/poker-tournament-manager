import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/redux';
import type { RootState } from '../../store';
import type { SavedTournament } from '../../types';
import {
  calculateOverallStats,
  prepareProfitTrendData,
  prepareEntriesTrendData,
  prepareProfitByPlayerData,
  prepareEntriesByPlayerData,
  prepareTournamentsByMonthData,
  calculatePlayerStats,
  formatStats
} from '../../utils/statistics';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const MIN_TOURNAMENTS_FOR_STATS = 2;

const TournamentStatistics: React.FC = () => {
  const { t } = useTranslation();
  const savedTournaments = useAppSelector((state: RootState) => (state as any).history.savedTournaments);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  
  // Memoize statistics to avoid recalculating on each render
  const overallStats = useMemo(() => {
    return calculateOverallStats(savedTournaments);
  }, [savedTournaments]);    // Extract all unique player IDs
  const uniquePlayerIds = useMemo(() => {
    const playerIds = new Set<string>();
    savedTournaments.forEach((tournament: SavedTournament) => {
      tournament.players.forEach((player: any) => {
        playerIds.add(player.id);
      });
    });
    return Array.from(playerIds);
  }, [savedTournaments]);
  
  // Calculate player statistics for all players
  const allPlayerStats = useMemo(() => {
    return uniquePlayerIds
      .map(playerId => calculatePlayerStats(playerId, savedTournaments))
      .filter(stats => stats !== null)
      .sort((a, b) => (b?.totalProfit || 0) - (a?.totalProfit || 0));
  }, [savedTournaments, uniquePlayerIds]);
  
  // Get stats for the selected player
  const selectedPlayerStats = useMemo(() => {
    if (!selectedPlayer) return null;
    return calculatePlayerStats(selectedPlayer, savedTournaments);
  }, [savedTournaments, selectedPlayer]);
  
  // Prepare chart data
  const profitTrendData = useMemo(() => {
    return prepareProfitTrendData(savedTournaments);
  }, [savedTournaments]);
  
  const entriesTrendData = useMemo(() => {
    return prepareEntriesTrendData(savedTournaments);
  }, [savedTournaments]);
  
  const profitByPlayerData = useMemo(() => {
    return prepareProfitByPlayerData(savedTournaments);
  }, [savedTournaments]);
  
  const entriesByPlayerData = useMemo(() => {
    return prepareEntriesByPlayerData(savedTournaments);
  }, [savedTournaments]);
  
  const tournamentsByMonthData = useMemo(() => {
    return prepareTournamentsByMonthData(savedTournaments);
  }, [savedTournaments]);
  
  // If no player is selected, select the most profitable player by default
  useEffect(() => {
    if (allPlayerStats.length > 0 && !selectedPlayer) {
      setSelectedPlayer(allPlayerStats[0]?.id || null);
    }
  }, [allPlayerStats, selectedPlayer]);
  
  if (savedTournaments.length < MIN_TOURNAMENTS_FOR_STATS) {
    return (
      <div className="history-stats-container">
        <div className="history-stats-header">
          <h2 className="history-stats-title">{t('history.statistics')}</h2>
        </div>
        <div className="no-stats-message">
          {t('history.noStatsAvailable')}
        </div>
      </div>
    );
  }
  
  return (
    <div className="history-stats-container">
      <div className="history-stats-header">
        <h2 className="history-stats-title">{t('history.statistics')}</h2>
      </div>
      
      <div className="stats-tabs">
        <button 
          className={`stats-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          {t('history.overallStats')}
        </button>
        <button 
          className={`stats-tab ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          {t('history.playerStats')}
        </button>
      </div>
      
      {activeTab === 'overview' && overallStats && (
        <div className="overview-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-title">{t('history.totalTournaments')}</div>
              <div className="stat-card-value">{overallStats.totalTournaments}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">{t('statistics.totalEntries')}</div>
              <div className="stat-card-value">{overallStats.totalEntries}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">{t('history.uniquePlayers')}</div>
              <div className="stat-card-value">{overallStats.uniquePlayers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">{t('history.averageDuration')}</div>
              <div className="stat-card-value">{formatStats.duration(overallStats.averageDuration)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">{t('history.mostProfitablePlayer')}</div>
              <div className="stat-card-value">{overallStats.mostProfitablePlayer.name}</div>
              <div className="stat-card-subtitle">{formatStats.currency(overallStats.mostProfitablePlayer.profit)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">{t('history.mostFrequentPlayer')}</div>
              <div className="stat-card-value">{overallStats.mostFrequentPlayer.name}</div>
              <div className="stat-card-subtitle">{overallStats.mostFrequentPlayer.count} {t('tournament.setup').toLowerCase()}</div>
            </div>
          </div>
          
          <div className="chart-container">
            <h3 className="chart-title">{t('history.profitTrend')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profitTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatStats.currency(Number(value))} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }}
                  name={t('statistics.profit')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3 className="chart-title">{t('history.entriesTrend')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={entriesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="entries" 
                  stroke="#82ca9d" 
                  activeDot={{ r: 8 }}
                  name={t('statistics.entries')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3 className="chart-title">{t('history.profitByPlayer')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitByPlayerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatStats.currency(Number(value))} />
                <Legend />
                <Bar 
                  dataKey="profit" 
                  fill="#8884d8" 
                  name={t('statistics.profit')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3 className="chart-title">{t('history.entriesByPlayer')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={entriesByPlayerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="entries" 
                  fill="#82ca9d" 
                  name={t('statistics.entries')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3 className="chart-title">{t('history.tournamentsByMonth')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tournamentsByMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="count" 
                  fill="#ffc658" 
                  name={t('tournament.setup')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {activeTab === 'players' && (
        <div className="player-stats">
          <div className="player-selector">
            <label htmlFor="player-select">{t('player.name')}:</label>
            <select 
              id="player-select"
              value={selectedPlayer || ''}
              onChange={(e) => setSelectedPlayer(e.target.value)}
            >
              {allPlayerStats.map(stats => (
                <option key={stats?.id} value={stats?.id}>
                  {stats?.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedPlayerStats && (
            <div className="player-stats-details">
              <h3>{selectedPlayerStats.name}</h3>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-title">{t('history.totalTournaments')}</div>
                  <div className="stat-card-value">{selectedPlayerStats.totalTournaments}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">{t('statistics.totalEntries')}</div>
                  <div className="stat-card-value">{selectedPlayerStats.totalEntries}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">{t('history.totalProfitLoss')}</div>
                  <div className={`stat-card-value ${selectedPlayerStats.totalProfit >= 0 ? 'positive-value' : 'negative-value'}`}>
                    {formatStats.currency(selectedPlayerStats.totalProfit)}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">{t('history.averageProfit')}</div>
                  <div className={`stat-card-value ${selectedPlayerStats.averageProfit >= 0 ? 'positive-value' : 'negative-value'}`}>
                    {formatStats.currency(selectedPlayerStats.averageProfit)}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">{t('history.bestFinish')}</div>
                  <div className="stat-card-value">{formatStats.position(selectedPlayerStats.bestPosition)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">{t('history.winRate')}</div>
                  <div className="stat-card-value">{formatStats.percent(selectedPlayerStats.winRate)}</div>
                </div>
              </div>
              
              {/* Player-specific charts could be added here */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentStatistics;

import type { SavedTournament, PlayerResult } from '../types';
import { formatCurrency } from './tournament';
import { formatDuration } from './history';

/**
 * Interface for player statistics
 */
interface PlayerStats {
  id: string;
  name: string;
  totalTournaments: number;
  totalEntries: number;
  totalProfit: number;
  averageProfit: number;
  bestPosition: number;
  worstPosition: number;
  winCount: number;
  winRate: number;
}

/**
 * Interface for overall tournament statistics
 */
interface OverallStats {
  totalTournaments: number;
  totalEntries: number;
  totalPlayers: number;
  uniquePlayers: number;
  totalDuration: number;
  averageDuration: number;
  averageEntries: number;
  mostProfitablePlayer: {
    name: string;
    profit: number;
  };
  mostFrequentPlayer: {
    name: string;
    count: number;
  };
}

/**
 * Calculate statistics for a specific player across all tournaments
 */
export const calculatePlayerStats = (
  playerId: string,
  tournaments: SavedTournament[]
): PlayerStats | null => {
  // Find tournaments where this player participated
  const playerTournaments = tournaments.filter(tournament => 
    tournament.players.some(player => player.id === playerId)
  );
  
  if (playerTournaments.length === 0) {
    return null;
  }
  
  // Extract all results for this player
  const playerResults = playerTournaments.map(tournament => 
    tournament.players.find(player => player.id === playerId)!
  );
  
  // Get player name from any tournament
  const playerName = playerResults[0].name;
  
  // Calculate total tournaments and entries
  const totalTournaments = playerTournaments.length;
  const totalEntries = playerResults.reduce((acc, result) => acc + result.entries, 0);
  
  // Calculate profit
  const totalProfit = playerResults.reduce((acc, result) => acc + result.profit, 0);
  const averageProfit = totalProfit / totalTournaments;
  
  // Calculate positions
  const positions = playerResults.map(result => result.finalPosition);
  const bestPosition = Math.min(...positions);
  const worstPosition = Math.max(...positions);
  
  // Calculate win count and rate
  const winCount = positions.filter(pos => pos === 1).length;
  const winRate = (winCount / totalTournaments) * 100;
  
  return {
    id: playerId,
    name: playerName,
    totalTournaments,
    totalEntries,
    totalProfit,
    averageProfit,
    bestPosition,
    worstPosition,
    winCount,
    winRate
  };
};

/**
 * Calculate overall statistics for all tournaments
 */
export const calculateOverallStats = (
  tournaments: SavedTournament[]
): OverallStats | null => {
  if (tournaments.length === 0) {
    return null;
  }
  
  // Calculate total tournaments
  const totalTournaments = tournaments.length;
  
  // Calculate total entries across all tournaments
  const totalEntries = tournaments.reduce((acc, tournament) => acc + tournament.totalEntries, 0);
  
  // Calculate total unique players
  const playerIds = new Set<string>();
  tournaments.forEach(tournament => {
    tournament.players.forEach(player => {
      playerIds.add(player.id);
    });
  });
  const uniquePlayers = playerIds.size;
  
  // Calculate total and average players per tournament
  const totalPlayers = tournaments.reduce((acc, tournament) => acc + tournament.totalPlayers, 0);
  
  // Calculate total and average duration
  const totalDuration = tournaments.reduce((acc, tournament) => acc + tournament.duration, 0);
  const averageDuration = totalDuration / totalTournaments;
  
  // Calculate average entries per tournament
  const averageEntries = totalEntries / totalTournaments;
  
  // Find most profitable player
  const playerProfits = new Map<string, { name: string, profit: number }>();
  tournaments.forEach(tournament => {
    tournament.players.forEach(player => {
      const currentProfit = playerProfits.get(player.id)?.profit || 0;
      playerProfits.set(player.id, {
        name: player.name,
        profit: currentProfit + player.profit
      });
    });
  });
  
  const mostProfitablePlayer = Array.from(playerProfits.values())
    .sort((a, b) => b.profit - a.profit)[0];
  
  // Find most frequent player
  const playerFrequency = new Map<string, { name: string, count: number }>();
  tournaments.forEach(tournament => {
    tournament.players.forEach(player => {
      const currentCount = playerFrequency.get(player.id)?.count || 0;
      playerFrequency.set(player.id, {
        name: player.name,
        count: currentCount + 1
      });
    });
  });
  
  const mostFrequentPlayer = Array.from(playerFrequency.values())
    .sort((a, b) => b.count - a.count)[0];
  
  return {
    totalTournaments,
    totalEntries,
    totalPlayers,
    uniquePlayers,
    totalDuration,
    averageDuration,
    averageEntries,
    mostProfitablePlayer,
    mostFrequentPlayer
  };
};

/**
 * Prepare profit trend data for charts
 */
export const prepareProfitTrendData = (
  tournaments: SavedTournament[]
): { name: string; profit: number }[] => {
  return [...tournaments]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(tournament => {
      const totalProfit = tournament.players.reduce((acc, player) => acc + player.profit, 0);
      return {
        name: new Date(tournament.date).toLocaleDateString(),
        profit: totalProfit
      };
    });
};

/**
 * Prepare entries trend data for charts
 */
export const prepareEntriesTrendData = (
  tournaments: SavedTournament[]
): { name: string; entries: number }[] => {
  return [...tournaments]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(tournament => ({
      name: new Date(tournament.date).toLocaleDateString(),
      entries: tournament.totalEntries
    }));
};

/**
 * Prepare profit by player data for charts
 */
export const prepareProfitByPlayerData = (
  tournaments: SavedTournament[]
): { name: string; profit: number }[] => {
  const playerProfits = new Map<string, { name: string, profit: number }>();
  
  tournaments.forEach(tournament => {
    tournament.players.forEach(player => {
      const currentProfit = playerProfits.get(player.id)?.profit || 0;
      playerProfits.set(player.id, {
        name: player.name,
        profit: currentProfit + player.profit
      });
    });
  });
  
  return Array.from(playerProfits.values())
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10); // Top 10 players
};

/**
 * Prepare entries by player data for charts
 */
export const prepareEntriesByPlayerData = (
  tournaments: SavedTournament[]
): { name: string; entries: number }[] => {
  const playerEntries = new Map<string, { name: string, entries: number }>();
  
  tournaments.forEach(tournament => {
    tournament.players.forEach(player => {
      const currentEntries = playerEntries.get(player.id)?.entries || 0;
      playerEntries.set(player.id, {
        name: player.name,
        entries: currentEntries + player.entries
      });
    });
  });
  
  return Array.from(playerEntries.values())
    .sort((a, b) => b.entries - a.entries)
    .slice(0, 10); // Top 10 players
};

/**
 * Prepare tournaments by month data for charts
 */
export const prepareTournamentsByMonthData = (
  tournaments: SavedTournament[]
): { name: string; count: number }[] => {
  const tournamentsByMonth = new Map<string, number>();
  
  tournaments.forEach(tournament => {
    const date = new Date(tournament.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    const currentCount = tournamentsByMonth.get(monthYear) || 0;
    tournamentsByMonth.set(monthYear, currentCount + 1);
  });
  
  return Array.from(tournamentsByMonth.entries())
    .map(([monthYear, count]) => ({
      name: monthYear,
      count
    }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.name.split('/').map(Number);
      const [bMonth, bYear] = b.name.split('/').map(Number);
      
      if (aYear !== bYear) {
        return aYear - bYear;
      }
      return aMonth - bMonth;
    });
};

/**
 * Format statistics for display
 */
export const formatStats = {
  currency: (value: number): string => formatCurrency(value),
  percent: (value: number): string => `${value.toFixed(1)}%`,
  duration: (seconds: number): string => formatDuration(seconds),
  position: (value: number): string => {
    if (value === 1) return '1st';
    if (value === 2) return '2nd';
    if (value === 3) return '3rd';
    return `${value}th`;
  }
};

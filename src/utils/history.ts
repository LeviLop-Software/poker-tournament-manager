import type { Player, SavedTournament, PlayerResult } from '../types';
import { calculateCashEquivalent, calculateProfit } from './tournament';

/**
 * Creates a SavedTournament object from the current tournament state
 */
export const createTournamentRecord = (
  tournamentName: string,
  players: Player[],
  entryFee: number,
  startingChips: number,
  elapsedTime: number,
  finalChips: Record<string, number>,
  playWithAnte: boolean
): SavedTournament => {
  const totalEntries = players.reduce((acc, player) => acc + 1 + player.rebuys, 0);
  const totalPlayers = players.length;
  const totalPrizePool = totalEntries * entryFee;
  
  // Sort players by chip count (for active players) and elimination order (for eliminated)
  const sortedPlayers = [...players].sort((a, b) => {
    // First sort by active status
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    
    // For active players, sort by chips
    if (a.active && b.active) {
      const aChips = finalChips[a.id] !== undefined ? finalChips[a.id] : a.chips;
      const bChips = finalChips[b.id] !== undefined ? finalChips[b.id] : b.chips;
      return bChips - aChips;
    }
    
    // For eliminated players, sort by elimination level (if available)
    if (a.eliminatedAt && b.eliminatedAt) {
      return b.eliminatedAt - a.eliminatedAt;
    }
    
    return 0;
  });
  
  // Create player results
  const playerResults: PlayerResult[] = sortedPlayers.map((player, index) => {
    const playerChips = player.active 
      ? (finalChips[player.id] !== undefined ? finalChips[player.id] : player.chips)
      : 0;
    const entries = 1 + player.rebuys;
    const cashEquivalent = player.active 
      ? calculateCashEquivalent(playerChips, startingChips, entryFee)
      : 0;
    const profit = player.active
      ? calculateProfit(playerChips, startingChips, entryFee, entries)
      : -entryFee * entries;
    
    return {
      id: player.id,
      name: player.name,
      finalPosition: index + 1,
      entries,
      finalChips: playerChips,
      cashEquivalent,
      profit,
    };
  });
  
  return {
    id: `tournament_${Date.now()}`,
    date: new Date().toISOString(),
    name: tournamentName,
    entryFee,
    startingChips,
    totalEntries,
    totalPlayers,
    totalPrizePool,
    playWithAnte,
    duration: elapsedTime,
    players: playerResults,
  };
};

/**
 * Format duration in hours, minutes and seconds
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

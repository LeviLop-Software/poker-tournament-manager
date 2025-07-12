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
  
  // Sort players by profit (for both active and eliminated players)
  const sortedPlayers = [...players].sort((a, b) => {
    // Calculate profit for both players, regardless of active status
    const aChips = a.active ? (finalChips[a.id] !== undefined ? finalChips[a.id] : a.chips) : 0;
    const bChips = b.active ? (finalChips[b.id] !== undefined ? finalChips[b.id] : b.chips) : 0;
    
    const aEntryCost = entryFee * (1 + a.rebuys);
    const bEntryCost = entryFee * (1 + b.rebuys);
    const aCashEquivalent = a.active ? calculateCashEquivalent(aChips, startingChips, entryFee) : 0;
    const bCashEquivalent = b.active ? calculateCashEquivalent(bChips, startingChips, entryFee) : 0;
    const aProfit = a.active ? aCashEquivalent - aEntryCost : -aEntryCost;
    const bProfit = b.active ? bCashEquivalent - bEntryCost : -bEntryCost;
    
    // Sort by profit, highest first
    return bProfit - aProfit;
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

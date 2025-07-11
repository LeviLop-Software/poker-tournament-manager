import type { SavedTournament, PlayerResult } from '../types';

/**
 * Converts tournament history data to CSV format
 * @param tournaments Array of saved tournaments
 * @returns CSV string
 */
export const exportHistoryToCSV = (tournaments: SavedTournament[]): string => {
  if (!tournaments || tournaments.length === 0) {
    return '';
  }

  // Create the main tournaments CSV
  const tournamentRows = tournaments.map(tournament => {
    return [
      tournament.id,
      tournament.date,
      tournament.name,
      tournament.entryFee,
      tournament.startingChips,
      tournament.totalEntries,
      tournament.totalPlayers,
      tournament.totalPrizePool,
      tournament.playWithAnte ? 'true' : 'false',
      tournament.duration
    ].join(',');
  });

  const tournamentHeader = 'id,date,name,entryFee,startingChips,totalEntries,totalPlayers,totalPrizePool,playWithAnte,duration';
  const tournamentCsv = [tournamentHeader, ...tournamentRows].join('\n');

  // Create the players CSV
  const playerRows: string[] = [];
  tournaments.forEach(tournament => {
    tournament.players.forEach(player => {
      playerRows.push([
        tournament.id,
        player.id,
        player.name,
        player.finalPosition,
        player.entries,
        player.finalChips,
        player.cashEquivalent,
        player.profit
      ].join(','));
    });
  });

  const playerHeader = 'tournamentId,playerId,name,finalPosition,entries,finalChips,cashEquivalent,profit';
  const playerCsv = [playerHeader, ...playerRows].join('\n');

  // Combine with a special marker to separate the two sections
  return `--- TOURNAMENTS ---\n${tournamentCsv}\n--- PLAYERS ---\n${playerCsv}`;
};

/**
 * Imports tournament history from CSV data
 * @param csvData CSV string
 * @returns Array of SavedTournament objects or null if format is invalid
 */
export const importHistoryFromCSV = (csvData: string): SavedTournament[] | null => {
  try {
    const sections = csvData.split('--- PLAYERS ---');
    if (sections.length !== 2) {
      return null;
    }

    const tournamentSection = sections[0].replace('--- TOURNAMENTS ---\n', '');
    const playerSection = sections[1];

    // Parse tournaments
    const tournamentLines = tournamentSection.trim().split('\n');
    // Skip header row (index 0)
    const tournamentRows = tournamentLines.slice(1);

    const tournaments: { [id: string]: SavedTournament } = {};

    tournamentRows.forEach(row => {
      const [
        id, 
        date, 
        name, 
        entryFeeStr, 
        startingChipsStr, 
        totalEntriesStr, 
        totalPlayersStr, 
        totalPrizePoolStr, 
        playWithAnteStr,
        durationStr
      ] = row.split(',');

      tournaments[id] = {
        id,
        date,
        name,
        entryFee: Number(entryFeeStr),
        startingChips: Number(startingChipsStr),
        totalEntries: Number(totalEntriesStr),
        totalPlayers: Number(totalPlayersStr),
        totalPrizePool: Number(totalPrizePoolStr),
        playWithAnte: playWithAnteStr === 'true',
        duration: Number(durationStr),
        players: []
      };
    });

    // Parse players
    const playerLines = playerSection.trim().split('\n');
    // Skip header row (index 0)
    const playerRows = playerLines.slice(1);

    playerRows.forEach(row => {
      const [
        tournamentId,
        playerId,
        name,
        finalPositionStr,
        entriesStr,
        finalChipsStr,
        cashEquivalentStr,
        profitStr
      ] = row.split(',');

      if (tournaments[tournamentId]) {
        const player: PlayerResult = {
          id: playerId,
          name,
          finalPosition: Number(finalPositionStr),
          entries: Number(entriesStr),
          finalChips: Number(finalChipsStr),
          cashEquivalent: Number(cashEquivalentStr),
          profit: Number(profitStr)
        };

        tournaments[tournamentId].players.push(player);
      }
    });

    // Convert to array
    return Object.values(tournaments);
  } catch (error) {
    console.error('Error importing history from CSV:', error);
    return null;
  }
};

/**
 * Creates a downloadable CSV file from tournament history
 * @param tournaments Array of saved tournaments
 * @param filename Name for the download file
 */
export const downloadHistoryCSV = (tournaments: SavedTournament[], filename = 'tournament-history.csv'): void => {
  const csvContent = exportHistoryToCSV(tournaments);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

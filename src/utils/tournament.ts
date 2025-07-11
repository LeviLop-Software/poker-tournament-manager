import type { Player, Statistics } from '../types';
import html2canvas from 'html2canvas';
import i18next from 'i18next';

/**
 * Calculates tournament statistics based on players and entry fee
 */
export const calculateStatistics = (
  players: Player[],
  entryFee: number,
  startingChips: number
): Statistics => {
  const totalEntries = players.reduce((acc, player) => acc + 1 + player.rebuys, 0);
  const activePlayers = players.filter((player) => player.active).length;
  const totalPlayers = players.length;
  const totalPrizePool = totalEntries * entryFee;
  
  const totalChips = players.reduce((acc, player) => acc + player.chips, 0);
  const averageChipStack = activePlayers > 0 ? Math.round(totalChips / activePlayers) : 0;
  
  return {
    totalEntries,
    activePlayers,
    totalPlayers,
    totalPrizePool,
    averageChipStack,
  };
};

/**
 * Calculates cash equivalent of chips
 */
export const calculateCashEquivalent = (
  chips: number,
  startingChips: number,
  entryFee: number
): number => {
  return (chips / startingChips) * entryFee;
};

/**
 * Calculates prize distribution based on the total prize pool and number of winners
 */
export const calculatePrizeDistribution = (
  totalPrizePool: number,
  numberOfWinners: number
): number[] => {
  // Ensure numberOfWinners is at least 1
  const places = numberOfWinners <= 0 ? 1 : numberOfWinners;
  
  const percentages: Record<number, number[]> = {
    1: [100],
    2: [65, 35],
    3: [50, 30, 20],
    4: [45, 25, 18, 12],
    5: [40, 25, 15, 12, 8],
    6: [35, 22, 15, 12, 10, 6],
  };
  
  // Default to 3 winners if the number is not in the predefined percentages
  const distribution = percentages[places] || percentages[3];
  
  return distribution.map((percentage) => (totalPrizePool * percentage) / 100);
};

/**
 * Format currency in Israeli Shekels (ILS)
 */
export const formatCurrency = (amount: number): string => {
  return `₪${amount.toLocaleString()}`;
};

/**
 * Generates a tournament summary text
 */
export const generateTournamentSummary = (
  tournamentName: string,
  players: Player[],
  entryFee: number,
  startingChips: number,
  cashoutPlaces: number,
  finalChips?: Record<string, number>,
  playWithAnte?: boolean
): string => {
  const stats = calculateStatistics(players, entryFee, startingChips);
  const prizeDistribution = calculatePrizeDistribution(stats.totalPrizePool, cashoutPlaces);
  const timestamp = new Date().toLocaleString();
  const t = i18next.t;
  
  // Sort players: active first (by chips descending), then eliminated
  const sortedPlayers = [...players].sort((a, b) => {
    // First sort by active status
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    
    // For active players, sort by chips
    if (a.active && b.active) {
      const aChips = finalChips?.[a.id] !== undefined ? finalChips[a.id] : a.chips;
      const bChips = finalChips?.[b.id] !== undefined ? finalChips[b.id] : b.chips;
      return bChips - aChips;
    }
    
    // For eliminated players, sort by elimination level (if available)
    if (a.eliminatedAt && b.eliminatedAt) {
      return b.eliminatedAt - a.eliminatedAt;
    }
    
    return 0;
  });
  
  let summary = `${t('tournament.summary')}: ${tournamentName}\n`;
  summary += `${t('export.generated')}: ${timestamp}\n\n`;
  summary += `${t('tournament.details')}:\n`;
  summary += `----------------\n`;
  summary += `${t('tournament.entryFee')}: ${formatCurrency(entryFee)}\n`;
  summary += `${t('tournament.startingChips')}: ${startingChips.toLocaleString()}\n`;
  summary += `${t('statistics.totalEntries')}: ${stats.totalEntries}\n`;
  summary += `${t('statistics.totalPlayers')}: ${stats.totalPlayers}\n`;
  summary += `${t('statistics.activePlayers')}: ${stats.activePlayers}\n`;
  summary += `${t('tournament.playWithAnte')}: ${playWithAnte ? t('settings.on') : t('settings.off')}\n`;
  summary += `${t('statistics.prizePool')}: ${formatCurrency(stats.totalPrizePool)}\n\n`;
  
  summary += `${t('statistics.prizeDistribution')}:\n`;
  summary += `----------------\n`;
  prizeDistribution.forEach((prize, index) => {
    const position = index + 1;
    const positionText = position === 1 ? t('board.firstPlace') : 
                        position === 2 ? t('board.secondPlace') : 
                        position === 3 ? t('board.thirdPlace') : 
                        `${position}${t('board.place')}`;
    summary += `${positionText}: ${formatCurrency(prize)}\n`;
  });
  
  summary += `\n${t('statistics.playersList')}:\n`;
  summary += `----------------\n`;
  
  sortedPlayers.forEach((player, index) => {
    const statusText = player.active ? t('player.active') : t('player.eliminated');
    const rankText = player.active ? `${t('statistics.rank')} ${index + 1}` : '';
    const playerChips = finalChips?.[player.id] !== undefined ? finalChips[player.id] : player.chips;
    const chipsText = player.active ? `${playerChips.toLocaleString()} ${t('player.chips')}` : '';
    const entriesText = `${1 + player.rebuys} ${t('statistics.entries')}`;
    
    // Calculate profit
    const entryCost = entryFee * (1 + player.rebuys);
    const cashEquivalent = player.active ? calculateCashEquivalent(playerChips, startingChips, entryFee) : 0;
    const profit = player.active ? cashEquivalent - entryCost : -entryCost;
    const profitText = `${t('statistics.profit')}: ${formatCurrency(profit)}`;
    
    summary += `${player.name} - ${statusText} - ${entriesText}${chipsText ? ` - ${chipsText}` : ''}${rankText ? ` - ${rankText}` : ''} - ${profitText}\n`;
  });
  
  return summary;
};

/**
 * Exports tournament summary as a text file
 */
export const exportTournamentSummaryAsText = (
  tournamentName: string,
  players: Player[],
  entryFee: number,
  startingChips: number,
  cashoutPlaces: number,
  finalChips?: Record<string, number>,
  playWithAnte?: boolean
): void => {
  const summary = generateTournamentSummary(tournamentName, players, entryFee, startingChips, cashoutPlaces, finalChips, playWithAnte);
  const blob = new Blob([summary], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${tournamentName.replace(/\s+/g, '_')}_summary_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates tournament summary as an image and downloads it
 */
export const exportTournamentSummaryAsImage = (
  tournamentName: string,
  players: Player[],
  entryFee: number,
  startingChips: number,
  cashoutPlaces: number,
  finalChips?: Record<string, number>,
  playWithAnte?: boolean
): Promise<void> => {
  return new Promise((resolve) => {
    const t = i18next.t;
    
    // Create a temporary div to render the content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.background = '#f5f5f5';
    tempDiv.style.padding = '30px';
    tempDiv.style.borderRadius = '10px';
    tempDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    tempDiv.style.width = '800px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    
    // Format the content with HTML for better styling
    tempDiv.innerHTML = `
      <div style="color: #000; text-align: left;">
        <h1 style="color: #0066cc; text-align: center; margin-bottom: 20px;">${tournamentName} - ${t('tournament.summary')}</h1>
        <p style="text-align: right; color: #666; font-size: 14px;">${t('export.generated')}: ${new Date().toLocaleString()}</p>
        
        <div style="margin-top: 20px; background: #fff; padding: 15px; border-radius: 8px; border-left: 5px solid #0066cc;">
          <h2 style="color: #0066cc; margin-bottom: 10px;">${t('tournament.details')}</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <p><strong>${t('tournament.entryFee')}:</strong> ${formatCurrency(entryFee)}</p>
            <p><strong>${t('tournament.startingChips')}:</strong> ${startingChips.toLocaleString()}</p>
            <p><strong>${t('statistics.totalEntries')}:</strong> ${players.reduce((acc, player) => acc + 1 + player.rebuys, 0)}</p>
            <p><strong>${t('statistics.totalPlayers')}:</strong> ${players.length}</p>
            <p><strong>${t('tournament.playWithAnte')}:</strong> ${playWithAnte ? t('settings.on') : t('settings.off')}</p>
            <p><strong>${t('statistics.prizePool')}:</strong> ${formatCurrency(entryFee * players.reduce((acc, player) => acc + 1 + player.rebuys, 0))}</p>
          </div>
        </div>
        
        <div style="margin-top: 20px; background: #fff; padding: 15px; border-radius: 8px; border-left: 5px solid #0066cc;">
          <h2 style="color: #0066cc; margin-bottom: 10px;">${t('statistics.playersList')}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f0f7ff;">
                <th style="padding: 10px; text-align: ${i18next.language === 'he' ? 'right' : 'left'}; border-bottom: 1px solid #ddd;">${t('player.name')}</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${t('player.status')}</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${t('statistics.entries')}</th>
                <th style="padding: 10px; text-align: ${i18next.language === 'he' ? 'left' : 'right'}; border-bottom: 1px solid #ddd;">${t('player.chips')}</th>
                <th style="padding: 10px; text-align: ${i18next.language === 'he' ? 'left' : 'right'}; border-bottom: 1px solid #ddd;">${t('statistics.cashEquivalent')}</th>
                <th style="padding: 10px; text-align: ${i18next.language === 'he' ? 'left' : 'right'}; border-bottom: 1px solid #ddd;">${t('statistics.profit')}</th>
              </tr>
            </thead>
            <tbody>
              ${[...players]
                .sort((a, b) => {
                  if (a.active && !b.active) return -1;
                  if (!a.active && b.active) return 1;
                  if (a.active && b.active) {
                    const aChips = finalChips?.[a.id] !== undefined ? finalChips[a.id] : a.chips;
                    const bChips = finalChips?.[b.id] !== undefined ? finalChips[b.id] : b.chips;
                    return bChips - aChips;
                  }
                  return 0;
                })
                .map((player, index) => {
                  const playerChips = finalChips?.[player.id] !== undefined ? finalChips[player.id] : player.chips;
                  const cashEquivalent = player.active ? calculateCashEquivalent(playerChips, startingChips, entryFee) : 0;
                  const entryCost = entryFee * (1 + player.rebuys);
                  const profit = player.active ? cashEquivalent - entryCost : -entryCost;
                  const formattedCashEquivalent = player.active ? formatCurrency(cashEquivalent) : '-';
                  const formattedProfit = formatCurrency(profit);
                  const profitColor = profit >= 0 ? '#52c41a' : '#f5222d';
                  
                  return `
                  <tr style="background: ${index % 2 === 0 ? '#fff' : '#f9fafb'};">
                    <td style="padding: 10px; text-align: ${i18next.language === 'he' ? 'right' : 'left'}; border-bottom: 1px solid #ddd;">${player.name}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">
                      <span style="padding: 5px 10px; border-radius: 20px; font-size: 14px; background: ${player.active ? '#E6F7FF' : '#FFF1F0'}; color: ${player.active ? '#0066cc' : '#cf1322'};">
                        ${player.active ? t('player.active') : t('player.eliminated')}
                      </span>
                    </td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${1 + player.rebuys}</td>
                    <td style="padding: 10px; text-align: ${i18next.language === 'he' ? 'left' : 'right'}; border-bottom: 1px solid #ddd;">${player.active ? playerChips.toLocaleString() : '-'}</td>
                    <td style="padding: 10px; text-align: ${i18next.language === 'he' ? 'left' : 'right'}; border-bottom: 1px solid #ddd;">${formattedCashEquivalent}</td>
                    <td style="padding: 10px; text-align: ${i18next.language === 'he' ? 'left' : 'right'}; border-bottom: 1px solid #ddd; color: ${profitColor};">${formattedProfit}</td>
                  </tr>
                `}).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    // Use html2canvas to convert the div to an image
    html2canvas(tempDiv, { scale: 2, backgroundColor: '#f5f5f5' }).then(canvas => {
      // Convert canvas to a data URL and trigger download
      const imageUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${tournamentName.replace(/\s+/g, '_')}_summary_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      document.body.removeChild(tempDiv);
      resolve();
    });
  });
};

/**
 * Calculates player's profit (cash equivalent minus entry costs)
 */
export const calculateProfit = (
  chips: number,
  startingChips: number,
  entryFee: number,
  entries: number
): number => {
  const cashEquivalent = calculateCashEquivalent(chips, startingChips, entryFee);
  const entryCost = entryFee * entries;
  return cashEquivalent - entryCost;
};

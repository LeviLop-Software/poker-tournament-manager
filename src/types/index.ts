export interface Blind {
  smallBlind: number;
  bigBlind: number;
  ante?: number;
}

export interface Level {
  id: number;
  blinds: Blind;
}

export interface Player {
  id: string;
  name: string;
  active: boolean;
  chips: number;
  rebuys: number;
  eliminated: boolean;
  eliminatedAt?: number; // Level number when eliminated
  eliminationLevel?: number; // Level number when eliminated (alternative name)
  entries?: number; // Total entries (initial entry + rebuys)
}

export interface TournamentSettings {
  name: string;
  entryFee: number;
  startingChips: number;
  levelDuration: number; // in minutes
  numberOfWinners?: number; // Optional, might be used in older tournaments
  cashoutPlaces: number; // number of places that cash out (default 1)
  blindsStructure: Level[];
  finalChips?: Record<string, number>; // Record of player IDs to their final chip counts
  playWithAnte: boolean; // Whether to play with ante (default true)
}

export interface TournamentState {
  isRunning: boolean;
  isPaused: boolean;
  currentLevel: number;
  timeRemaining: number; // in seconds
  startTime?: number; // timestamp
  elapsedTime: number; // in seconds
}

export interface Statistics {
  totalEntries: number;
  activePlayers: number;
  totalPlayers: number;
  totalPrizePool: number;
  averageChipStack: number;
}

// New interfaces for tournament history
export interface PlayerResult {
  id: string;
  name: string;
  finalPosition: number;
  entries: number; // initial entry + rebuys
  finalChips: number;
  cashEquivalent: number;
  profit: number; // Cash equivalent minus entry costs
}

export interface SavedTournament {
  id: string;
  date: string; // ISO date string
  name: string;
  entryFee: number;
  startingChips: number;
  totalEntries: number;
  totalPlayers: number;
  totalPrizePool: number;
  playWithAnte: boolean;
  duration: number; // in seconds
  players: PlayerResult[];
}

export interface AppTheme {
  name: string;
  colorMode: 'light' | 'dark';
}

export interface Language {
  code: string;
  name: string;
}

export interface AppSettings {
  theme: AppTheme;
  language: Language;
  soundEnabled: boolean;
}

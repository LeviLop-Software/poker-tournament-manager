import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TournamentSettings, TournamentState, Level } from '../../types';

// Default blinds structure based on the requirements
const defaultBlindsStructure: Level[] = [
  { id: 1, blinds: { smallBlind: 1, bigBlind: 3, ante: 3 } },
  { id: 2, blinds: { smallBlind: 2, bigBlind: 5, ante: 5 } },
  { id: 3, blinds: { smallBlind: 3, bigBlind: 6, ante: 6 } },
  { id: 4, blinds: { smallBlind: 5, bigBlind: 10, ante: 10 } },
  { id: 5, blinds: { smallBlind: 5, bigBlind: 15, ante: 15 } },
  { id: 6, blinds: { smallBlind: 10, bigBlind: 20, ante: 20 } },
  { id: 7, blinds: { smallBlind: 15, bigBlind: 30, ante: 30 } },
  { id: 8, blinds: { smallBlind: 20, bigBlind: 40, ante: 40 } },
  { id: 9, blinds: { smallBlind: 25, bigBlind: 50, ante: 50 } },
  { id: 10, blinds: { smallBlind: 30, bigBlind: 60, ante: 60 } },
  { id: 11, blinds: { smallBlind: 35, bigBlind: 70, ante: 70 } },
  { id: 12, blinds: { smallBlind: 40, bigBlind: 80, ante: 80 } },
  { id: 13, blinds: { smallBlind: 50, bigBlind: 100, ante: 100 } },
];

interface TournamentSliceState {
  settings: TournamentSettings;
  state: TournamentState;
}

const initialState: TournamentSliceState = {
  settings: {
    name: 'Poker Tournament',
    entryFee: 50, // NIS
    startingChips: 500,
    levelDuration: 20, // minutes
    cashoutPlaces: 1,
    blindsStructure: defaultBlindsStructure,
    finalChips: {},
    playWithAnte: true,
  },
  state: {
    isRunning: false,
    isPaused: false,
    currentLevel: 1,
    timeRemaining: 20 * 60, // 20 minutes in seconds
    elapsedTime: 0,
  },
};

export const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<TournamentSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
      
      // Reset time remaining when level duration is changed
      if (action.payload.levelDuration !== undefined) {
        state.state.timeRemaining = action.payload.levelDuration * 60;
      }
    },
    updateBlindsStructure: (state, action: PayloadAction<Level[]>) => {
      state.settings.blindsStructure = action.payload;
    },
    startTournament: (state) => {
      state.state.isRunning = true;
      state.state.isPaused = false;
      state.state.startTime = Date.now();
    },
    pauseTournament: (state) => {
      state.state.isPaused = true;
    },
    resumeTournament: (state) => {
      state.state.isPaused = false;
    },
    resetTournament: (state) => {
      // Reset tournament state completely
      state.state = {
        ...initialState.state,
        timeRemaining: initialState.settings.levelDuration * 60,
      };
      
      // Reset all tournament settings to default values
      state.settings = {
        ...initialState.settings
      };
    },
    nextLevel: (state) => {
      if (state.state.currentLevel < state.settings.blindsStructure.length) {
        state.state.currentLevel += 1;
        state.state.timeRemaining = state.settings.levelDuration * 60;
      }
    },
    previousLevel: (state) => {
      if (state.state.currentLevel > 1) {
        state.state.currentLevel -= 1;
        state.state.timeRemaining = state.settings.levelDuration * 60;
      }
    },
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.state.timeRemaining = action.payload;
    },
    updateElapsedTime: (state, action: PayloadAction<number>) => {
      state.state.elapsedTime = action.payload;
    },
    updateFinalChips: (state, action: PayloadAction<Record<string, number>>) => {
      state.settings.finalChips = action.payload;
    },
    setState: (_state, action) => {
      return action.payload;
    },
  },
});

export const {
  updateSettings,
  updateBlindsStructure,
  startTournament,
  pauseTournament,
  resumeTournament,
  resetTournament,
  nextLevel,
  previousLevel,
  updateTimeRemaining,
  updateElapsedTime,
  updateFinalChips,
  setState,
} = tournamentSlice.actions;

export default tournamentSlice.reducer;

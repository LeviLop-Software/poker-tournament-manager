import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SavedTournament } from '../../types';

interface HistoryState {
  savedTournaments: SavedTournament[];
}

const initialState: HistoryState = {
  savedTournaments: [],
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    saveTournament: (state, action: PayloadAction<SavedTournament>) => {
      // Check if a tournament with the same ID already exists
      const existingIndex = state.savedTournaments.findIndex(
        tournament => tournament.id === action.payload.id
      );
      
      if (existingIndex >= 0) {
        // Update the existing tournament
        state.savedTournaments[existingIndex] = action.payload;
      } else {
        // Add the new tournament to the start of the array (most recent first)
        state.savedTournaments.unshift(action.payload);
      }
    },
    deleteTournament: (state, action: PayloadAction<string>) => {
      state.savedTournaments = state.savedTournaments.filter(
        tournament => tournament.id !== action.payload
      );
    },
    setState: (_state, action: PayloadAction<HistoryState>) => {
      return action.payload;
    },
    importHistory: (state, action: PayloadAction<SavedTournament[]>) => {
      // Add imported tournaments to the existing ones
      // Use a Set to deduplicate by ID
      const existingIds = new Set(state.savedTournaments.map(t => t.id));
      const newTournaments = action.payload.filter(t => !existingIds.has(t.id));
      
      // Sort all tournaments by date (newest first)
      state.savedTournaments = [...state.savedTournaments, ...newTournaments]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    replaceHistory: (_state, action: PayloadAction<SavedTournament[]>) => {
      // Replace all tournaments with the imported ones
      return {
        savedTournaments: action.payload.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      };
    },
  },
});

export const { 
  saveTournament, 
  deleteTournament,
  setState,
  importHistory,
  replaceHistory 
} = historySlice.actions;

export default historySlice.reducer;

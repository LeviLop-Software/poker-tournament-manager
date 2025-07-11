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
  },
});

export const { 
  saveTournament, 
  deleteTournament,
  setState 
} = historySlice.actions;

export default historySlice.reducer;

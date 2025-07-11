import { configureStore } from '@reduxjs/toolkit';
import tournamentReducer from '../features/tournament/tournamentSlice';
import playersReducer from '../features/players/playersSlice';
import settingsReducer from '../features/settings/settingsSlice';
import historyReducer from '../features/history/historySlice';

export const store = configureStore({
  reducer: {
    tournament: tournamentReducer,
    players: playersReducer,
    settings: settingsReducer,
    history: historyReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Add persistence
let timeoutId: number | null = null;

// Save state with throttling (only save every 1 second at most)
const saveState = () => {
  const state = store.getState();
  localStorage.setItem('tournamentState', JSON.stringify(state));
};

// Throttled save
const throttledSave = () => {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }
  timeoutId = window.setTimeout(saveState, 1000);
};

// Try to load saved state on app init
try {
  const savedState = localStorage.getItem('tournamentState');
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    // Manually dispatch actions to update the store with saved state
    if (parsedState.tournament) {
      store.dispatch({ 
        type: 'tournament/setState', 
        payload: parsedState.tournament 
      });
    }
    if (parsedState.players) {
      store.dispatch({ 
        type: 'players/setState', 
        payload: parsedState.players 
      });
    }
    if (parsedState.settings) {
      store.dispatch({ 
        type: 'settings/setState', 
        payload: parsedState.settings 
      });
    }
    if (parsedState.history) {
      store.dispatch({ 
        type: 'history/setState', 
        payload: parsedState.history 
      });
    }
  }
} catch (error) {
  console.error('Error loading saved state:', error);
}

// Subscribe to store changes to save state
store.subscribe(throttledSave);

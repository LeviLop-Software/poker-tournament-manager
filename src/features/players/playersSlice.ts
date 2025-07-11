import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Player } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface PlayersState {
  list: Player[];
}

const initialState: PlayersState = {
  list: [],
};

export const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    addPlayer: (state, action: PayloadAction<{ 
      name: string, 
      chips: number, 
      id?: string,
      rebuys?: number 
    }>) => {
      const newPlayer: Player = {
        id: action.payload.id || uuidv4(),
        name: action.payload.name,
        active: true,
        chips: action.payload.chips,
        rebuys: action.payload.rebuys || 0,
        eliminated: false,
        entries: (action.payload.rebuys || 0) + 1
      };
      state.list.push(newPlayer);
    },
    removePlayer: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(player => player.id !== action.payload);
    },
    addRebuys: (state, action: PayloadAction<{ playerId: string, chips: number }>) => {
      const player = state.list.find(p => p.id === action.payload.playerId);
      if (player) {
        player.rebuys += 1;
        player.chips += action.payload.chips;
        player.active = true;
        player.eliminated = false;
        player.entries = (player.entries || 0) + 1;
      }
    },
    eliminatePlayer: (state, action: PayloadAction<{ playerId: string, level: number }>) => {
      const player = state.list.find(p => p.id === action.payload.playerId);
      if (player) {
        player.active = false;
        player.eliminated = true;
        player.eliminatedAt = action.payload.level;
      }
    },
    updatePlayerChips: (state, action: PayloadAction<{ playerId: string, chips: number }>) => {
      const player = state.list.find(p => p.id === action.payload.playerId);
      if (player) {
        player.chips = action.payload.chips;
      }
    },
    resetPlayers: (state) => {
      state.list = [];
    },
    setState: (state, action) => {
      return action.payload;
    },
  },
});

export const {
  addPlayer,
  removePlayer,
  addRebuys,
  eliminatePlayer,
  updatePlayerChips,
  resetPlayers,
  setState,
} = playersSlice.actions;

export default playersSlice.reducer;

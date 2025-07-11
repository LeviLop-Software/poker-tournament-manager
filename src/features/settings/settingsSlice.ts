import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppSettings, AppTheme, Language } from '../../types';

const initialState: AppSettings = {
  theme: {
    name: 'Default',
    colorMode: 'light',
  },
  language: {
    code: 'en',
    name: 'English',
  },
  soundEnabled: true,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<AppTheme>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    setSound: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
    },
    setState: (state, action) => {
      return action.payload;
    },
  },
});

export const { setTheme, setLanguage, toggleSound, setSound, setState } = settingsSlice.actions;

export default settingsSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    darkMode: JSON.parse(localStorage.getItem('friendbook_darkMode') || 'false'),
    sidebarCollapsed: false,
    language: 'es',
    notifications: [],
    messages: []
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('friendbook_darkMode', JSON.stringify(state.darkMode));
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    }
  }
});

export const { toggleDarkMode, toggleSidebar, setLanguage } = appSlice.actions;
export default appSlice.reducer;

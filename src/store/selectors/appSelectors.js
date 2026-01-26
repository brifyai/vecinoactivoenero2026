import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectAppState = (state) => state.app;

// Basic selectors
export const selectAppLoading = createSelector(
  [selectAppState],
  (app) => app.loading
);

export const selectAppError = createSelector(
  [selectAppState],
  (app) => app.error
);

export const selectAppInitialized = createSelector(
  [selectAppState],
  (app) => app.initialized
);

export const selectAppTheme = createSelector(
  [selectAppState],
  (app) => app.theme
);

export const selectAppLanguage = createSelector(
  [selectAppState],
  (app) => app.language
);

export const selectAppSettings = createSelector(
  [selectAppState],
  (app) => app.settings
);

export const selectAppNotifications = createSelector(
  [selectAppState],
  (app) => app.notifications
);

export const selectAppConnectivity = createSelector(
  [selectAppState],
  (app) => app.connectivity
);

// Computed selectors
export const selectIsOnline = createSelector(
  [selectAppConnectivity],
  (connectivity) => connectivity.online
);

export const selectAppVersion = createSelector(
  [selectAppSettings],
  (settings) => settings.version || '1.0.0'
);

export const selectNotificationsEnabled = createSelector(
  [selectAppSettings],
  (settings) => settings.notifications !== false
);

export const selectDarkModeEnabled = createSelector(
  [selectAppTheme],
  (theme) => theme === 'dark'
);

export const selectAppStatus = createSelector(
  [selectAppInitialized, selectAppLoading, selectAppError],
  (initialized, loading, error) => {
    if (error) return 'error';
    if (loading) return 'loading';
    if (initialized) return 'ready';
    return 'initializing';
  }
);

export const selectAppConfiguration = createSelector(
  [selectAppSettings, selectAppTheme, selectAppLanguage],
  (settings, theme, language) => ({
    ...settings,
    theme,
    language
  })
);
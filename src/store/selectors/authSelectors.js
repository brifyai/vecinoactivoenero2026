// Selectores básicos
export const selectUser = state => state.auth.user;
export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectAuthLoading = state => state.auth.loading;
export const selectAuthError = state => state.auth.error;
export const selectSessionExpired = state => state.auth.sessionExpired;

// Selectores derivados
export const selectUserId = state => state.auth.user?.id;
export const selectUserName = state => state.auth.user?.name;
export const selectUserAvatar = state => state.auth.user?.avatar;
export const selectUserEmail = state => state.auth.user?.email;
export const selectUserNeighborhood = state => state.auth.user?.neighborhood;

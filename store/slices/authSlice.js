import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  user: null,
  role: null, // 'admin' | 'owner' | 'staff' | 'customer'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload || {};
      state.token = token ?? state.token;
      state.user = user ?? state.user;
      state.role = user?.role ?? state.role;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.role = null;
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/auth/login";
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;



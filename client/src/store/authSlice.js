import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const initialState = {
  user: null,
  token: localStorage.getItem("access_token") || null,
  isAuthenticated: false,
};

// Helper function to decode token and get user info
const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
  } catch {
    return null;
  }
};

// Initialize user from token if exists
if (initialState.token) {
  const user = getUserFromToken(initialState.token);
  if (user) {
    initialState.user = user;
    initialState.isAuthenticated = true;
  } else {
    // Token invalid, remove it
    localStorage.removeItem("access_token");
    initialState.token = null;
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { access_token, role } = action.payload;
      state.token = access_token;
      state.isAuthenticated = true;

      // Decode token to get user info
      const user = getUserFromToken(access_token);
      if (user) {
        state.user = user;
      }

      // Save to localStorage
      localStorage.setItem("access_token", access_token);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("access_token");
    },

    checkAuth: (state) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        const user = getUserFromToken(token);
        if (user) {
          state.token = token;
          state.user = user;
          state.isAuthenticated = true;
        } else {
          // Invalid token
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem("access_token");
        }
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
  },
});

export const { loginSuccess, logout, checkAuth } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;

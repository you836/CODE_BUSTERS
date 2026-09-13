import { create } from 'zustand';
import api from '../api/axios.js';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('life_rpg_user') || 'null'),
  token: localStorage.getItem('life_rpg_token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('life_rpg_token', data.token);
      localStorage.setItem('life_rpg_user', JSON.stringify(data));
      set({ user: data, token: data.token, isLoading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      localStorage.setItem('life_rpg_token', data.token);
      localStorage.setItem('life_rpg_user', JSON.stringify(data));
      set({ user: data, token: data.token, isLoading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      return false;
    }
  },

  demoLogin: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/demo');
      localStorage.setItem('life_rpg_token', data.token);
      localStorage.setItem('life_rpg_user', JSON.stringify(data));
      set({ user: data, token: data.token, isLoading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Demo login failed',
        isLoading: false,
      });
      return false;
    }
  },

  googleLogin: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/google', { credential });
      localStorage.setItem('life_rpg_token', data.token);
      localStorage.setItem('life_rpg_user', JSON.stringify(data));
      set({ user: data, token: data.token, isLoading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Google authentication failed',
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('life_rpg_token');
    localStorage.removeItem('life_rpg_user');
    set({ user: null, token: null });
  },

  updateUserStats: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updatedFields };
      localStorage.setItem('life_rpg_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));

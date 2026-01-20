import { create } from 'zustand';
import api, { setupTokenRefresh } from '../services/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, refreshToken, expiresIn, ...userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('tokenExpiry', Date.now() + expiresIn * 1000);
            localStorage.setItem('user', JSON.stringify(userData));

            // Setup proactive token refresh
            setupTokenRefresh();

            set({ user: userData, isAuthenticated: true, isLoading: false });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Login failed',
                isLoading: false
            });
            return false;
        }
    },

    signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/signup', userData);
            const { token, refreshToken, expiresIn, ...user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('tokenExpiry', Date.now() + expiresIn * 1000);
            localStorage.setItem('user', JSON.stringify(user));

            // Setup proactive token refresh
            setupTokenRefresh();

            set({ user: user, isAuthenticated: true, isLoading: false });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Signup failed',
                isLoading: false
            });
            return false;
        }
    },

    updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put('/auth/profile', data);
            const updatedUser = response.data;

            localStorage.setItem('user', JSON.stringify(updatedUser));
            set({ user: updatedUser, isLoading: false });
            alert('Profile updated successfully!');
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Update failed',
                isLoading: false
            });
            return false;
        }
    },

    changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
            await api.put('/auth/password', { currentPassword, newPassword });
            set({ isLoading: false });
            return { success: true, message: 'Password updated successfully!' };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Password change failed';
            set({
                error: errorMessage,
                isLoading: false
            });
            return { success: false, message: errorMessage };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
    },
}));

export default useAuthStore;

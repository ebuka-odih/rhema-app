import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from './apiConfig';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const authService = {
    async setToken(token: string) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    },

    async getToken() {
        return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    },

    async setUser(user: any) {
        await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
    },

    async getUser() {
        const user = await SecureStore.getItemAsync(USER_DATA_KEY);
        return user ? JSON.parse(user) : null;
    },

    async clearAuth() {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_DATA_KEY);
    },

    async login(credentials: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');

            await this.setToken(data.access_token);
            await this.setUser(data.user);
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    async register(userData: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...userData,
                    password_confirmation: userData.password // Laravel expects confirmation
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');

            await this.setToken(data.access_token);
            await this.setUser(data.user);
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    async logout() {
        const token = await this.getToken();
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            await this.clearAuth();
        }
    },

    async fetchMe() {
        const token = await this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/user`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const user = await response.json();
                await this.setUser(user);
                return user;
            }
            if (response.status === 401) {
                await this.clearAuth();
            }
        } catch (e) {
            console.error('Fetch user error:', e);
        }
        return null;
    }
};

// Hook to mimic better-auth useSession
export const useSession = () => {
    const [data, setData] = useState<any>(null);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const user = await authService.getUser();
            if (user) {
                setData({ user });
                // Optionally refresh user from server
                authService.fetchMe().then(refreshedUser => {
                    if (refreshedUser) setData({ user: refreshedUser });
                });
            }
            setIsPending(false);
        };
        checkSession();
    }, []);

    return { data, isPending };
};

// Mimic better-auth structure for compatibility in screens
export const signIn = {
    email: (creds: any) => authService.login(creds)
};

export const signUp = {
    email: (creds: any) => authService.register(creds)
};

export const signOut = () => authService.logout();

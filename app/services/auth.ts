import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from './apiConfig';

console.log('API_BASE_URL:', API_BASE_URL);

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
            const response = await fetch(`${API_BASE_URL}login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(credentials),
            });
            const text = await response.text();

            if (!response.ok) {
                let message = 'Login failed';
                try {
                    const data = JSON.parse(text);
                    message = data.message || message;
                } catch (e) {
                    console.error('Failed to parse error JSON:', text.substring(0, 100));
                }
                throw new Error(message);
            }

            const data = JSON.parse(text);
            await this.setToken(data.access_token);
            await this.setUser(data.user);
            notifyListeners({ user: data.user });
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    async register(userData: any) {
        try {
            const response = await fetch(`${API_BASE_URL}register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...userData,
                    password_confirmation: userData.password // Laravel expects confirmation
                }),
            });
            const text = await response.text();

            if (!response.ok) {
                let message = 'Registration failed';
                try {
                    const data = JSON.parse(text);
                    message = data.message || message;
                } catch (e) {
                    console.error('Failed to parse error JSON:', text.substring(0, 100));
                }
                throw new Error(message);
            }

            const data = JSON.parse(text);
            await this.setToken(data.access_token);
            await this.setUser(data.user);
            notifyListeners({ user: data.user });
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    async googleLogin(token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ token }),
            });
            const text = await response.text();

            if (!response.ok) {
                let message = 'Google login failed';
                try {
                    const data = JSON.parse(text);
                    message = data.message || message;
                } catch (e) {
                    console.error('Failed to parse error JSON:', text.substring(0, 100));
                }
                throw new Error(message);
            }

            const data = JSON.parse(text);
            await this.setToken(data.access_token);
            await this.setUser(data.user);
            notifyListeners({ user: data.user });
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
            notifyListeners(null);
        }
    },

    async fetchMe() {
        const token = await this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });
            const text = await response.text();

            if (response.ok) {
                try {
                    const user = JSON.parse(text);
                    await this.setUser(user);
                    return user;
                } catch (e) {
                    console.error('fetchMe parse error:', text.substring(0, 100));
                }
            }
            if (response.status === 401) {
                await this.clearAuth();
                notifyListeners(null);
            }
        } catch (e) {
            console.error('Fetch user error:', e);
        }
        return null;
    },

    async updateUser(data: any) {
        const token = await this.getToken();
        try {
            const response = await fetch(`${API_BASE_URL}user`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (response.ok) {
                await this.setUser(result.user);
                return { data: result.user, error: null };
            }
            throw new Error(result.message || 'Update failed');
        } catch (error: any) {
            return { data: null, error };
        }
    },

    async updatePassword(data: any) {
        const token = await this.getToken();
        try {
            const response = await fetch(`${API_BASE_URL}user/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (response.ok) {
                return { data: result, error: null };
            }
            throw new Error(result.message || 'Password update failed');
        } catch (error: any) {
            return { data: null, error };
        }
    }
};

// Simple pub/sub for session changes
const listeners = new Set<(session: any) => void>();
const notifyListeners = (session: any) => listeners.forEach(l => l(session));

// Hook to mimic better-auth useSession
export const useSession = () => {
    const [data, setData] = useState<any>(null);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkSession = async () => {
            const user = await authService.getUser();
            if (isMounted) {
                setData(user ? { user } : null);
                setIsPending(false);
            }

            if (user) {
                authService.fetchMe().then(refreshedUser => {
                    if (isMounted && refreshedUser) setData({ user: refreshedUser });
                });
            }
        };

        const handleUpdate = (session: any) => {
            if (isMounted) setData(session);
        };

        listeners.add(handleUpdate);
        checkSession();

        return () => {
            isMounted = false;
            listeners.delete(handleUpdate);
        };
    }, []);

    return { data, isPending };
};

// Mimic better-auth structure for compatibility in screens
export const signIn = {
    email: (creds: any) => authService.login(creds),
    google: (token: string) => authService.googleLogin(token)
};

export const signUp = {
    email: (creds: any) => authService.register(creds)
};

export const signOut = () => authService.logout();

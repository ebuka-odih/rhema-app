import { Platform } from 'react-native';

const getBaseUrl = () => {
    // If in development and on Android emulator
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8000/api';
        }
        if (Platform.OS === 'ios' || Platform.OS === 'web') {
            return 'http://localhost:8000/api';
        }
    }
    // Fallback or production URL
    return 'http://localhost:8000/api';
};

const getAuthBaseUrl = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:3000';
        }
        if (Platform.OS === 'ios' || Platform.OS === 'web') {
            return 'http://localhost:3000';
        }
    }
    return 'http://localhost:3000';
};

export const API_BASE_URL = getBaseUrl();
export const AUTH_BASE_URL = getAuthBaseUrl();

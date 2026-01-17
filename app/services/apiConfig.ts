import { Platform } from 'react-native';

const getBaseUrl = () => {
    // Return the production-like local development URL or the requested store URL
    // For now, setting it to the requested URL:
    return 'https://port.namelesss.store/backend/public/api';
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

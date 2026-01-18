import { Platform } from 'react-native';

const getBaseUrl = () => {
    return process.env.EXPO_PUBLIC_API_URL || 'https://port.namelesss.store/backend/public/api';
};

export const API_BASE_URL = getBaseUrl();

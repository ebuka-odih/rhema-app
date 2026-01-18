import { Platform } from 'react-native';

const getBaseUrl = () => {
    let url = process.env.EXPO_PUBLIC_API_URL || 'https://port.namelesss.store/backend/public/api/';
    return url.endsWith('/') ? url : `${url}/`;
};

export const API_BASE_URL = getBaseUrl();

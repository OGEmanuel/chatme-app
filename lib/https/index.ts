import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // 20 seconds
});

const https = axiosInstance;

export { https };

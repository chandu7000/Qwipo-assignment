import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

export function handleApiError(error) {
  if (error.response) {
    const { status, data } = error.response;
    throw new Error(data?.message || `Request failed (${status})`);
  }
  throw new Error(error.message || 'Network error');
}



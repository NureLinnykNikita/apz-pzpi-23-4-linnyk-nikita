import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Direct logout — bypasses the auth interceptor so a stale/missing token
 * never triggers a refresh loop. Includes the current access token so the
 * server can invalidate the session. Errors are silently swallowed.
 */
export const logoutDirect = () =>
  axios
    .post(`${BASE_URL}/logout`, {}, {
      withCredentials: true,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    })
    .catch(() => {});

export const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

let accessToken: string | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/refresh`, {}, { withCredentials: true }); // plain axios – no interceptor
        const newToken: string = data.accessToken;
        setAccessToken(newToken);
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
        window.location.href = '/auth/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

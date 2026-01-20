import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token refresh state to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't try to refresh for auth endpoints
            if (['/auth/login', '/auth/signup', '/auth/refresh'].includes(originalRequest.url)) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Queue the request while refreshing
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                // No refresh token, logout user
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;

                // Store new tokens
                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                localStorage.setItem('tokenExpiry', Date.now() + expiresIn * 1000);

                // Update authorization header
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                processQueue(null, accessToken);

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                
                // Refresh failed, logout user
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('tokenExpiry');
                window.location.href = '/login';
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Proactive token refresh - refresh before expiry
export const setupTokenRefresh = () => {
    const checkAndRefresh = async () => {
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!tokenExpiry || !refreshToken) return;

        const expiryTime = parseInt(tokenExpiry, 10);
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;

        // Refresh if less than 2 minutes until expiry
        if (timeUntilExpiry < 2 * 60 * 1000 && timeUntilExpiry > 0) {
            try {
                const response = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;

                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                localStorage.setItem('tokenExpiry', Date.now() + expiresIn * 1000);

                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            } catch (error) {
                // Silent fail - will be handled on next request
            }
        }
    };

    // Check every minute
    const intervalId = setInterval(checkAndRefresh, 60 * 1000);

    // Also check immediately
    checkAndRefresh();

    return () => clearInterval(intervalId);
};

export const downloadReport = async (analysisId, fieldName) => {
    try {
        const response = await api.get(`/reports/${analysisId}/download`, {
            responseType: 'blob', // Important for file download
        });

        // Create a link to download the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `SoilReport_${fieldName.replace(/\s+/g, '_')}.pdf`);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
};

/**
 * Export analysis data as CSV
 * @param {string} fieldId - Optional field ID to filter by
 */
export const exportCSV = async (fieldId = null) => {
    try {
        const url = fieldId ? `/export/csv?fieldId=${fieldId}` : '/export/csv';
        const response = await api.get(url, { responseType: 'blob' });

        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `analysis_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        return true;
    } catch (error) {
        console.error('CSV export failed:', error);
        throw error;
    }
};

/**
 * Export analysis data as Excel
 * @param {string} fieldId - Optional field ID to filter by
 */
export const exportExcel = async (fieldId = null) => {
    try {
        const url = fieldId ? `/export/excel?fieldId=${fieldId}` : '/export/excel';
        const response = await api.get(url, { responseType: 'blob' });

        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `analysis_export_${Date.now()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        return true;
    } catch (error) {
        console.error('Excel export failed:', error);
        throw error;
    }
};

/**
 * Export single field's analysis history
 * @param {string} fieldId - Field ID
 * @param {string} fieldName - Field name for filename
 * @param {string} format - 'csv' or 'xlsx'
 */
export const exportFieldAnalysis = async (fieldId, fieldName, format = 'csv') => {
    try {
        const response = await api.get(`/export/field/${fieldId}?format=${format}`, { responseType: 'blob' });

        const ext = format === 'xlsx' ? 'xlsx' : 'csv';
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `${fieldName.replace(/\s+/g, '_')}_analysis.${ext}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        return true;
    } catch (error) {
        console.error('Field export failed:', error);
        throw error;
    }
};

export default api;

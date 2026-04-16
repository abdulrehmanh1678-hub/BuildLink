/**
 * Application Configuration
 * Centralized configuration for backend services
 *
 * Production: set <meta name="buildlink-api-base" content="https://your-api.com">
 * in index.html (full origin only, no /api — it is appended), or define
 * window.__BUILDLINK_API_BASE__ before this script loads.
 */

function resolveApiBaseURL() {
    if (typeof window === 'undefined') {
        return 'http://localhost:5001/api';
    }
    if (window.__BUILDLINK_API_BASE__) {
        const root = String(window.__BUILDLINK_API_BASE__).trim().replace(/\/$/, '');
        return root.endsWith('/api') ? root : `${root}/api`;
    }
    const meta = document.querySelector('meta[name="buildlink-api-base"]');
    if (meta && meta.content && meta.content.trim()) {
        const root = meta.content.trim().replace(/\/$/, '');
        return root.endsWith('/api') ? root : `${root}/api`;
    }
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:5001/api';
    }
    // Deployed without meta: same-origin /api (only works if you proxy API on the host)
    const { protocol, host: h } = window.location;
    return `${protocol}//${h}/api`;
}

const Config = {
    // Backend API Configuration
    api: {
        get baseURL() {
            return resolveApiBaseURL();
        },
        timeout: 10000, // Request timeout in milliseconds
        retryAttempts: 3, // Number of retry attempts for failed requests
        retryDelay: 1000, // Delay between retries in milliseconds

        // Check if backend is configured
        isConfigured() {
            return resolveApiBaseURL() !== '';
        }
    },

    // Feature Flags
    features: {
        useBackend: true, // Set to true after backend is installed and running
        useLocalStorageFallback: false, // Keep localStorage as fallback
        enableRealtime: false, // Future: WebSocket support
        enableEmailVerification: false // Future: Email verification
    },

    // Helper to determine if backend should be used
    shouldUseBackend() {
        return this.features.useBackend && this.api.isConfigured();
    }
};

// Make config globally available
window.Config = Config;

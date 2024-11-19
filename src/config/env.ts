/// <reference types="vite/client" />

export const config = {
    apiUrl: import.meta.env.VITE_API_URL,
    wsUrl: import.meta.env.VITE_WS_URL,
} as const;

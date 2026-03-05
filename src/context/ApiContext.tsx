import React, { createContext, useContext } from 'react';
import { supabaseAnonKey, supabaseFunctionEndpoint } from '../config/env';

interface ApiConfig {
    baseUrl: string;
    apiKey: string;
    timeout: number;
}

const ApiContext = createContext<ApiConfig | null>(null);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
    const config: ApiConfig = {
        baseUrl: supabaseFunctionEndpoint,
        apiKey: supabaseAnonKey,
        timeout: 5000,
    };

    return (
        <ApiContext.Provider value={config}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = (): ApiConfig => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
};

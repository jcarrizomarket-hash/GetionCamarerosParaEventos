import React, { createContext, useContext } from 'react';
import { supabaseFunctionEndpoint, supabaseAnonKey } from '../config/env';

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

export const useApi = (): ApiConfig | null => {
    return useContext(ApiContext);
};

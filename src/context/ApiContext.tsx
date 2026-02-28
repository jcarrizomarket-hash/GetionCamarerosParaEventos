import React, { createContext, useContext } from 'react';
import { supabaseFunctionEndpoint, supabaseAnonKey } from '../config/env';

interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

const ApiContext = createContext<ApiConfig | undefined>(undefined);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
    const config: ApiConfig = {
        baseUrl: supabaseFunctionEndpoint,
        apiKey: supabaseAnonKey,
        timeout: 5000  // 5 seconds timeout
    };

    return (
        <ApiContext.Provider value={config}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => {
    return useContext(ApiContext);
};

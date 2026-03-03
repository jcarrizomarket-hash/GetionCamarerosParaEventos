import React, { createContext, useContext } from 'react';
import { supabaseFunctionEndpoint, supabaseAnonKey } from '../config/env';

const ApiContext = createContext<{
  baseUrl: string;
  apiKey: string;
  timeout: number;
} | undefined>(undefined);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
    const config = {
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

export const useApi = () => {
    return useContext(ApiContext);
};

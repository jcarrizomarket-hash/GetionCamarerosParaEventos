import React, { createContext, useContext } from 'react';

const ApiContext = createContext<any>(null);

export const ApiProvider = ({ children }) => {
    const config = {
        baseUrl: 'https://example.com/api', // replace with your API base URL
        apiKey: 'your_api_key_here', // replace with your API key
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

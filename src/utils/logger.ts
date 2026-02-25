// Centralized logging utility

const logger = (message: string) => {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
};

export default logger;
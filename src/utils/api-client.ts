import axios, { AxiosRequestConfig } from 'axios';
import { createLogger, transports } from 'winston';

// Logger setup
const logger = createLogger({
  level: 'info',
  format: require('winston').format.combine(
    require('winston').format.timestamp(),
    require('winston').format.json()
  ),
  transports: [new transports.Console()]
});

// API Client Configurations
const API_TIMEOUT = 5000; // 5 seconds timeout
const MAX_RETRIES = 3;

class APIClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
    });
  }

  async request(config) {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await this.client.request(config);
        return response.data;
      } catch (error) {
        logger.error(`API call failed: ${error.message}`);
        if (retries >= MAX_RETRIES - 1) throw error; // Rethrow the error if the last retry failed
        retries++;
        logger.info(`Retrying... (${retries})`);
      }
    }
  }

  async get(url, config = {}) {
    return this.request({ method: 'GET', url, ...config });
  }

  async post(url, data, config = {}) {
    return this.request({ method: 'POST', url, data, ...config });
  }
  
  // Add more HTTP methods as needed
}

export default APIClient;

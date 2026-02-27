import { logger } from './logger';

// API Client Configurations
const API_TIMEOUT = 5000; // 5 seconds timeout
const MAX_RETRIES = 3;

interface RequestConfig {
  method?: string;
  headers?: HeadersInit;
  body?: string;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request(url: string, config: RequestConfig = {}): Promise<unknown> {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      try {
        const response = await fetch(this.baseURL + url, {
          ...config,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        logger.error(`API call failed: ${error instanceof Error ? error.message : String(error)}`);
        if (retries >= MAX_RETRIES - 1) throw error;
        retries++;
        logger.info(`Retrying... (${retries})`);
      }
    }
  }

  async get(url: string, config: RequestConfig = {}): Promise<unknown> {
    return this.request(url, { method: 'GET', ...config });
  }

  async post(url: string, data: unknown, config: RequestConfig = {}): Promise<unknown> {
    return this.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...config.headers },
      body: JSON.stringify(data),
      ...config,
    });
  }
}

export default APIClient;

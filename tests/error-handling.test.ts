import { logger } from '../path/to/logger';
import { errorHandler } from '../path/to/errorHandler';

describe('Error Handling Tests', () => {
    test('should log error when errorHandler is called', () => {
        const error = new Error('Test error');
        const spy = jest.spyOn(logger, 'error');

        errorHandler(error);

        expect(spy).toHaveBeenCalledWith('Test error');
        spy.mockRestore();
    });

    test('should handle missing parameters gracefully', () => {
        const result = errorHandler();
        expect(result).toEqual({ error: 'Parameters are required' });
    });

    test('should return a default error message for unknown error types', () => {
        const error = new Error('Unknown error');
        const result = errorHandler(error);
        expect(result).toEqual({ error: 'An unknown error occurred' });
    });
});

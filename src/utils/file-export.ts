// file-export.ts

/**
 * A collection of utility functions for safely exporting data in CSV and JSON formats.
 */

/**
 * Exports data to a secure CSV format.
 * @param {Array<Object>} data - The data to be exported.
 * @param {string} filename - The name of the file to save the data to.
 */
function exportToCSV(data, filename) {
    const csvRows: string[] = [];

    // Get the headers
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    // Format each row of data
    for (const row of data) {
        const values = headers.map(header => JSON.stringify(row[header]));
        csvRows.push(values.join(','));
    }

    // Create a blob and download the file
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exports data to a secure JSON format.
 * @param {Array<Object>} data - The data to be exported.
 * @param {string} filename - The name of the file to save the data to.
 */
function exportToJSON(data, filename) {
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(jsonBlob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Example usage:
// exportToCSV(data, 'data.csv');
// exportToJSON(data, 'data.json');

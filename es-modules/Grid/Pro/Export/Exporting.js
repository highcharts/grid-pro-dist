/* *
 *
 *  Grid Exporting class
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Karol Kolodziej
 *
 * */
'use strict';
import DownloadURL from '../../../Shared/DownloadURL.js';
const { downloadURL, getBlobFromContent } = DownloadURL;
/* *
 *
 *  Class
 *
 * */
/**
 * Export the given table to CSV format.
 */
class Exporting {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Construct the exporting.
     *
     * @param grid
     * The Grid instance.
     */
    constructor(grid) {
        this.grid = grid;
    }
    /* *
    *
    *  Methods
    *
    * */
    /**
     * Downloads the CSV string as a file.
     *
     * @param modified
     * Whether to return the modified data table (after filtering/sorting/etc.)
     * or the unmodified, original one. Default value is set to `true`.
     */
    downloadCSV(modified = true) {
        const csv = this.getCSV(modified);
        downloadURL(getBlobFromContent(csv, 'text/csv') ||
            'data:text/csv,\uFEFF' + encodeURIComponent(csv), this.getFilename() + '.csv');
    }
    /**
     * Downloads the JSON string as a file.
     *
     * @param modified
     * Whether to return the modified data table (after filtering/sorting/etc.)
     * or the unmodified, original one. Default value is set to `true`.
     */
    downloadJSON(modified = true) {
        const json = this.getJSON(modified);
        downloadURL(getBlobFromContent(json, 'application/json') ||
            'data:application/json,\uFEFF' + encodeURIComponent(json), this.getFilename() + '.json');
    }
    /**
     * Creates a CSV string from the data table.
     *
     * @param modified
     * Whether to return the modified data table (after filtering/sorting/etc.)
     * or the unmodified, original one. Default value is set to `true`.
     *
     * @return
     * CSV string representing the data table.
     */
    getCSV(modified = true) {
        const dataTable = modified ?
            this.grid.viewport?.dataTable :
            this.grid.dataTable;
        if (!dataTable) {
            return '';
        }
        const options = this.grid.options?.exporting || Exporting.defaultOptions;
        const { useLocalDecimalPoint, lineDelimiter, firstRowAsNames } = options.csv ?? {};
        const exportNames = firstRowAsNames !== false;
        let { decimalPoint, itemDelimiter } = options.csv ?? {};
        if (!decimalPoint) {
            decimalPoint = (itemDelimiter !== ',' && useLocalDecimalPoint ?
                (1.1).toLocaleString()[1] :
                '.');
        }
        if (!itemDelimiter) {
            itemDelimiter = (decimalPoint === ',' ? ';' : ',');
        }
        const columns = dataTable.getColumns();
        const columnIds = Object.keys(columns);
        const csvRows = [];
        const columnsCount = columnIds.length;
        const rowArray = [];
        // Add the names as the first row if they should be exported
        if (exportNames) {
            csvRows.push(columnIds.map((columnId) => `"${columnId}"`).join(itemDelimiter));
        }
        for (let columnIndex = 0; columnIndex < columnsCount; columnIndex++) {
            const columnId = columnIds[columnIndex], column = columns[columnId], columnLength = column.length;
            let columnDataType;
            for (let rowIndex = 0; rowIndex < columnLength; rowIndex++) {
                let cellValue = column[rowIndex];
                if (!rowArray[rowIndex]) {
                    rowArray[rowIndex] = [];
                }
                // Prefer datatype from metadata
                if (columnDataType === 'string') {
                    cellValue = '"' + cellValue + '"';
                }
                else if (typeof cellValue === 'number') {
                    cellValue = String(cellValue).replace('.', decimalPoint);
                }
                else if (typeof cellValue === 'string') {
                    cellValue = `"${cellValue}"`;
                }
                rowArray[rowIndex][columnIndex] = cellValue;
                // On the final column, push the row to the CSV
                if (columnIndex === columnsCount - 1) {
                    // Trim repeated undefined values starting at the end
                    // Currently, we export the first "comma" even if the
                    // second value is undefined
                    let i = columnIndex;
                    while (rowArray[rowIndex].length > 2) {
                        const cellVal = rowArray[rowIndex][i];
                        if (cellVal !== void 0) {
                            break;
                        }
                        rowArray[rowIndex].pop();
                        i--;
                    }
                    csvRows.push(rowArray[rowIndex].join(itemDelimiter));
                }
            }
        }
        return csvRows.join(lineDelimiter);
    }
    /**
     * Returns the current grid data as a JSON string.
     *
     * @param modified
     * Whether to return the modified data table (after filtering/sorting/etc.)
     * or the unmodified, original one. Default value is set to `true`.
     *
     * @return
     * JSON representation of the data
     */
    getJSON(modified = true) {
        return this.grid.getData(modified);
    }
    /**
     * Get the default file name used for exported the grid.
     *
     * @returns
     * A file name without extension.
     */
    getFilename() {
        let filename = this.grid.options?.exporting?.filename || 'Grid';
        if (filename) {
            return filename.replace(/\//g, '-');
        }
        if (typeof filename === 'string') {
            filename = filename
                .toLowerCase()
                .replace(/<\/?[^>]+(>|$)/g, '') // Strip HTML tags
                .replace(/[\s_]+/g, '-')
                .replace(/[^a-z\d\-]/g, '') // Preserve only latin
                .replace(/^[\-]+/g, '') // Dashes in the start
                .replace(/[\-]+/g, '-') // Dashes in a row
                .substr(0, 24)
                .replace(/[\-]+$/g, ''); // Dashes in the end;
        }
        return filename;
    }
}
/**
 * Default options of the credits.
 */
Exporting.defaultOptions = {
    filename: 'Grid',
    csv: {
        firstRowAsNames: true,
        useLocalDecimalPoint: true,
        itemDelimiter: ',',
        lineDelimiter: '\n'
    }
};
/* *
 *
 *  Default Export
 *
 * */
export default Exporting;

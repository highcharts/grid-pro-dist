import type Grid from '../../Core/Grid';
import type { ExportingOptions } from '../../Core/Options';
/**
 * Export the given table to CSV format.
 */
declare class Exporting {
    /**
     * The Grid instance.
     */
    readonly grid: Grid;
    /**
     * Default options of the credits.
     */
    static defaultOptions: ExportingOptions;
    /**
     * Construct the exporting.
     *
     * @param grid
     * The Grid instance.
     */
    constructor(grid: Grid);
    /**
     * Downloads the CSV string as a file.
     *
     * @param modified
     * Whether to return the modified data table (after filtering/sorting/etc.)
     * or the unmodified, original one. Default value is set to `true`.
     */
    downloadCSV(modified?: boolean): void;
    /**
     * Downloads the JSON string as a file.
     *
     * @param modified
     * Whether to return the modified data table (after filtering/sorting/etc.)
     * or the unmodified, original one. Default value is set to `true`.
     */
    downloadJSON(modified?: boolean): void;
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
    getCSV(modified?: boolean): string;
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
    getJSON(modified?: boolean): string;
    /**
     * Get the default file name used for exported the grid.
     *
     * @returns
     * A file name without extension.
     */
    private getFilename;
}
export default Exporting;

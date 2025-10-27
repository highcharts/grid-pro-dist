import type Grid from '../../Core/Grid';
import Exporting from './Exporting.js';
declare namespace ExportingComposition {
    /**
     * Extends the grid classes with exporting.
     *
     * @param GridClass
     * The class to extend.
     *
     */
    function compose(GridClass: typeof Grid): void;
}
declare module '../../Core/Options' {
    interface Options {
        /**
         * Options for the exporting.
         *
         * Try it: {@link https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/grid-pro/basic/exporting | Export to CSV}
         */
        exporting?: ExportingOptions;
    }
    interface ExportingOptions {
        /**
         * The file name to use for exported the grid.
         */
        filename?: string;
        /**
         * Exporting options for the CSV.
         */
        csv?: {
            /**
             * The decimal point to use in the CSV string.
             */
            decimalPoint?: string;
            /**
             * Whether to export the first row as column names.
             *
             * @default true
             */
            firstRowAsNames?: boolean;
            /**
             * The delimiter used to separate the values in the CSV string.
             *
             * @default ','
             * */
            itemDelimiter?: string;
            /**
             * The delimiter used to separate the lines in the CSV string.
             *
             * @default '\n'
             */
            lineDelimiter?: string;
            /**
             * Whether to use the local decimal point as detected from the
             * browser.
             *
             * @default true
             */
            useLocalDecimalPoint?: boolean;
        };
    }
}
declare module '../../Core/Grid' {
    export default interface Grid {
        exporting?: Exporting;
    }
}
export default ExportingComposition;

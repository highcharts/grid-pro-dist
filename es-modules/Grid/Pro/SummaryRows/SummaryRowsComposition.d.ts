import type Grid from '../../Core/Grid';
import type Options from '../../Core/Options';
import type Table from '../../Core/Table/Table';
import type TableCell from '../../Core/Table/Body/TableCell';
import type { DeepPartial } from '../../../Shared/Types';
import type { SummaryOptions, SummarySectionsOptions } from './SummaryRowsTypes';
import SummaryRowsController from './SummaryRowsController.js';
import SummaryView from './SummaryView.js';
/**
 * Default options contributed by the summary rows feature (accessibility
 * strings). Merged into the shared grid defaults on compose.
 */
export declare const defaultOptions: DeepPartial<Options>;
/**
 * Composes Grid Pro with the flat summary rows feature.
 *
 * @param GridClass
 * Grid class to extend.
 *
 * @param TableClass
 * Table (viewport) class to extend.
 *
 * @param TableCellClass
 * TableCell class to extend.
 */
export declare function compose(GridClass: typeof Grid, TableClass: typeof Table, TableCellClass: typeof TableCell): void;
/**
 * Accessibility language options for summary rows.
 */
export interface SummaryRowsLangA11yOptions {
    /**
     * Descriptions exposed to assistive technology for summary rows.
     */
    descriptions?: {
        /**
         * Role description announced for a summary row.
         */
        summary?: string;
    };
}
declare module '../../Core/Accessibility/A11yOptions' {
    interface LangAccessibilityOptions {
        /**
         * Accessibility language options for summary rows.
         */
        summaryRows?: SummaryRowsLangA11yOptions;
    }
}
declare module '../../Core/Grid' {
    export default interface Grid {
        summaryRows?: SummaryRowsController;
    }
}
declare module '../../Core/Table/Table' {
    export default interface Table {
        summaryView?: SummaryView;
    }
}
declare module '../../Core/Options' {
    interface Options {
        /**
         * Flat summary (total) row options (Grid Pro module).
         *
         * Provide a single object for one summary row, or an array of objects
         * for several.
         *
         * @sample grid-pro/options/summary-rows Summary rows
         * @sample grid-pro/basic/summary-rows-and-columns
         *         Aggregated in both directions
         */
        summaryRows?: SummaryOptions;
    }
    interface RowsSettings {
        /**
         * Options for the summary sections, the frozen `tbody` elements
         * rendered above and below the scrollable table body.
         */
        summary?: SummarySectionsOptions;
    }
}
declare const _default: {
    compose: typeof compose;
};
export default _default;

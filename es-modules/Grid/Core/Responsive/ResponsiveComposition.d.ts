import type { DeepPartial } from '../../../Shared/Types';
import type Grid from '../../Core/Grid';
import type { Options } from '../Options';
import type { ResponsiveOptions, RuleOptions } from './ResponsiveOptions';
/**
 * Extends the grid classes with responsive options.
 *
 * @param GridClass
 * The class to extend.
 *
 */
export declare function compose(GridClass: typeof Grid): void;
declare module '../Options' {
    interface Options {
        /**
         * Allows setting a set of rules to apply for different screen or grid
         * sizes. Each rule specifies additional grid options.
         */
        responsive?: ResponsiveOptions;
    }
}
declare module '../Grid' {
    export default interface Grid {
        /**
         * Tracks the ResizeObserver instance for the grid.
         * @private
         */
        resizeObserver?: ResizeObserver;
        /**
         * Cache of currently active responsive rules.
         * @private
         */
        activeRules?: Set<RuleOptions>;
        /**
         * Stores merged responsive options and undo data.
         * @private
         */
        currentResponsive?: {
            ruleIds?: string;
            mergedOptions: DeepPartial<Options>;
            undoOptions: DeepPartial<Options>;
        };
        /**
         * Prevents recursive updates during responsive changes.
         * @private
         */
        updatingResponsive?: boolean;
    }
}
declare const _default: {
    readonly compose: typeof compose;
};
export default _default;

import type { DeepPartial } from '../../../Shared/Types';
import type { Options } from '../Options';
import type Grid from '../Grid';
/**
 * Options for the responsive behavior of the grid.
 */
export interface ResponsiveOptions {
    /**
     * A set of rules for responsive settings. The rules are executed from
     * the top down.
     */
    rules?: Array<RuleOptions>;
}
/**
 * A rule for the responsive behavior of the grid.
 */
export interface RuleOptions {
    /**
     * A full set of grid options to apply as overrides to the general grid
     * options. The grid options are applied when the given rule is active.
     */
    gridOptions: DeepPartial<Exclude<Options, 'responsive' | 'id'>>;
    /**
     * Under which conditions the rule applies.
     */
    condition: RuleConditionOptions;
}
/**
 * Conditions for the responsive rule.
 */
export interface RuleConditionOptions {
    /**
     * A callback function to gain complete control on when the responsive
     * rule applies. Return `true` if it applies. This opens for checking
     * against other metrics than the grid size, for example the document
     * size or other elements.
     */
    callback?: (this: Grid, grid: Grid) => boolean;
    /**
     * The responsive rule applies if the grid width is less or equal to this.
     */
    maxWidth?: number;
    /**
     * The responsive rule applies if the grid height is less or equal to this.
     */
    maxHeight?: number;
    /**
     * The responsive rule applies if the grid width is greater or equal to
     * this.
     */
    minWidth?: number;
    /**
     * The responsive rule applies if the grid height is greater or equal to
     * this.
     */
    minHeight?: number;
}
export default ResponsiveOptions;

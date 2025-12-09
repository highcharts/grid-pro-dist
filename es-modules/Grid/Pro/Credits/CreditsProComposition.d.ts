import type Grid from '../../Core/Grid';
import CreditsPro from './CreditsPro.js';
/**
 * Extends the grid classes with customizable credits.
 *
 * @param GridClass
 * The class to extend.
 *
 */
export declare function compose(GridClass: typeof Grid): void;
declare module '../../Core/Options' {
    interface Options {
        /**
         * Options for the credits label.
         *
         * Try it: {@link https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/grid-pro/credits | Credits options}
         */
        credits?: CreditsOptions;
    }
}
declare module '../../Core/Grid' {
    export default interface Grid {
        credits?: CreditsPro;
    }
}
declare const _default: {
    readonly compose: typeof compose;
};
export default _default;

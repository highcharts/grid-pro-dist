import type Grid from '../../Core/Grid';
/**
 * Extends the grid classes with license validation.
 *
 * @param GridClass
 * The class to extend.
 *
 */
declare function compose(GridClass: typeof Grid): void;
declare module '../../Core/Options' {
    interface Options {
        /**
         * Grid Key for Grid Pro. Get your Grid Key at:
         * https://shop.highcharts.com
         *
         * The Grid Key can be set globally using `Grid.setOptions()` or
         * on individual Grid instances.
         *
         * @example
         * Global setting.
         *
         * Grid.setOptions({
         *   gridKey: 'XXXX-XXXX-XXXX-AYYY-ZZZZ-WWWW'
         * });
         *
         * @example
         * Per instance.
         *
         * Grid.grid('container', {
         *   gridKey: 'XXXX-XXXX-XXXX-AYYY-ZZZZ-WWWW'
         * });
         */
        gridKey?: string;
    }
}
declare const _default: {
    compose: typeof compose;
};
export default _default;

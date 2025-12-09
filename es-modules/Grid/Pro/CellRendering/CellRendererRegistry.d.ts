import type { CellRendererTypeRegistry } from './CellRendererType';
/**
 * Record of cell renderer classes
 */
export declare const types: CellRendererTypeRegistry;
/**
 * Method used to register new cell renderer classes.
 *
 * @param key
 * Registry key of the cell renderer class.
 *
 * @param CellRendererClass
 * Cell renderer class (aka class constructor) to register.
 */
export declare function registerRenderer<T extends keyof CellRendererTypeRegistry>(key: T, CellRendererClass: CellRendererTypeRegistry[T]): boolean;
declare const _default: {
    readonly types: CellRendererTypeRegistry;
    readonly registerRenderer: typeof registerRenderer;
};
export default _default;

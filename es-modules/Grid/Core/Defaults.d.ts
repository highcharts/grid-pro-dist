import type { Options, LangOptions } from './Options';
import type { DeepPartial } from '../../Shared/Types';
/**
 * Default language options for the Grid.
 */
export declare const defaultLangOptions: DeepPartial<LangOptions>;
/**
 * Default options for the Grid.
 */
export declare const defaultOptions: DeepPartial<Options>;
/**
 * Merge the default options with custom options. Commonly used for defining
 * reusable templates.
 *
 * @param options
 * The new custom grid options.
 */
export declare function setOptions(options: DeepPartial<Options>): void;
declare const _default: {
    readonly defaultOptions: DeepPartial<Options>;
    readonly setOptions: typeof setOptions;
};
export default _default;

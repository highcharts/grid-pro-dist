import type Options from './Options';
import type { DeepPartial } from '../../Shared/Types';
/**
 * Namespace for default options.
 */
declare namespace Defaults {
    /**
     * Default options for the Grid.
     */
    const defaultOptions: DeepPartial<Options>;
    /**
     * Merge the default options with custom options. Commonly used for defining
     * reusable templates.
     *
     * @param options
     * The new custom chart options.
     */
    function setOptions(options: DeepPartial<Options>): void;
}
export default Defaults;

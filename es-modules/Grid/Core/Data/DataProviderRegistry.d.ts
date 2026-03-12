import type { DataProviderTypeRegistry } from './DataProviderType';
/**
 * Record of data provider classes
 */
export declare const types: DataProviderTypeRegistry;
/**
 * Method used to register new data provider classes.
 *
 * @param key
 * Registry key of the data provider class.
 *
 * @param DataProviderClass
 * Data provider class (aka class constructor) to register.
 */
export declare function registerDataProvider<T extends keyof DataProviderTypeRegistry>(key: T, DataProviderClass: DataProviderTypeRegistry[T]): boolean;
declare const _default: {
    readonly registerDataProvider: typeof registerDataProvider;
    readonly types: DataProviderTypeRegistry;
};
export default _default;

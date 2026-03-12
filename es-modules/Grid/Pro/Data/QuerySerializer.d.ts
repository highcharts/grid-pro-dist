export interface QueryFingerprintInput {
    sorting: {
        modifier?: {
            options?: unknown;
        };
    };
    filtering: {
        modifier?: {
            options?: unknown;
        };
    };
    pagination: {
        enabled: boolean;
        currentPage: number;
        currentPageSize: number;
    };
}
/**
 * Creates a deterministic fingerprint of the current query state.
 *
 * @param input
 * Minimal query-like object (duck-typed) containing sorting, filtering and
 * pagination state.
 */
export declare function createQueryFingerprint(input: QueryFingerprintInput): string;
/**
 * Serializes a filter condition into a deterministic string.
 *
 * @param condition
 * Filter condition (serializable object, callback, or primitive).
 */
export declare function serializeFilterCondition(condition: unknown): string;
/**
 * Serializes an arbitrary value into a deterministic string.
 *
 * @param value
 * Value to serialize.
 */
export declare function serializeValue(value: unknown): string;
/**
 * Small deterministic hash for strings (djb2-ish), returned as base36.
 *
 * @param str
 * String to hash.
 */
export declare function hashString(str: string): string;

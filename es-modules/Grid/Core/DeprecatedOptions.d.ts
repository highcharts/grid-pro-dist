import type { Options } from './Options';
import type { DeprecatedOptionMatchSegment, DeprecatedOptionMetadata } from './DeprecatedOptionsMetadata';
import type { DeepPartial } from '../../Shared/Types';
/**
 * Checks whether a deprecated-option match pattern is used in an options
 * object.
 *
 * @param source
 * Source object or array to inspect.
 *
 * @param pathSegments
 * Property and discriminator segments to traverse.
 *
 * @param segmentIndex
 * Current segment index during recursive traversal.
 */
export declare function matchesDeprecatedOption(source: unknown, pathSegments: Array<DeprecatedOptionMatchSegment>, segmentIndex?: number): boolean;
/**
 * Finds deprecated options used in the provided options object.
 *
 * @param options
 * Grid options to inspect.
 */
export declare function findMatchingDeprecatedOptions(options: DeepPartial<Options>): Array<DeprecatedOptionMetadata>;
/**
 * Builds a warning message for a deprecated Grid option.
 *
 * @param metadata
 * Deprecated option metadata.
 */
export declare function getDeprecatedOptionMessage(metadata: DeprecatedOptionMetadata): string;
/**
 * Emits warnings for deprecated Grid options used in the provided object.
 *
 * @param options
 * Grid options to inspect.
 */
export declare function warnIfDeprecatedOptions(options: DeepPartial<Options>): void;

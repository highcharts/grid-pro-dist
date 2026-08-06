import type { RowId } from '../../Core/Data/DataProvider';
import type { TreeInputPathSeparator } from './TreeViewTypes';
/**
 * Resolves ordered path segments from a raw path value.
 *
 * @param value
 * Raw path value.
 *
 * @param separator
 * Path separator definition.
 *
 * @returns
 * Ordered path segments.
 */
export declare function getPathSegments(value: string, separator: TreeInputPathSeparator): string[];
/**
 * Builds cumulative path hierarchy from ordered path segments.
 *
 * @param value
 * Raw path value.
 *
 * @param columnId
 * Source column ID.
 *
 * @param rowIndex
 * Row index of the value.
 *
 * @param segments
 * Ordered path segments.
 *
 * @param separator
 * Path separator definition.
 *
 * @returns
 * Cumulative path hierarchy from root to leaf.
 */
export declare function buildPathHierarchy(value: string, columnId: string, rowIndex: number, segments: string[], separator: TreeInputPathSeparator): string[];
/**
 * Returns the last path segment that should be rendered for a path value.
 *
 * @param value
 * Raw path value.
 *
 * @param separator
 * Path separator definition.
 *
 * @returns
 * Last segment or original value when it cannot be resolved.
 */
export declare function getLastPathSegment(value: string, separator: TreeInputPathSeparator): string;
/**
 * Normalizes row ID values to `RowId` or `null`.
 *
 * @param value
 * Raw cell value.
 *
 * @param columnId
 * Source column ID.
 *
 * @param rowIndex
 * Row index of the value.
 *
 * @returns
 * Normalized row ID.
 */
export declare function normalizeRowIdValue(value: unknown, columnId: string, rowIndex: number): RowId;
/**
 * Normalizes row ID values to `RowId` or `null`.
 *
 * @param value
 * Raw cell value.
 *
 * @param columnId
 * Source column ID.
 *
 * @param rowIndex
 * Row index of the value.
 *
 * @param allowNull
 * Whether null-like values are allowed.
 *
 * @returns
 * Normalized row ID or `null`.
 */
export declare function normalizeRowIdValue(value: unknown, columnId: string, rowIndex: number, allowNull: false): RowId;
/**
 * Normalizes row ID values to `RowId` or `null`.
 *
 * @param value
 * Raw cell value.
 *
 * @param columnId
 * Source column ID.
 *
 * @param rowIndex
 * Row index of the value.
 *
 * @param allowNull
 * Whether null-like values are allowed.
 *
 * @returns
 * Normalized row ID or `null`.
 */
export declare function normalizeRowIdValue(value: unknown, columnId: string, rowIndex: number, allowNull: true): RowId | null;

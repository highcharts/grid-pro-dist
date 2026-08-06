/* *
 *
 *  Grid Tree View Path Utils
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import { defined, isArray, isFunction, isNumber, isString } from '../../../Shared/Utilities.js';
/* *
 *
 *  Functions
 *
 * */
/**
 * Resolves raw path segments without applying TreeView validation rules.
 *
 * @param value
 * Raw path value.
 *
 * @param separator
 * Path separator definition.
 *
 * @returns
 * Resolved segments or `undefined` when separator is invalid.
 */
function resolvePathSegments(value, separator) {
    if (isFunction(separator)) {
        const segments = separator(value);
        return isArray(segments) ? segments : void 0;
    }
    if (separator instanceof RegExp) {
        const regex = new RegExp(separator.source, separator.flags.includes('g') ?
            separator.flags :
            separator.flags + 'g');
        const segments = [];
        let match;
        while ((match = regex.exec(value)) !== null) {
            segments.push(match[0]);
            if (match[0] === '') {
                ++regex.lastIndex;
            }
        }
        return segments;
    }
    if (!separator) {
        return;
    }
    return value.split(separator);
}
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
export function getPathSegments(value, separator) {
    const segments = resolvePathSegments(value, separator);
    if (segments) {
        return segments;
    }
    if (isFunction(separator)) {
        throw new Error('TreeView: `treeView.input.separator` callback must ' +
            'return an array.');
    }
    throw new Error('TreeView: `treeView.input.separator` must not be empty.');
}
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
export function buildPathHierarchy(value, columnId, rowIndex, segments, separator) {
    const hierarchy = [];
    let path = '';
    const joinWithSeparator = isString(separator);
    for (let i = 0, iEnd = segments.length; i < iEnd; ++i) {
        const segment = segments[i];
        if (!isString(segment) || !segment.length) {
            throw new Error(`TreeView: Invalid path "${value}" in "${columnId}" at row ` +
                `${rowIndex}. Empty path segments are not allowed.`);
        }
        if (joinWithSeparator && path.length) {
            path += separator;
        }
        path += segment;
        hierarchy.push(path);
    }
    return hierarchy;
}
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
export function getLastPathSegment(value, separator) {
    const segments = resolvePathSegments(value, separator);
    const lastSegment = segments?.[segments.length - 1];
    return typeof lastSegment === 'string' && lastSegment.length ?
        lastSegment :
        value;
}
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
export function normalizeRowIdValue(value, columnId, rowIndex, allowNull = false) {
    if (!defined(value)) {
        if (allowNull) {
            return null;
        }
        throw new Error(`TreeView: Missing value in "${columnId}" at row ${rowIndex}.`);
    }
    if (isString(value) || isNumber(value)) {
        return value;
    }
    throw new Error(`TreeView: "${columnId}" must contain only string, number${allowNull ? ', null, or undefined' : ''} values. Invalid value at row ${rowIndex}.`);
}

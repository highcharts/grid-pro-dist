/* *
 *
 *  Grid Tree View Path Input Adapter
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import { buildPathHierarchy, getPathSegments, normalizeRowIdValue } from '../TreeViewCommons.js';
import { defined, isString } from '../../../../Shared/Utilities.js';
/**
 * Builds a canonical tree index from full path definitions.
 *
 * @param table
 * Source table.
 *
 * @param input
 * Normalized tree input options.
 *
 * @param idColumn
 * Column ID containing stable row IDs, when configured.
 *
 * @returns
 * Canonical tree index.
 */
export function buildIndexFromColumns(table, input, idColumn) {
    const { columns } = table;
    const { pathColumn, separator } = input;
    const pathValues = columns[pathColumn];
    if (!pathValues) {
        throw new Error(`TreeView: pathColumn "${pathColumn}" not found.`);
    }
    if (!separator) {
        throw new Error('TreeView: `treeView.input.separator` must not be empty.');
    }
    const rowCount = Math.max(table.getRowCount(), pathValues.length);
    const nodes = new Map();
    const rowOrder = [];
    const pathToId = new Map();
    const pathById = new Map();
    const hierarchyById = new Map();
    const parentPathByPath = new Map();
    for (let rowIndex = 0; rowIndex < rowCount; ++rowIndex) {
        let nodeId;
        if (idColumn) {
            nodeId = normalizeRowIdValue(columns[idColumn]?.[rowIndex], idColumn, rowIndex);
        }
        else {
            nodeId = table.getOriginalRowIndex(rowIndex);
        }
        if (!defined(nodeId)) {
            throw new Error('TreeView: Could not resolve original row index ' +
                `at row ${rowIndex}.`);
        }
        const normalizedPath = normalizePathValue(pathValues[rowIndex], pathColumn, rowIndex, separator);
        const { hierarchy, path } = normalizedPath;
        if (nodes.has(nodeId)) {
            throw new Error(idColumn ?
                `TreeView: Duplicate row id "${String(nodeId)}" in column ` +
                    `"${idColumn}" at row ${rowIndex}.` :
                `TreeView: Duplicate original row index "${String(nodeId)}" ` +
                    `at row ${rowIndex}.`);
        }
        if (pathToId.has(path)) {
            throw new Error(`TreeView: Duplicate path "${path}" in column ` +
                `"${pathColumn}" at row ${rowIndex}.`);
        }
        nodes.set(nodeId, {
            id: nodeId,
            parentId: null,
            rowIndex,
            path,
            childrenIds: []
        });
        rowOrder.push(nodeId);
        pathToId.set(path, nodeId);
        pathById.set(nodeId, path);
        hierarchyById.set(nodeId, hierarchy);
        for (let i = 0, iEnd = hierarchy.length; i < iEnd; ++i) {
            const hierarchyPath = hierarchy[i];
            if (parentPathByPath.has(hierarchyPath)) {
                continue;
            }
            parentPathByPath.set(hierarchyPath, i === 0 ? null : hierarchy[i - 1]);
        }
    }
    const sourceRowOrder = rowOrder.slice();
    /**
     * Ensures a node for a given path.
     *
     * @param path
     * Path to ensure node for.
     *
     * @returns
     * Existing or generated tree node ID.
     */
    function ensureNodeForPath(path) {
        const existingId = pathToId.get(path);
        if (defined(existingId)) {
            return existingId;
        }
        const parentPath = parentPathByPath.get(path) ?? null;
        const parentId = (parentPath === null ?
            null :
            ensureNodeForPath(parentPath));
        const generatedNodeId = createGeneratedRowId(path, nodes);
        nodes.set(generatedNodeId, {
            id: generatedNodeId,
            parentId,
            rowIndex: null,
            isGenerated: true,
            path,
            childrenIds: []
        });
        rowOrder.push(generatedNodeId);
        pathToId.set(path, generatedNodeId);
        pathById.set(generatedNodeId, path);
        if (parentId !== null) {
            nodes.get(parentId)?.childrenIds.push(generatedNodeId);
        }
        return generatedNodeId;
    }
    for (let i = 0, iEnd = sourceRowOrder.length; i < iEnd; ++i) {
        const nodeId = sourceRowOrder[i];
        const node = nodes.get(nodeId);
        const hierarchy = hierarchyById.get(nodeId);
        const path = pathById.get(nodeId);
        if (!node || !defined(path) || !hierarchy) {
            continue;
        }
        const parentPath = parentPathByPath.get(path) ?? null;
        if (parentPath === null) {
            continue;
        }
        const parentId = ensureNodeForPath(parentPath);
        node.parentId = parentId;
        nodes.get(parentId)?.childrenIds.push(node.id);
    }
    return {
        nodes,
        rowOrder
    };
}
/**
 * Normalizes and validates path values.
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
 * @param separator
 * Path segment separator.
 *
 * @returns
 * Normalized path.
 */
function normalizePathValue(value, columnId, rowIndex, separator) {
    if (!isString(value)) {
        throw new Error(`TreeView: "${columnId}" must contain only string values. ` +
            `Invalid value at row ${rowIndex}.`);
    }
    if (!value.length) {
        throw new Error(`TreeView: Empty path in "${columnId}" at row ${rowIndex}.`);
    }
    const segments = getPathSegments(value, separator);
    return {
        hierarchy: buildPathHierarchy(value, columnId, rowIndex, segments, separator),
        path: value
    };
}
/**
 * Creates a deterministic generated row ID for a missing path node.
 *
 * @param path
 * Missing path represented by the generated row.
 *
 * @param nodes
 * Current node map used for collision checks.
 *
 * @returns
 * Unique generated row ID.
 */
function createGeneratedRowId(path, nodes) {
    const base = '__hcg_tree_path__:' + path;
    let candidate = base;
    let suffix = 0;
    while (nodes.has(candidate)) {
        ++suffix;
        candidate = `${base}#${suffix}`;
    }
    return candidate;
}

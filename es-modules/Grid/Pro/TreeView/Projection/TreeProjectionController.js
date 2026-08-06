/* *
 *
 *  Grid Tree Projection Controller
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
import { buildIndexFromColumns as buildPathIndexFromColumns } from '../InputAdapters/PathTreeInputAdapter.js';
import { buildIndexFromColumns as buildGroupingIndexFromColumns } from '../InputAdapters/GroupingTreeInputAdapter.js';
import TreeAggregationResolver from './TreeAggregationResolver.js';
import { resolveActiveGridSortings } from '../../../Core/Querying/SortingUtils.js';
import { buildIndexFromColumns as buildParentIdIndexFromColumns } from '../InputAdapters/ParentIdTreeInputAdapter.js';
import { hasDataTableProvider } from '../../../Core/Data/DataProvider.js';
import { normalizeRowIdValue } from '../TreeViewCommons.js';
import { normalizeTreeViewOptions } from '../TreeViewOptionsNormalizer.js';
import { isDeepEqual } from '../../../Core/GridUtils.js';
import { defined, fireEvent } from '../../../../Shared/Utilities.js';
/* *
 *
 *  Functions
 *
 * */
/**
 * Checks whether provided row indexes represent identity mapping.
 *
 * @param rowIndexes
 * Row indexes to verify.
 *
 * @param rowCount
 * Expected number of rows in identity mapping.
 *
 * @returns
 * `true` for `[0, 1, 2, ...]`, otherwise `false`.
 */
function areRowIndexesIdentity(rowIndexes, rowCount) {
    if (rowIndexes.length !== rowCount) {
        return false;
    }
    for (let i = 0; i < rowCount; ++i) {
        if (rowIndexes[i] !== i) {
            return false;
        }
    }
    return true;
}
/**
 * Builds a stable key for expansion state seeds from options.
 *
 * @param options
 * Resolved TreeView options.
 *
 * @returns
 * Expansion seed key used to decide whether state should be reinitialized.
 */
function getExpansionSeedKey(options) {
    const parts = ['levels:' + String(options.expandedLevels)];
    for (let i = 0, iEnd = options.expandedRowIds.length; i < iEnd; ++i) {
        const id = options.expandedRowIds[i];
        parts.push(typeof id + ':' + String(id));
    }
    return parts.join('|');
}
/**
 * Resolves the aggregator option of column options.
 *
 * @param columnOptions
 * Column options to read.
 *
 * @returns
 * Configured aggregator, when any.
 */
function getColumnOptionsAggregator(columnOptions) {
    return (columnOptions?.rowAggregator ??
        // TODO: Remove deprecated option before releasing next major
        columnOptions?.treeView?.aggregator);
}
/**
 * Resolves effective tree input configuration for source columns.
 *
 * @param columns
 * Source columns.
 *
 * @param input
 * Normalized input configuration. When omitted, the controller auto-detects
 * the standard `parentId` or `path` columns.
 *
 * @returns
 * Resolved normalized input configuration.
 */
function resolveInputOptions(columns, input) {
    if (input) {
        return input;
    }
    const parentIdColumn = 'parentId';
    const pathColumn = 'path';
    const separator = '/';
    const hasParentIdColumn = !!columns[parentIdColumn];
    const hasPathColumn = !!columns[pathColumn];
    if (hasPathColumn) {
        return {
            type: 'path',
            pathColumn,
            separator,
            showFullPath: false
        };
    }
    if (hasParentIdColumn) {
        return {
            type: 'parentId',
            parentIdColumn
        };
    }
    throw new Error('TreeView: Could not autodetect input type. Expected either ' +
        `"${parentIdColumn}" or "${pathColumn}" column, ` +
        'or set `treeView.input.type` explicitly.');
}
/**
 * Runtime type guard for local data provider options.
 *
 * @param dataOptions
 * Data provider options to test.
 *
 * @returns
 * `true` when options belong to the local data provider.
 */
function isLocalDataOptions(dataOptions) {
    return !!(dataOptions &&
        (typeof dataOptions.providerType === 'undefined' ||
            dataOptions.providerType === 'local'));
}
/* *
 *
 *  Class
 *
 * */
/**
 * Infrastructure controller for TreeView projection state.
 *
 * Validates tree input options, builds a canonical relation index and projects
 * queried tables into tree order before pagination.
 */
class TreeProjectionController {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(grid) {
        this.grid = grid;
        this.aggregationResolver = new TreeAggregationResolver({
            getColumnAggregatorOption: (sourceColumnId) => this.getColumnAggregatorOption(sourceColumnId),
            resolveProjectedCellValue: (columnId, rowId, table, projectionState, idColumn) => this.resolveProjectedCellValue(columnId, rowId, table, projectionState, idColumn)
        });
    }
    /* *
     *
     *  Methods
     *
     * */
    /**
     * Synchronizes internal state from current Grid options and provider.
     */
    sync() {
        const dataOptions = this.getDataOptions();
        const normalizedOptions = normalizeTreeViewOptions(this.grid.options, 
        // TODO: Remove deprecated option before releasing next major
        dataOptions?.treeView);
        this.syncRowGroupingIgnoredWarning(!!normalizedOptions?.rowGroupingIgnored);
        if (!normalizedOptions) {
            this.resolvedOptions = void 0;
            this.clearCache();
            return;
        }
        const dataProvider = this.grid.dataProvider;
        if (!hasDataTableProvider(dataProvider)) {
            // Remote provider runtime support is intentionally deferred.
            this.resolvedOptions = void 0;
            this.clearCache();
            return;
        }
        const table = dataProvider.getDataTable(false);
        if (!table) {
            this.resolvedOptions = void 0;
            this.clearCache();
            return;
        }
        const versionTag = table.getVersionTag();
        const idColumn = dataOptions?.idColumn;
        let resolvedInput;
        try {
            resolvedInput = resolveInputOptions(table.columns, normalizedOptions.input);
        }
        catch (error) {
            this.resolvedOptions = void 0;
            this.clearCache();
            throw error;
        }
        const treeColumn = normalizedOptions.treeColumn || (resolvedInput.type === 'grouping' ?
            resolvedInput.groupColumnId :
            void 0);
        const options = {
            ...normalizedOptions,
            input: resolvedInput,
            treeColumn
        };
        this.resolvedOptions = options;
        const isCacheValid = (this.cacheSource?.table === table &&
            this.cacheSource?.versionTag === versionTag &&
            this.cacheSource?.idColumn === idColumn &&
            isDeepEqual(this.cacheSource?.input, options.input));
        if (!isCacheValid) {
            this.indexCache = this.buildIndexFromInput(table, options.input, idColumn);
            this.cacheSource = {
                table,
                versionTag,
                idColumn,
                input: options.input
            };
        }
        this.syncExpandedRowIdsState();
    }
    /**
     * Returns resolved TreeView options for the current source table.
     */
    get options() {
        return this.resolvedOptions;
    }
    /**
     * Warns once when row grouping is ignored, because tree view is enabled at
     * the same time.
     *
     * @param isIgnored
     * Whether row grouping is currently ignored.
     */
    syncRowGroupingIgnoredWarning(isIgnored) {
        if (isIgnored === !!this.rowGroupingIgnoredWarned) {
            return;
        }
        this.rowGroupingIgnoredWarned = isIgnored;
        if (isIgnored) {
            // eslint-disable-next-line no-console
            console.warn('TreeView: `treeView` and `rowGrouping` cannot be enabled at ' +
                'the same time. Row grouping has been ignored.');
        }
    }
    /**
     * Returns metadata for currently projected rows.
     */
    getProjectionState() {
        return this.projectionStateCache;
    }
    /**
     * Returns whether a source column participates in TreeView aggregation.
     *
     * @param columnId
     * Source column id.
     */
    hasColumnAggregation(columnId) {
        return this.aggregationResolver.hasColumnAggregation(columnId);
    }
    /**
     * Returns source column ids hidden from the projected table.
     */
    getHiddenSourceColumnIds() {
        const input = this.options?.input;
        if (input?.type !== 'grouping' || !input.hideGroupByColumns) {
            return;
        }
        return input.groupBy.slice();
    }
    /**
     * Returns whether a projected cell is currently derived from aggregation.
     *
     * @param rowId
     * Row id of the projected row.
     *
     * @param columnId
     * Grid / source column id.
     */
    isCellDerived(rowId, columnId) {
        if (!defined(rowId)) {
            return false;
        }
        const sourceColumnId = this.grid.columnPolicy
            .getColumnSourceId(columnId) || columnId;
        return !!this.projectionStateCache
            ?.derivedCellColumnIdsByRowId
            .get(rowId)
            ?.has(sourceColumnId);
    }
    /**
     * Returns whether a projected row is auto-generated by TreeView.
     *
     * @param rowId
     * Row id of the projected row.
     */
    isGeneratedRow(rowId) {
        if (!defined(rowId)) {
            return false;
        }
        return !!this.indexCache?.nodes.get(rowId)?.isGenerated;
    }
    /**
     * Toggles expansion state for a row in current projection.
     *
     * @param rowId
     * Row ID to toggle.
     *
     * @param redraw
     * Whether to redraw rows after state change.
     *
     * @param originalEvent
     * Browser event that initiated the toggle.
     *
     * @returns
     * Promise resolving to `true` when state changed, otherwise `false`.
     */
    async toggleRow(rowId, redraw = true, originalEvent) {
        const options = this.options;
        const projectionState = this.projectionStateCache;
        if (!options || !projectionState) {
            return false;
        }
        const rowState = projectionState.rowsById.get(rowId);
        if (!rowState?.hasChildren) {
            return false;
        }
        const newExpanded = !rowState.isExpanded;
        const beforeEvent = {
            expanded: newExpanded,
            originalEvent,
            rowId
        };
        fireEvent(this.grid, 'beforeTreeRowToggle', beforeEvent);
        if (beforeEvent.defaultPrevented) {
            return false;
        }
        const changed = this.setRowMetaExpanded(rowId, newExpanded);
        if (!changed) {
            return false;
        }
        this.projectionStateCache = void 0;
        await this.requestRowsRedraw(redraw);
        fireEvent(this.grid, 'afterTreeRowToggle', {
            expanded: newExpanded,
            originalEvent,
            rowId
        });
        return true;
    }
    /**
     * Expands all currently expandable tree rows.
     *
     * @param redraw
     * Whether to redraw rows after state change.
     *
     * @returns
     * Promise resolving to `true` when state changed, otherwise `false`.
     */
    async expandAll(redraw = true) {
        this.sync();
        const index = this.indexCache;
        if (!index) {
            return false;
        }
        let changed = false;
        for (const [nodeId, node] of index.nodes) {
            if (!node.childrenIds.length) {
                continue;
            }
            changed = this.setRowMetaExpanded(nodeId, true) || changed;
        }
        if (changed) {
            this.projectionStateCache = void 0;
            await this.requestRowsRedraw(redraw);
        }
        return changed;
    }
    /**
     * Collapses all currently expandable tree rows.
     *
     * @param redraw
     * Whether to redraw rows after state change.
     *
     * @returns
     * Promise resolving to `true` when state changed, otherwise `false`.
     */
    async collapseAll(redraw = true) {
        this.sync();
        if (!this.indexCache) {
            return false;
        }
        let changed = false;
        for (const [nodeId, node] of this.indexCache.nodes) {
            if (!node.childrenIds.length) {
                continue;
            }
            changed = this.setRowMetaExpanded(nodeId, false) || changed;
        }
        if (!changed) {
            return false;
        }
        this.projectionStateCache = void 0;
        await this.requestRowsRedraw(redraw);
        return true;
    }
    /**
     * Projects a queried table into TreeView row order and visibility.
     *
     * @param table
     * Table after sort/filter and before pagination.
     *
     * The input table is expected to be after sort/filter, but before
     * pagination. If TreeView is disabled, unchanged table is returned.
     */
    projectTable(table) {
        const options = this.options;
        const index = this.indexCache;
        if (!options || !index) {
            this.projectionStateCache = void 0;
            return table;
        }
        const idColumn = this.getDataOptions()?.idColumn;
        const projectionState = this.projectToVisibleState(table, idColumn);
        this.projectionStateCache = projectionState;
        const sourceColumnIds = table.getColumnIds();
        const aggregateColumnIds = this.getAggregateColumnIds(sourceColumnIds);
        const projectedColumnIds = this.getProjectedColumnIds(sourceColumnIds);
        if (!aggregateColumnIds.length &&
            isDeepEqual(projectedColumnIds, sourceColumnIds) &&
            areRowIndexesIdentity(projectionState.rowIndexes, table.getRowCount())) {
            return table;
        }
        return this.createProjectedTable(table, projectionState, aggregateColumnIds, projectedColumnIds, idColumn);
    }
    /**
     * Destroys controller state.
     */
    destroy() {
        this.clearTreeRowMetaState();
        this.expansionStateSeedKey = void 0;
        this.clearCache();
    }
    /**
     * Clears cached index, projection state, and source metadata.
     */
    clearCache() {
        this.indexCache = void 0;
        this.projectionStateCache = void 0;
        this.cacheSource = void 0;
    }
    /**
     * Marks rows as dirty and schedules redraw after projection state updates.
     *
     * @param redraw
     * Whether to redraw rows immediately.
     */
    async requestRowsRedraw(redraw = true) {
        this.grid.querying.shouldBeUpdated = true;
        this.grid.dirtyFlags.add('rows');
        if (redraw) {
            await this.grid.redraw();
        }
    }
    /**
     * Ensures row metadata record exists for a row.
     *
     * @param rowId
     * Row ID.
     *
     * @returns
     * Row metadata record.
     */
    ensureRowMetaRecord(rowId) {
        let rowMeta = this.grid.rowMeta.get(rowId);
        if (!rowMeta) {
            rowMeta = {};
            this.grid.rowMeta.set(rowId, rowMeta);
        }
        return rowMeta;
    }
    /**
     * Removes empty row metadata records.
     *
     * @param rowId
     * Row ID.
     */
    cleanupRowMeta(rowId) {
        const rowMeta = this.grid.rowMeta.get(rowId);
        if (!rowMeta) {
            return;
        }
        if (!Object.keys(rowMeta).length) {
            this.grid.rowMeta.delete(rowId);
        }
    }
    /**
     * Clears TreeView metadata state for all rows.
     */
    clearTreeRowMetaState() {
        for (const [rowId, rowMeta] of this.grid.rowMeta) {
            if (!defined(rowMeta.expanded)) {
                continue;
            }
            delete rowMeta.expanded;
            if (!Object.keys(rowMeta).length) {
                this.grid.rowMeta.delete(rowId);
            }
        }
    }
    /**
     * Sets explicit expanded state for a row.
     *
     * @param rowId
     * Row ID.
     *
     * @param expanded
     * Whether row should be explicitly expanded.
     *
     * @returns
     * `true` when state changed.
     */
    setRowMetaExpanded(rowId, expanded) {
        const rowMeta = this.grid.rowMeta.get(rowId);
        if (!defined(expanded)) {
            if (!defined(rowMeta?.expanded)) {
                return false;
            }
            delete rowMeta.expanded;
            this.cleanupRowMeta(rowId);
            return true;
        }
        if (rowMeta?.expanded === expanded) {
            return false;
        }
        this.ensureRowMetaRecord(rowId).expanded = expanded;
        return true;
    }
    /**
     * Returns data options with TreeView extension for local provider.
     */
    getDataOptions() {
        const dataOptions = this.grid.options?.data;
        if (!isLocalDataOptions(dataOptions)) {
            return;
        }
        return dataOptions;
    }
    /**
     * Builds canonical tree index for currently selected input type.
     *
     * @param table
     * Source table.
     *
     * @param input
     * Normalized input configuration.
     *
     * @param idColumn
     * Column ID containing stable row IDs, when configured.
     *
     * @returns
     * Canonical tree index.
     */
    buildIndexFromInput(table, input, idColumn) {
        if (input.type === 'parentId') {
            return buildParentIdIndexFromColumns(table, input, idColumn);
        }
        if (input.type === 'grouping') {
            return buildGroupingIndexFromColumns(table, input, idColumn);
        }
        return buildPathIndexFromColumns(table, input, idColumn);
    }
    /**
     * Synchronizes expansion state for tree nodes with children.
     *
     * Re-initializes state when expansion seed changes, otherwise prunes
     * entries that are no longer expandable.
     */
    syncExpandedRowIdsState() {
        const options = this.options;
        const index = this.indexCache;
        if (!options || !index) {
            return;
        }
        const seedKey = getExpansionSeedKey(options);
        const explicitExpanded = new Set(options.expandedRowIds);
        const nodeDepths = new Map();
        const isSeedExpanded = (nodeId) => (explicitExpanded.has(nodeId) ||
            this.isExpandedByLevel(nodeId, nodeDepths));
        if (this.expansionStateSeedKey !== seedKey) {
            this.expansionStateSeedKey = seedKey;
            this.clearTreeRowMetaState();
            for (const [nodeId, node] of index.nodes) {
                if (!node.childrenIds.length) {
                    continue;
                }
                if (isSeedExpanded(nodeId)) {
                    this.setRowMetaExpanded(nodeId, true);
                }
            }
            return;
        }
        for (const [rowId, meta] of this.grid.rowMeta) {
            if (!defined(meta.expanded)) {
                continue;
            }
            const node = index.nodes.get(rowId);
            if (!node || !node.childrenIds.length) {
                this.setRowMetaExpanded(rowId, void 0);
            }
        }
        for (const [nodeId, node] of index.nodes) {
            if (!node.childrenIds.length ||
                defined(this.grid.rowMeta.get(nodeId)?.expanded)) {
                continue;
            }
            if (isSeedExpanded(nodeId)) {
                this.setRowMetaExpanded(nodeId, true);
            }
        }
    }
    /**
     * Returns whether a tree node is initially expanded by its depth.
     *
     * @param nodeId
     * Tree node ID.
     *
     * @param nodeDepths
     * Cache of already resolved node depths.
     */
    isExpandedByLevel(nodeId, nodeDepths) {
        const expandedLevels = this.options?.expandedLevels ?? 0;
        if (expandedLevels === 'all') {
            return true;
        }
        if (expandedLevels <= 0) {
            return false;
        }
        return this.getNodeDepth(nodeId, nodeDepths) < expandedLevels;
    }
    /**
     * Resolves the depth of a tree node in the source tree index.
     *
     * @param nodeId
     * Tree node ID.
     *
     * @param nodeDepths
     * Cache of already resolved node depths.
     */
    getNodeDepth(nodeId, nodeDepths) {
        const unresolvedIds = [];
        let currentId = nodeId;
        let depth = -1;
        while (defined(currentId)) {
            const cachedDepth = nodeDepths.get(currentId);
            if (defined(cachedDepth)) {
                depth = cachedDepth;
                break;
            }
            unresolvedIds.push(currentId);
            currentId = this.indexCache?.nodes.get(currentId)?.parentId ?? null;
        }
        // Resolved from the topmost unresolved ancestor down to the node.
        for (let i = unresolvedIds.length - 1; i >= 0; --i) {
            nodeDepths.set(unresolvedIds[i], ++depth);
        }
        return depth;
    }
    /**
     * Computes projected row order and per-row tree metadata for visible rows.
     *
     * @param table
     * Queried table after sort/filter and before pagination.
     *
     * @param idColumn
     * Column containing row IDs, when configured.
     *
     * @returns
     * Projection state describing visible rows in tree order.
     */
    projectToVisibleState(table, idColumn) {
        const index = this.indexCache;
        if (!index) {
            throw new Error('TreeView: Source tree index is not initialized.');
        }
        const idValues = (idColumn ?
            table.columns[idColumn] :
            void 0);
        if (idColumn && !idValues) {
            throw new Error(`TreeView: idColumn "${idColumn}" not found in ` +
                'presentation table.');
        }
        const visibleRowIds = [];
        const visibleSet = new Set();
        const rowIndexById = new Map();
        for (let rowIndex = 0, rowCount = table.getRowCount(); rowIndex < rowCount; ++rowIndex) {
            const rowId = (idValues && idColumn) ?
                normalizeRowIdValue(idValues[rowIndex], idColumn, rowIndex) :
                table.getOriginalRowIndex(rowIndex);
            if (!defined(rowId)) {
                throw new Error('TreeView: Could not resolve original row index for ' +
                    `presentation row ${rowIndex}.`);
            }
            if (!index.nodes.has(rowId)) {
                throw new Error(`TreeView: Row id "${String(rowId)}" is not present in ` +
                    'the source tree index.');
            }
            visibleRowIds.push(rowId);
            visibleSet.add(rowId);
            rowIndexById.set(rowId, rowIndex);
        }
        const rootIds = [];
        const rootIdSet = new Set();
        const childrenByParent = new Map();
        const childSetByParent = new Map();
        const sourceOrderById = new Map();
        const inheritedOrderById = new Map();
        for (let i = 0, iEnd = index.rowOrder.length; i < iEnd; ++i) {
            sourceOrderById.set(index.rowOrder[i], i);
        }
        const addRoot = (nodeId) => {
            if (!rootIdSet.has(nodeId)) {
                rootIdSet.add(nodeId);
                rootIds.push(nodeId);
            }
        };
        const addChild = (parentId, childId) => {
            let childSet = childSetByParent.get(parentId);
            if (!childSet) {
                childSet = new Set();
                childSetByParent.set(parentId, childSet);
            }
            if (childSet.has(childId)) {
                return;
            }
            childSet.add(childId);
            const children = childrenByParent.get(parentId);
            if (children) {
                children.push(childId);
            }
            else {
                childrenByParent.set(parentId, [childId]);
            }
        };
        const setInheritedOrder = (nodeId, order) => {
            if (rowIndexById.has(nodeId)) {
                return;
            }
            const currentOrder = inheritedOrderById.get(nodeId);
            if (typeof currentOrder !== 'number' ||
                order < currentOrder) {
                inheritedOrderById.set(nodeId, order);
            }
        };
        const getNodeOrder = (nodeId) => {
            const rowIndex = rowIndexById.get(nodeId);
            if (typeof rowIndex === 'number') {
                return rowIndex;
            }
            return inheritedOrderById.get(nodeId) ??
                Number.POSITIVE_INFINITY;
        };
        const compareNodeOrder = (a, b) => {
            const aOrder = getNodeOrder(a);
            const bOrder = getNodeOrder(b);
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            const aSourceOrder = sourceOrderById.get(a) ??
                Number.POSITIVE_INFINITY;
            const bSourceOrder = sourceOrderById.get(b) ??
                Number.POSITIVE_INFINITY;
            if (aSourceOrder !== bSourceOrder) {
                return aSourceOrder - bSourceOrder;
            }
            const aId = String(a);
            const bId = String(b);
            return (aId < bId ? -1 :
                aId > bId ? 1 :
                    0);
        };
        const injectedAncestorIds = new Set();
        for (let i = 0, iEnd = visibleRowIds.length; i < iEnd; ++i) {
            let currentId = visibleRowIds[i];
            while (currentId !== null) {
                setInheritedOrder(currentId, i);
                const currentNode = index.nodes.get(currentId);
                if (!currentNode) {
                    break;
                }
                const parentId = currentNode.parentId;
                if (parentId === null) {
                    addRoot(currentId);
                    break;
                }
                const parentNode = index.nodes.get(parentId);
                if (!parentNode) {
                    addRoot(currentId);
                    break;
                }
                if (!visibleSet.has(parentId) &&
                    !parentNode.isGenerated) {
                    visibleSet.add(parentId);
                    injectedAncestorIds.add(parentId);
                }
                addChild(parentId, currentId);
                currentId = parentId;
            }
        }
        rootIds.sort(compareNodeOrder);
        for (const children of childrenByParent.values()) {
            children.sort(compareNodeOrder);
        }
        const rowsById = new Map();
        const buildRowState = (nodeId, depth, parentId) => {
            const children = childrenByParent.get(nodeId);
            const hasChildren = !!(children && children.length);
            const explicitExpanded = this.grid.rowMeta.get(nodeId)?.expanded;
            const isAncestorOnly = injectedAncestorIds.has(nodeId);
            const isExpanded = (hasChildren &&
                (explicitExpanded === true ||
                    (!defined(explicitExpanded) &&
                        isAncestorOnly)));
            const rowState = {
                childrenIds: children ? children.slice() : [],
                id: nodeId,
                parentId,
                depth,
                hasChildren,
                isExpanded
            };
            if (isAncestorOnly) {
                rowState.isAncestorOnly = true;
            }
            rowsById.set(nodeId, rowState);
            if (!children) {
                return;
            }
            for (let i = 0, iEnd = children.length; i < iEnd; ++i) {
                buildRowState(children[i], depth + 1, nodeId);
            }
        };
        for (let i = 0, iEnd = rootIds.length; i < iEnd; ++i) {
            buildRowState(rootIds[i], 0, null);
        }
        this.sortProjectedTreeNodes(table, rootIds, childrenByParent, rowIndexById, rowsById, idColumn);
        const projectedNodeIds = [];
        const visitVisibleNode = (nodeId) => {
            const rowState = rowsById.get(nodeId);
            if (!rowState) {
                return;
            }
            projectedNodeIds.push(nodeId);
            if (!rowState.childrenIds.length || !rowState.isExpanded) {
                return;
            }
            for (let i = 0, iEnd = rowState.childrenIds.length; i < iEnd; ++i) {
                visitVisibleNode(rowState.childrenIds[i]);
            }
        };
        for (let i = 0, iEnd = rootIds.length; i < iEnd; ++i) {
            visitVisibleNode(rootIds[i]);
        }
        const rowStateStack = [];
        let lastVisitedNodeId;
        for (let i = 0, iEnd = projectedNodeIds.length; i < iEnd; ++i) {
            const rowState = rowsById.get(projectedNodeIds[i]);
            if (!rowState) {
                continue;
            }
            while (rowStateStack.length > rowState.depth) {
                const completedState = rowStateStack.pop();
                if (completedState &&
                    typeof lastVisitedNodeId !== 'undefined') {
                    completedState.lastVisibleDescendantId = lastVisitedNodeId;
                }
            }
            rowStateStack.push(rowState);
            lastVisitedNodeId = rowState.id;
        }
        while (rowStateStack.length) {
            const completedState = rowStateStack.pop();
            if (completedState &&
                typeof lastVisitedNodeId !== 'undefined') {
                completedState.lastVisibleDescendantId = lastVisitedNodeId;
            }
        }
        const projectedIndexes = new Array(projectedNodeIds.length);
        for (let i = 0, iEnd = projectedNodeIds.length; i < iEnd; ++i) {
            const rowIndex = rowIndexById.get(projectedNodeIds[i]);
            if (typeof rowIndex === 'number') {
                projectedIndexes[i] = rowIndex;
                continue;
            }
            const nodeId = projectedNodeIds[i];
            const node = index.nodes.get(nodeId);
            if (!node ||
                (!node.isGenerated && !injectedAncestorIds.has(nodeId))) {
                throw new Error('TreeView: Could not resolve row index for id "' +
                    String(nodeId) +
                    '".');
            }
            projectedIndexes[i] = void 0;
        }
        return {
            derivedCellColumnIdsByRowId: new Map(),
            // `rowIds` stores projected tree node IDs, including generated
            // path parents without a backing source row.
            rowIds: projectedNodeIds,
            rowIndexes: projectedIndexes,
            sourceRowIndexesById: rowIndexById,
            rowsById
        };
    }
    /**
     * Applies tree-local sorting when active sort columns depend on
     * aggregation, which becomes available only during TreeView projection.
     *
     * @param table
     * Queried table after filtering/sorting and before pagination.
     *
     * @param rootIds
     * Root ids in the projected logical tree.
     *
     * @param childrenByParent
     * Direct children ids keyed by parent id.
     *
     * @param rowIndexById
     * Source row indexes keyed by row id.
     *
     * @param rowsById
     * Logical projected tree row states.
     *
     * @param idColumn
     * Column containing stable row IDs, when configured.
     */
    sortProjectedTreeNodes(table, rootIds, childrenByParent, rowIndexById, rowsById, idColumn) {
        const activeSortings = resolveActiveGridSortings(this.grid, this.grid.querying.sorting.currentSortings, this.grid.querying.sorting.currentSorting);
        if (!activeSortings.length ||
            !activeSortings.some((sorting) => this.requiresProjectedTreeSort(sorting.sourceColumnId))) {
            return;
        }
        const sortProjectionState = {
            derivedCellColumnIdsByRowId: new Map(),
            rowIds: Array.from(rowsById.keys()),
            rowIndexes: [],
            sourceRowIndexesById: rowIndexById,
            rowsById
        };
        const valueMapByColumnId = new Map();
        for (let i = 0, iEnd = activeSortings.length; i < iEnd; ++i) {
            const sorting = activeSortings[i];
            if (valueMapByColumnId.has(sorting.sourceColumnId)) {
                continue;
            }
            valueMapByColumnId.set(sorting.sourceColumnId, this.aggregationResolver.resolveColumnValues(sorting.sourceColumnId, table, sortProjectionState, new Map(), idColumn));
        }
        const compareSortedNodes = (a, b) => {
            for (let i = 0, iEnd = activeSortings.length; i < iEnd; ++i) {
                const sorting = activeSortings[i];
                const valueMap = valueMapByColumnId.get(sorting.sourceColumnId);
                const result = sorting.compare(valueMap?.get(a), valueMap?.get(b));
                if (result) {
                    return result;
                }
            }
            const aIndex = rowIndexById.get(a);
            const bIndex = rowIndexById.get(b);
            if (typeof aIndex === 'number' &&
                typeof bIndex === 'number' &&
                aIndex !== bIndex) {
                return aIndex - bIndex;
            }
            const aId = String(a);
            const bId = String(b);
            return (aId < bId ? -1 :
                aId > bId ? 1 :
                    0);
        };
        rootIds.sort(compareSortedNodes);
        for (const children of childrenByParent.values()) {
            children.sort(compareSortedNodes);
        }
        for (const [rowId, rowState] of rowsById) {
            const children = childrenByParent.get(rowId);
            rowState.childrenIds = children ? children.slice() : [];
        }
    }
    /**
     * Returns whether sorting the column depends on projected tree values.
     *
     * @param sourceColumnId
     * Source column id.
     */
    requiresProjectedTreeSort(sourceColumnId) {
        return (this.hasColumnAggregation(sourceColumnId) ||
            this.isGroupingDisplayColumn(sourceColumnId));
    }
    /**
     * Resolves output column IDs for the projected table.
     *
     * @param sourceColumnIds
     * Source column IDs from the queried table.
     *
     * @returns
     * Column IDs to include in the projected table.
     */
    getProjectedColumnIds(sourceColumnIds) {
        const input = this.options?.input;
        if (input?.type !== 'grouping') {
            return sourceColumnIds.slice();
        }
        const groupedColumnIds = new Set(input.groupBy);
        const projectedColumnIds = [input.groupColumnId];
        for (let i = 0, iEnd = sourceColumnIds.length; i < iEnd; ++i) {
            const columnId = sourceColumnIds[i];
            if (input.hideGroupByColumns && groupedColumnIds.has(columnId)) {
                continue;
            }
            projectedColumnIds.push(columnId);
        }
        return projectedColumnIds;
    }
    /**
     * Builds a projected table by reordering all columns to projected indexes.
     *
     * @param table
     * Input queried table.
     *
     * @param projectionState
     * Projection state for table rebuild.
     *
     * @param aggregateColumnIds
     * Source column ids that should be aggregated in the projected table.
     *
     * @param projectedColumnIds
     * Column ids included in the projected table.
     *
     * @param idColumn
     * Column containing stable row IDs, when configured.
     *
     * @returns
     * Cloned table with projected column values and row index references.
     */
    createProjectedTable(table, projectionState, aggregateColumnIds, projectedColumnIds, idColumn) {
        const { rowIds, rowIndexes } = projectionState;
        const projectedTable = table.clone(true);
        const projectedColumns = {};
        const aggregateColumnIdSet = new Set(aggregateColumnIds);
        const derivedCellColumnIdsByRowId = new Map();
        for (let i = 0, iEnd = projectedColumnIds.length; i < iEnd; ++i) {
            const columnId = projectedColumnIds[i];
            const sourceColumn = table.columns[columnId];
            const projectedColumn = new Array(rowIndexes.length);
            const aggregateValuesByRowId = aggregateColumnIdSet.has(columnId) ?
                this.aggregationResolver.resolveColumnValues(columnId, table, projectionState, derivedCellColumnIdsByRowId, idColumn) :
                void 0;
            for (let j = 0, jEnd = rowIndexes.length; j < jEnd; ++j) {
                const rowId = rowIds[j];
                if (aggregateValuesByRowId) {
                    projectedColumn[j] = aggregateValuesByRowId.get(rowId);
                    continue;
                }
                const rowIndex = rowIndexes[j];
                projectedColumn[j] = (this.isGroupingDisplayColumn(columnId) ||
                    typeof rowIndex !== 'number') ?
                    this.resolveProjectedCellValue(columnId, rowId, table, projectionState, idColumn) :
                    sourceColumn?.[rowIndex];
            }
            projectedColumns[columnId] = projectedColumn;
        }
        projectionState.derivedCellColumnIdsByRowId =
            derivedCellColumnIdsByRowId;
        projectedTable.setColumns(projectedColumns);
        const originalRowIndexes = new Array(rowIndexes.length);
        for (let i = 0, iEnd = rowIndexes.length; i < iEnd; ++i) {
            const rowIndex = rowIndexes[i];
            if (typeof rowIndex === 'number') {
                originalRowIndexes[i] = table.getOriginalRowIndex(rowIndex);
            }
            else if (projectionState.rowsById.get(rowIds[i])?.isAncestorOnly) {
                const node = this.indexCache?.nodes.get(rowIds[i]);
                originalRowIndexes[i] = (typeof node?.rowIndex === 'number' ?
                    this.cacheSource?.table.getOriginalRowIndex(node.rowIndex) :
                    void 0);
            }
            else {
                originalRowIndexes[i] = void 0;
            }
        }
        projectedTable.setOriginalRowIndexes(originalRowIndexes);
        return projectedTable;
    }
    /**
     * Returns source column ids configured for TreeView aggregation.
     *
     * @param columnIds
     * Source column ids available in the queried table.
     */
    getAggregateColumnIds(columnIds) {
        const aggregateColumnIds = [];
        for (let i = 0, iEnd = columnIds.length; i < iEnd; ++i) {
            const columnId = columnIds[i];
            if (this.hasColumnAggregation(columnId)) {
                aggregateColumnIds.push(columnId);
            }
        }
        return aggregateColumnIds;
    }
    /**
     * Resolves a cell value for the projected logical tree before aggregation.
     *
     * @param columnId
     * Source column id.
     *
     * @param rowId
     * Row id in the projected logical tree.
     *
     * @param table
     * Queried table after filtering/sorting and before pagination.
     *
     * @param projectionState
     * Current projected tree state.
     *
     * @param idColumn
     * Column containing stable row IDs, when configured.
     */
    resolveProjectedCellValue(columnId, rowId, table, projectionState, idColumn) {
        if (this.isGroupingDisplayColumn(columnId)) {
            return this.getGeneratedCellValue(columnId, rowId, idColumn);
        }
        const rowIndex = projectionState.sourceRowIndexesById.get(rowId);
        if (typeof rowIndex === 'number') {
            return table.columns[columnId]?.[rowIndex];
        }
        if (projectionState.rowsById.get(rowId)?.isAncestorOnly) {
            return this.getSourceTableCellValue(columnId, rowId);
        }
        return this.getGeneratedCellValue(columnId, rowId, idColumn);
    }
    /**
     * Resolves aggregator option for a source column id.
     *
     * @param sourceColumnId
     * Source column id.
     */
    getColumnAggregatorOption(sourceColumnId) {
        if (this.isTreeSpecialColumn(sourceColumnId)) {
            return;
        }
        const columnPolicy = this.grid.columnPolicy;
        const directAggregator = getColumnOptionsAggregator(columnPolicy.getIndividualColumnOptions(sourceColumnId));
        if (defined(directAggregator)) {
            return directAggregator;
        }
        const configuredColumnIds = columnPolicy.getColumnIds();
        for (let i = 0, iEnd = configuredColumnIds.length; i < iEnd; ++i) {
            const configuredColumnId = configuredColumnIds[i];
            if (columnPolicy.getColumnSourceId(configuredColumnId) !==
                sourceColumnId) {
                continue;
            }
            const mappedAggregator = getColumnOptionsAggregator(columnPolicy.getIndividualColumnOptions(configuredColumnId));
            if (defined(mappedAggregator)) {
                return mappedAggregator;
            }
        }
        return getColumnOptionsAggregator(this.grid.options?.columnDefaults);
    }
    /**
     * Returns whether a source column is the generated grouping display column.
     *
     * @param sourceColumnId
     * Source column id.
     */
    isGroupingDisplayColumn(sourceColumnId) {
        const input = this.options?.input;
        return (input?.type === 'grouping' &&
            sourceColumnId === input.groupColumnId);
    }
    /**
     * Returns whether a source column is reserved for TreeView structure.
     *
     * @param sourceColumnId
     * Source column id.
     */
    isTreeSpecialColumn(sourceColumnId) {
        const idColumn = this.getDataOptions()?.idColumn;
        if (sourceColumnId === idColumn) {
            return true;
        }
        const input = this.options?.input;
        if (!input) {
            return false;
        }
        if (input.type === 'path' &&
            sourceColumnId === input.pathColumn) {
            return true;
        }
        if (input.type === 'grouping') {
            return (sourceColumnId === input.groupColumnId ||
                input.groupBy.indexOf(sourceColumnId) !== -1);
        }
        return (input.type === 'parentId' &&
            sourceColumnId === input.parentIdColumn);
    }
    /**
     * Resolves column value for an auto-generated tree path row.
     *
     * @param columnId
     * Target column ID.
     *
     * @param rowId
     * Generated row ID.
     *
     * @param idColumn
     * Column containing stable row IDs, when configured.
     *
     * @returns
     * Cell value for generated row, or `null` for unsupported columns.
     */
    getGeneratedCellValue(columnId, rowId, idColumn) {
        const index = this.indexCache;
        const input = this.options?.input;
        if (!index || !input) {
            return null;
        }
        const node = index.nodes.get(rowId);
        if (!node || !node.isGenerated) {
            return null;
        }
        if (idColumn && columnId === idColumn) {
            return node.id;
        }
        if (input.type === 'path' &&
            columnId === input.pathColumn &&
            node.path) {
            return node.path;
        }
        const groupValues = node.groupValues;
        if (input.type === 'grouping' && groupValues) {
            if (columnId === input.groupColumnId) {
                return groupValues[groupValues.length - 1];
            }
            // Repeat the group values of the row level and its ancestor levels
            // when grouped columns are rendered.
            const levelIndex = input.groupBy.indexOf(columnId);
            if (levelIndex !== -1 && levelIndex < groupValues.length) {
                return groupValues[levelIndex];
            }
        }
        return null;
    }
    /**
     * Resolves cell value for an injected ancestor row from the source table.
     *
     * @param columnId
     * Target column ID.
     *
     * @param rowId
     * Ancestor row ID.
     *
     * @returns
     * Cell value from the source table, or `null` when unavailable.
     */
    getSourceTableCellValue(columnId, rowId) {
        const index = this.indexCache;
        const sourceTable = this.cacheSource?.table?.getModified();
        if (!index || !sourceTable) {
            return null;
        }
        const node = index.nodes.get(rowId);
        if (!node || node.rowIndex === null) {
            return null;
        }
        return sourceTable.getCell(columnId, node.rowIndex);
    }
}
/* *
 *
 *  Default export
 *
 * */
export default TreeProjectionController;

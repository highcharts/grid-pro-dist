/* *
 *
 *  Grid Column Policy Resolver class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a column policy resolver.
 */
class ColumnPolicyResolver {
    constructor() {
        /* *
         *
         *  Properties
         *
         * */
        /**
         * Individual column options map keyed by Grid column id.
         */
        this.columnOptionsMap = {};
        /**
         * Source column id map keyed by Grid column id.
         */
        this.sourceColumnIdMap = {};
        /**
         * Column defaults merged into all capability checks.
         */
        this.columnDefaults = {};
    }
    /* *
    *
    *  Methods
    *
    * */
    /**
     * Sets the current column options map and rebuilds source id mappings.
     *
     * @param columnOptionsMap
     * Column options keyed by Grid column id.
     */
    setColumnOptionsMap(columnOptionsMap) {
        this.columnOptionsMap = columnOptionsMap;
        this.rebuildSourceColumnIdMap();
    }
    /**
     * Removes all column options from the resolver.
     */
    clearColumnOptions() {
        this.columnOptionsMap = {};
        this.sourceColumnIdMap = {};
    }
    /**
     * Returns whether options for the given column id exist.
     *
     * @param columnId
     * Grid column id.
     */
    hasColumnOptions(columnId) {
        return !!this.columnOptionsMap[columnId];
    }
    /**
     * Returns column ids for all configured column options.
     */
    getColumnIds() {
        return Object.keys(this.columnOptionsMap);
    }
    /**
     * Returns raw options for a Grid column.
     *
     * @param columnId
     * Grid column id.
     */
    getIndividualColumnOptions(columnId) {
        return this.columnOptionsMap[columnId]?.options;
    }
    /**
     * Returns the index of a Grid column in `options.columns`.
     *
     * @param columnId
     * Grid column id.
     */
    getColumnOptionIndex(columnId) {
        return this.columnOptionsMap[columnId]?.index;
    }
    /**
     * Adds or replaces a single column option entry.
     *
     * @param columnId
     * Grid column id.
     *
     * @param columnOption
     * Column map item to store.
     */
    setColumnOption(columnId, columnOption) {
        this.columnOptionsMap[columnId] = columnOption;
        this.sourceColumnIdMap[columnId] = this.resolveSourceColumnId(columnId);
    }
    /**
     * Removes a single column option entry.
     *
     * @param columnId
     * Grid column id.
     */
    removeColumnOption(columnId) {
        delete this.columnOptionsMap[columnId];
        delete this.sourceColumnIdMap[columnId];
    }
    /**
     * Sets column defaults used for capability checks.
     *
     * @param columnDefaults
     * Grid column defaults.
     */
    setColumnDefaults(columnDefaults) {
        this.columnDefaults = columnDefaults || {};
    }
    /**
     * Sets available source column ids from the current data provider.
     *
     * @param columnIds
     * List of source column ids. If omitted, the cache is cleared.
     */
    setAvailableSourceColumnIds(columnIds) {
        this.availableSourceColumnIds = columnIds ?
            new Set(columnIds) :
            void 0;
    }
    /**
     * Returns cached source column ids from the data provider.
     */
    getAvailableSourceColumnIds() {
        return this.availableSourceColumnIds ?
            Array.from(this.availableSourceColumnIds) :
            void 0;
    }
    /**
     * Resolves source column id for a Grid column id.
     *
     * @param columnId
     * Grid column id.
     */
    getColumnSourceId(columnId) {
        if (columnId in this.sourceColumnIdMap) {
            return this.sourceColumnIdMap[columnId];
        }
        return columnId;
    }
    /**
     * Returns whether the column is unbound to provider data.
     *
     * @param columnId
     * Grid column id.
     */
    isColumnUnbound(columnId) {
        const sourceColumnId = this.getColumnSourceId(columnId);
        if (!sourceColumnId) {
            return true;
        }
        if (!this.availableSourceColumnIds) {
            return false;
        }
        return !this.availableSourceColumnIds.has(sourceColumnId);
    }
    /**
     * Returns whether the column should be included in exports.
     *
     * @param columnId
     * Grid column id.
     */
    isColumnExportable(columnId) {
        const exportable = this.getIndividualColumnOptions(columnId)?.exportable ??
            this.columnDefaults.exportable;
        return !this.isColumnUnbound(columnId) &&
            exportable !== false;
    }
    /**
     * Returns whether sorting should be enabled for the column.
     *
     * @param columnId
     * Grid column id.
     */
    isColumnSortingEnabled(columnId) {
        const sortingOptions = this.getIndividualColumnOptions(columnId)?.sorting;
        const defaultSortingOptions = this.columnDefaults.sorting;
        const sortingEnabled = (sortingOptions?.enabled ??
            defaultSortingOptions?.enabled);
        return !this.isColumnUnbound(columnId) &&
            !!sortingEnabled;
    }
    /**
     * Returns whether filtering should be enabled for the column.
     *
     * @param columnId
     * Grid column id.
     */
    isColumnFilteringEnabled(columnId) {
        const filteringEnabled = (this.getIndividualColumnOptions(columnId)?.filtering?.enabled ??
            this.columnDefaults.filtering?.enabled);
        return !this.isColumnUnbound(columnId) &&
            !!filteringEnabled;
    }
    /**
     * Returns whether inline filtering should be enabled for the column.
     *
     * @param columnId
     * Grid column id.
     */
    isColumnInlineFilteringEnabled(columnId) {
        const inlineFilteringEnabled = (this.getIndividualColumnOptions(columnId)?.filtering?.inline ??
            this.columnDefaults.filtering?.inline);
        return this.isColumnFilteringEnabled(columnId) &&
            !!inlineFilteringEnabled;
    }
    /**
     * Returns whether editing should be enabled for the column.
     *
     * @param columnId
     * Grid column id.
     */
    isColumnEditable(columnId) {
        const editable = (this.getIndividualColumnOptions(columnId)
            ?.cells?.editMode?.enabled ??
            this.columnDefaults.cells?.editMode?.enabled);
        return !this.isColumnUnbound(columnId) &&
            !!editable;
    }
    /**
     * Resolves ordered column ids that should be rendered.
     *
     * @param headerColumns
     * Column ids resolved from header.
     *
     * @param autogenerateColumns
     * Whether columns should be autogenerated from the provider.
     *
     * @param autoColumns
     * Available column ids from the data provider.
     *
     * @param configuredColumns
     * Column ids from `options.columns`.
     */
    getColumnsForRender(headerColumns, autogenerateColumns, autoColumns, configuredColumns) {
        const columnsIncluded = (headerColumns.length > 0 ?
            headerColumns :
            autogenerateColumns ?
                ColumnPolicyResolver.getColumnsForAutogeneration(autoColumns, configuredColumns) : configuredColumns);
        if (!columnsIncluded?.length) {
            return [];
        }
        return this.filterEnabledColumns(columnsIncluded);
    }
    /**
     * Returns column ids for autogeneration mode:
     * `autoColumns` followed by configured-only columns.
     *
     * Relative order from `configuredColumns` is preserved.
     *
     * @param autoColumns
     * Column ids from the data provider.
     *
     * @param configuredColumns
     * Column ids from `options.columns`.
     */
    static getColumnsForAutogeneration(autoColumns, configuredColumns) {
        const autoColumnIds = new Set(autoColumns);
        const customConfiguredColumns = (configuredColumns || []).filter((columnId) => !autoColumnIds.has(columnId));
        return autoColumns.concat(customConfiguredColumns);
    }
    /**
     * Filters out duplicate and disabled columns while preserving order.
     *
     * @param columnIds
     * Candidate column ids.
     */
    filterEnabledColumns(columnIds) {
        const seen = new Set();
        const result = [];
        for (const columnId of columnIds) {
            const columnEnabled = this.columnOptionsMap?.[columnId]?.options?.enabled;
            if (seen.has(columnId) ||
                columnEnabled === false) {
                continue;
            }
            seen.add(columnId);
            result.push(columnId);
        }
        return result;
    }
    /**
     * Rebuilds source column id cache from current column options.
     */
    rebuildSourceColumnIdMap() {
        const sourceColumnIdMap = {};
        const columnIds = Object.keys(this.columnOptionsMap);
        for (let i = 0, iEnd = columnIds.length; i < iEnd; ++i) {
            const columnId = columnIds[i];
            sourceColumnIdMap[columnId] = this.resolveSourceColumnId(columnId);
        }
        this.sourceColumnIdMap = sourceColumnIdMap;
    }
    /**
     * Resolves source column id based on map item options.
     *
     * @param columnId
     * Grid column id.
     *
     */
    resolveSourceColumnId(columnId) {
        const dataId = this.columnOptionsMap[columnId]?.options?.dataId;
        return dataId === null ?
            void 0 :
            (typeof dataId === 'string' ? dataId : columnId);
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default ColumnPolicyResolver;

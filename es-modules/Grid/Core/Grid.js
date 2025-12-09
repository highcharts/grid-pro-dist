/* *
 *
 *  Highcharts Grid class
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *  - Sebastian Bochan
 *
 * */
'use strict';
import Accessibility from './Accessibility/Accessibility.js';
import AST from '../../Core/Renderer/HTML/AST.js';
import { defaultOptions } from './Defaults.js';
import GridUtils from './GridUtils.js';
import DataTable from '../../Data/DataTable.js';
import Table from './Table/Table.js';
import U from '../../Core/Utilities.js';
import QueryingController from './Querying/QueryingController.js';
import Globals from './Globals.js';
import TimeBase from '../../Shared/TimeBase.js';
import Pagination from './Pagination/Pagination.js';
const { makeHTMLElement, setHTMLContent } = GridUtils;
const { defined, diffObjects, extend, fireEvent, getStyle, merge, pick } = U;
/* *
 *
 *  Class
 *
 * */
/**
 * A base class for the Grid.
 */
export class Grid {
    // Implementation
    static grid(renderTo, options, async) {
        if (async) {
            return new Promise((resolve) => {
                void new Grid(renderTo, options, (grid) => {
                    resolve(grid);
                });
            });
        }
        return new Grid(renderTo, options);
    }
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Constructs a new Grid.
     *
     * @param renderTo
     * The render target (container) of the Grid.
     *
     * @param options
     * The options of the Grid.
     *
     * @param afterLoadCallback
     * The callback that is called after the Grid is loaded.
     */
    constructor(renderTo, options, afterLoadCallback) {
        /**
         * The user options declared for the columns as an object of column ID to
         * column options.
         * @internal
         */
        this.columnOptionsMap = {};
        /**
         * The options that were declared by the user when creating the Grid
         * or when updating it.
         */
        this.userOptions = {};
        /**
         * The initial height of the container. Can be 0 also if not set.
         * @internal
         */
        this.initialContainerHeight = 0;
        /**
         * The list of currently shown popups.
         */
        this.popups = new Set();
        /**
         * Functions that unregister events attached to the grid's data table,
         * that need to be removed when the grid is destroyed.
         */
        this.dataTableEventDestructors = [];
        /**
         * Whether the Grid is rendered.
         */
        this.isRendered = false;
        /**
         * The flags that indicate which parts of the Grid are dirty and need to be
         * re-rendered.
         * @internal
         */
        this.dirtyFlags = new Set();
        this.renderTo = renderTo;
        this.loadUserOptions(options);
        this.id = this.options?.id || U.uniqueKey();
        this.querying = new QueryingController(this);
        this.locale = this.options?.lang?.locale || (this.container?.closest('[lang]')?.lang);
        this.time = new TimeBase(extend(this.options?.time, { locale: this.locale }), this.options?.lang);
        fireEvent(this, 'beforeLoad');
        Grid.grids.push(this);
        void this.render().then(() => {
            afterLoadCallback?.(this);
            fireEvent(this, 'afterLoad');
        });
    }
    /* *
     *
     *  Methods
     *
     * */
    /*
     * Initializes the accessibility controller.
     */
    initAccessibility() {
        this.accessibility?.destroy();
        delete this.accessibility;
        if (this.options?.accessibility?.enabled) {
            this.accessibility = new Accessibility(this);
        }
    }
    /*
     * Initializes the pagination.
     */
    initPagination() {
        this.pagination?.destroy();
        delete this.pagination;
        if (this.options?.pagination?.enabled) {
            this.pagination = new Pagination(this);
        }
    }
    /**
     * Initializes the container of the Grid.
     *
     * @param renderTo
     * The render target (html element or id) of the Grid.
     *
     */
    initContainer(renderTo) {
        const container = (typeof renderTo === 'string') ?
            Globals.win.document.getElementById(renderTo) : renderTo;
        // Display an error if the renderTo is wrong
        if (!container) {
            throw new Error('Rendering div not found. It is unable to find the HTML ' +
                'element to render the Grid in.');
        }
        this.initialContainerHeight = getStyle(container, 'height', true) || 0;
        this.container = container;
        this.container.innerHTML = AST.emptyHTML;
        this.contentWrapper = makeHTMLElement('div', {
            className: Globals.getClassName('container')
        }, this.container);
    }
    /**
     * Loads the new user options to all the important fields (`userOptions`,
     * `options` and `columnOptionsMap`).
     *
     * @param newOptions
     * The options that were declared by the user.
     *
     * @param oneToOne
     * When `false` (default), the existing column options will be merged with
     * the ones that are currently defined in the user options. When `true`,
     * the columns not defined in the new options will be removed.
     *
     * @returns
     * An object of the changed options.
     */
    loadUserOptions(newOptions, oneToOne = false) {
        // Operate on a copy of the options argument
        newOptions = merge(newOptions);
        const diff = {};
        if (newOptions.columns) {
            if (oneToOne) {
                diff.columns = this.setColumnOptionsOneToOne(newOptions.columns);
            }
            else {
                diff.columns = this.setColumnOptions(newOptions.columns);
            }
            delete newOptions.columns;
        }
        if (diff.columns && Object.keys(diff.columns).length < 1) {
            // Remove the columns property if it is empty object
            delete diff.columns;
        }
        merge(true, diff, diffObjects(newOptions, this.userOptions));
        this.userOptions = merge(this.userOptions, newOptions);
        this.options = merge(this.options ?? defaultOptions, this.userOptions);
        return diff;
    }
    /**
     * Cleans up and reloads the column options from the `userOptions.columns`.
     * Generates the internal column options map from the options.columns array.
     */
    reloadColumnOptions() {
        const colOptions = this.userOptions.columns;
        if (!colOptions) {
            this.columnOptionsMap = {};
            return;
        }
        if (colOptions.length < 1) {
            delete this.userOptions.columns;
            this.columnOptionsMap = {};
            return;
        }
        const columnOptionsMap = {};
        for (let i = 0, iEnd = colOptions.length; i < iEnd; ++i) {
            columnOptionsMap[colOptions[i].id] = {
                index: i,
                options: colOptions[i]
            };
        }
        this.columnOptionsMap = columnOptionsMap;
    }
    /**
     * Sets the new column options to the userOptions field.
     *
     * @param newColumnOptions
     * The new column options that should be loaded.
     *
     * @param overwrite
     * Whether to overwrite the existing column options with the new ones.
     * Default is `false`.
     *
     * @returns
     * An object of the changed column options in form of a record of
     * `[column.id]: column.options`.
     *
     * @internal
     */
    setColumnOptions(newColumnOptions, overwrite = false) {
        const columnDiffOptions = {};
        if (!this.userOptions.columns) {
            this.userOptions.columns = this.options?.columns ?? [];
        }
        const columnOptions = this.userOptions.columns;
        for (let i = 0, iEnd = newColumnOptions.length; i < iEnd; ++i) {
            const newOptions = newColumnOptions[i];
            const colOptionsIndex = this.columnOptionsMap?.[newOptions.id]?.index ?? -1;
            // If the new column options contain only the id.
            if (Object.keys(newOptions).length < 2) {
                if (overwrite && colOptionsIndex !== -1) {
                    columnDiffOptions[newOptions.id] = diffObjects(columnOptions[colOptionsIndex], { id: newOptions.id }, true);
                    columnOptions.splice(colOptionsIndex, 1);
                }
                continue;
            }
            let diff;
            if (colOptionsIndex === -1) {
                diff = merge(newOptions);
                columnOptions.push(newOptions);
            }
            else if (overwrite) {
                const prevOptions = columnOptions[colOptionsIndex];
                diff = merge(diffObjects(prevOptions, newOptions, true), diffObjects(newOptions, prevOptions));
                columnOptions[colOptionsIndex] = newOptions;
            }
            else {
                const prevOptions = columnOptions[colOptionsIndex];
                diff = diffObjects(newOptions, prevOptions);
                merge(true, prevOptions, newOptions);
            }
            delete diff.id;
            if (Object.keys(diff).length > 0) {
                columnDiffOptions[newOptions.id] = diff;
            }
        }
        this.reloadColumnOptions();
        return columnDiffOptions;
    }
    /**
     * Loads the new column options to the userOptions field in a one-to-one
     * manner. It means that all the columns that are not defined in the new
     * options will be removed.
     *
     * @param newColumnOptions
     * The new column options that should be loaded.
     *
     * @returns
     * The difference between the previous and the new column options in form
     * of a record of `[column.id]: column.options`.
     */
    setColumnOptionsOneToOne(newColumnOptions) {
        const prevColumnOptions = this.userOptions.columns;
        const columnOptions = [];
        const columnDiffOptions = {};
        let prevOptions;
        for (let i = 0, iEnd = newColumnOptions.length; i < iEnd; ++i) {
            const newOptions = newColumnOptions[i];
            const indexInPrevOptions = prevColumnOptions?.findIndex((prev) => prev.id === newOptions.id);
            if (indexInPrevOptions !== void 0 && indexInPrevOptions !== -1) {
                prevOptions = prevColumnOptions?.[indexInPrevOptions];
            }
            const diffOptions = diffObjects(newOptions, prevOptions ?? {});
            if (Object.keys(diffOptions).length > 0) {
                delete diffOptions.id;
                columnDiffOptions[newOptions.id] = diffOptions;
            }
            const resultOptions = merge(prevOptions ?? {}, newOptions);
            if (Object.keys(resultOptions).length > 1) {
                columnOptions.push(resultOptions);
            }
        }
        this.userOptions.columns = columnOptions;
        this.reloadColumnOptions();
        return columnDiffOptions;
    }
    /**
     * Updates the Grid with new options.
     *
     * @param options
     * The options of the Grid that should be updated. If not provided,
     * the update will be proceeded based on the `this.userOptions` property.
     * The `column` options are merged using the `id` property as a key.
     *
     * @param redraw
     * Whether to redraw the Grid after updating the options.
     *
     * @param oneToOne
     * When `false` (default), the existing column options will be merged with
     * the ones that are currently defined in the user options. When `true`,
     * the columns not defined in the new options will be removed.
     */
    async update(options = {}, redraw = true, oneToOne = false) {
        fireEvent(this, 'beforeUpdate', {
            scope: 'grid',
            options,
            redraw,
            oneToOne
        });
        const { viewport } = this;
        const diff = this.loadUserOptions(options, oneToOne);
        const flags = this.dirtyFlags;
        if (viewport) {
            if (!this.dataTable || 'dataTable' in diff) {
                this.userOptions.dataTable = options.dataTable;
                (this.options ?? {}).dataTable = options.dataTable;
                this.loadDataTable();
                // TODO: Sometimes it can be too much, so we need to check if
                // the columns have changed or just their data. If just their
                // data, we can just mark the grid.table as dirty instead of the
                // whole grid.
                flags.add('grid');
            }
            if ('columns' in diff) {
                const ids = Object.keys(diff.columns ?? {});
                for (const id of ids) {
                    // TODO: Move this to the column update method.
                    this.loadColumnOptionDiffs(viewport, id, diff.columns?.[id]);
                    delete diff.columns?.[id];
                }
                delete diff.columns;
            }
            if ('columnDefaults' in diff) {
                this.loadColumnOptionDiffs(viewport, null, diff.columnDefaults);
                delete diff.columnDefaults;
            }
            if (diff.lang) {
                const langDiff = diff.lang;
                if ('locale' in langDiff) {
                    this.locale = langDiff.locale;
                    this.time.update({ locale: this.locale });
                }
                delete langDiff.locale;
                // TODO: Add more lang diff checks here.
                if (Object.keys(langDiff).length > 0) {
                    flags.add('grid');
                }
            }
            delete diff.lang;
            if ('time' in diff) {
                this.time.update(diff.time);
                delete diff.time;
            }
            if (diff.pagination) {
                const paginationDiff = diff.pagination;
                if ('enabled' in paginationDiff) {
                    if (!this.pagination && paginationDiff.enabled) {
                        this.pagination = new Pagination(this);
                    }
                }
                this.pagination?.update(paginationDiff);
            }
            delete diff.pagination;
            // TODO: Add more options that can be optimized here.
            if (Object.keys(diff).length > 0) {
                flags.add('grid');
            }
        }
        else {
            flags.add('grid');
        }
        if (redraw) {
            await this.redraw();
        }
        fireEvent(this, 'afterUpdate', {
            scope: 'grid',
            options,
            redraw,
            oneToOne
        });
    }
    /**
     * Loads the column option diffs by updating the dirty flags.
     *
     * @param vp
     * The viewport that the column option diffs should be loaded for.
     *
     * @param columnId
     * The ID of the column that should be updated.
     *
     * @param columnDiff
     * The difference between the previous and the new column options in form
     * of a record of `[column.id]: column.options`. If `null`, assume that
     * it refers to the column defaults.
     */
    loadColumnOptionDiffs(vp, columnId, columnDiff = {}) {
        if (Object.keys(columnDiff).length < 1) {
            return;
        }
        const flags = this.dirtyFlags;
        const column = columnId ? this.viewport?.getColumn(columnId) : null;
        if (column !== null && ( // Column null = column defaults
        (!column && columnDiff.enabled !== false) ||
            (column && columnDiff.enabled === false))) {
            flags.add('grid');
        }
        delete columnDiff.enabled;
        if ('cells' in columnDiff) {
            const cellsDiff = columnDiff.cells ?? {};
            if ('format' in cellsDiff ||
                'formatter' in cellsDiff ||
                'className' in cellsDiff // TODO: check if this too
            ) {
                // Optimization idea: list of columns to update
                flags.add('rows');
            }
            delete cellsDiff.format;
            delete cellsDiff.formatter;
            delete cellsDiff.className;
            if (Object.keys(cellsDiff).length > 0) {
                flags.add('rows');
            }
        }
        delete columnDiff.cells;
        if ('width' in columnDiff) {
            vp.columnResizing.isDirty = true;
        }
        delete columnDiff.width;
        if ('sorting' in columnDiff) {
            const sortingDiff = columnDiff.sorting ?? {};
            if ('compare' in sortingDiff ||
                'order' in sortingDiff) {
                flags.add('sorting');
            }
            delete sortingDiff.compare;
            delete sortingDiff.order;
            // Idea: sortable - redraw only header cell
            if (Object.keys(sortingDiff).length > 0) {
                flags.add('grid');
            }
        }
        delete columnDiff.sorting;
        if ('filtering' in columnDiff) {
            const filteringDiff = columnDiff.filtering ?? {};
            if ('condition' in filteringDiff ||
                'value' in filteringDiff) {
                flags.add('filtering');
            }
            delete filteringDiff.condition;
            delete filteringDiff.value;
            if (Object.keys(filteringDiff).length > 0) {
                flags.add('grid');
            }
        }
        delete columnDiff.filtering;
        if (Object.keys(columnDiff).length > 0) {
            flags.add('grid');
        }
    }
    /**
     * Redraws the Grid in more optimized way than the regular render method.
     * It checks what parts of the Grid are marked as dirty and redraws only
     * them minimizing the number of DOM operations.
     */
    async redraw() {
        fireEvent(this, 'beforeRedraw');
        const flags = this.dirtyFlags;
        if (flags.has('grid')) {
            return await this.render();
        }
        const { viewport: vp, pagination } = this;
        const colResizing = vp?.columnResizing;
        if (flags.has('sorting') ||
            flags.has('filtering') ||
            pagination?.isDirtyQuerying) {
            this.querying.loadOptions();
        }
        if (colResizing?.isDirty) {
            colResizing.loadColumns();
        }
        if (flags.has('rows') ||
            flags.has('sorting') ||
            flags.has('filtering') ||
            pagination?.isDirtyQuerying) {
            await vp?.updateRows();
        }
        else if (flags.has('reflow') ||
            colResizing?.isDirty) {
            vp?.reflow();
        }
        const columns = vp?.columns ?? [];
        if (flags.has('sorting') ||
            flags.has('filtering')) {
            for (const column of columns) {
                column.header?.toolbar?.refreshState();
            }
        }
        if (flags.has('filtering')) {
            for (const column of columns) {
                column.filtering?.refreshState();
            }
        }
        if (pagination?.isDirtyQuerying) {
            pagination.updateControls(true);
        }
        delete pagination?.isDirtyQuerying;
        delete colResizing?.isDirty;
        flags.clear();
        fireEvent(this, 'afterRedraw');
    }
    /**
     * Updates the column of the Grid with new options.
     *
     * @param columnId
     * The ID of the column that should be updated.
     *
     * @param options
     * The options of the columns that should be updated. If null,
     * column options for this column ID will be removed.
     *
     * @param redraw
     * Whether to redraw the Grid after updating the columns.
     *
     * @param overwrite
     * If true, the column options will be updated by replacing the existing
     * options with the new ones instead of merging them.
     */
    async updateColumn(columnId, options, redraw = true, overwrite = false) {
        fireEvent(this, 'beforeUpdate', {
            scope: 'column',
            options,
            redraw,
            overwrite,
            columnId
        });
        const vp = this.viewport;
        const diffs = this.setColumnOptions([{
                id: columnId,
                ...options
            }], overwrite);
        const diff = diffs?.[columnId];
        if (diff && vp) {
            this.loadColumnOptionDiffs(vp, columnId, diff);
        }
        if (redraw) {
            await this.redraw();
        }
        fireEvent(this, 'afterUpdate', {
            scope: 'column',
            options,
            redraw,
            overwrite,
            columnId
        });
    }
    async render() {
        if (this.isRendered) {
            this.destroy(true);
        }
        this.loadDataTable();
        this.initContainer(this.renderTo);
        this.initAccessibility();
        this.initPagination();
        this.querying.loadOptions();
        await this.querying.proceed();
        this.renderViewport();
        this.isRendered = true;
        this.dirtyFlags.clear();
    }
    /**
     * Hovers the row with the provided index. It removes the hover effect from
     * the previously hovered row.
     *
     * @param rowIndex
     * The index of the row.
     */
    hoverRow(rowIndex) {
        const rows = this.viewport?.rows;
        if (!rows) {
            return;
        }
        const firstRowIndex = this.viewport?.rows[0]?.index ?? 0;
        if (this.hoveredRowIndex !== void 0) {
            rows[this.hoveredRowIndex - firstRowIndex]?.setHoveredState(false);
        }
        if (rowIndex !== void 0) {
            rows[rowIndex - firstRowIndex]?.setHoveredState(true);
        }
        this.hoveredRowIndex = rowIndex;
    }
    /**
     * Hovers the column with the provided ID. It removes the hover effect from
     * the previously hovered column.
     *
     * @param columnId
     * The ID of the column.
     */
    hoverColumn(columnId) {
        const vp = this.viewport;
        if (!vp) {
            return;
        }
        if (this.hoveredColumnId) {
            vp.getColumn(this.hoveredColumnId)?.setHoveredState(false);
        }
        if (columnId) {
            vp.getColumn(columnId)?.setHoveredState(true);
        }
        this.hoveredColumnId = columnId;
    }
    /**
     * Sets the sync state to the row with the provided index. It removes the
     * synced effect from the previously synced row.
     *
     * @param rowIndex
     * The index of the row.
     */
    syncRow(rowIndex) {
        const rows = this.viewport?.rows;
        if (!rows) {
            return;
        }
        const firstRowIndex = this.viewport?.rows[0]?.index ?? 0;
        if (this.syncedRowIndex !== void 0) {
            rows[this.syncedRowIndex - firstRowIndex]?.setSyncedState(false);
        }
        if (rowIndex !== void 0) {
            rows[rowIndex - firstRowIndex]?.setSyncedState(true);
        }
        this.syncedRowIndex = rowIndex;
    }
    /**
     * Sets the sync state to the column with the provided ID. It removes the
     * synced effect from the previously synced column.
     *
     * @param columnId
     * The ID of the column.
     */
    syncColumn(columnId) {
        const vp = this.viewport;
        if (!vp) {
            return;
        }
        if (this.syncedColumnId) {
            vp.getColumn(this.syncedColumnId)?.setSyncedState(false);
        }
        if (columnId) {
            vp.getColumn(columnId)?.setSyncedState(true);
        }
        this.syncedColumnId = columnId;
    }
    /**
     * Render caption above the grid.
     * @internal
     */
    renderCaption() {
        const captionOptions = this.options?.caption;
        const captionText = captionOptions?.text;
        if (!captionText) {
            return;
        }
        // Create a caption element.
        this.captionElement = makeHTMLElement('div', {
            className: Globals.getClassName('captionElement'),
            id: this.id + '-caption'
        }, this.contentWrapper);
        // Render the caption element content.
        setHTMLContent(this.captionElement, captionText);
        if (captionOptions.className) {
            this.captionElement.classList.add(...captionOptions.className.split(/\s+/g));
        }
    }
    /**
     * Render description under the grid.
     *
     * @internal
     */
    renderDescription() {
        const descriptionOptions = this.options?.description;
        const descriptionText = descriptionOptions?.text;
        if (!descriptionText) {
            return;
        }
        // Create a description element.
        this.descriptionElement = makeHTMLElement('div', {
            className: Globals.getClassName('descriptionElement'),
            id: this.id + '-description'
        }, this.contentWrapper);
        // Render the description element content.
        setHTMLContent(this.descriptionElement, descriptionText);
        if (descriptionOptions.className) {
            this.descriptionElement.classList.add(...descriptionOptions.className.split(/\s+/g));
        }
    }
    /**
     * Resets the content wrapper of the Grid. It clears the content and
     * resets the class names.
     * @internal
     */
    resetContentWrapper() {
        if (!this.contentWrapper) {
            return;
        }
        this.contentWrapper.innerHTML = AST.emptyHTML;
        this.contentWrapper.className =
            Globals.getClassName('container') + ' ' +
                this.options?.rendering?.theme || '';
    }
    /**
     * Renders the viewport of the Grid. If the Grid is already
     * rendered, it will be destroyed and re-rendered with the new data.
     * @internal
     */
    renderViewport() {
        const viewportMeta = this.viewport?.getStateMeta();
        const pagination = this.pagination;
        const paginationPosition = pagination?.options?.position;
        this.enabledColumns = this.getEnabledColumnIDs();
        this.credits?.destroy();
        this.viewport?.destroy();
        delete this.viewport;
        this.resetContentWrapper();
        fireEvent(this, 'beforeRenderViewport');
        this.renderCaption();
        // Render top pagination if enabled (before table)
        if (paginationPosition === 'top') {
            pagination?.render();
        }
        if (this.enabledColumns.length > 0) {
            this.viewport = this.renderTable();
            if (viewportMeta && this.viewport) {
                this.viewport.applyStateMeta(viewportMeta);
            }
        }
        else {
            this.renderNoData();
        }
        this.accessibility?.setA11yOptions();
        // Render bottom pagination, footer pagination,
        // or custom container pagination (after table).
        if (paginationPosition !== 'top') {
            pagination?.render();
        }
        this.renderDescription();
        fireEvent(this, 'afterRenderViewport');
        this.viewport?.reflow();
    }
    /**
     * Renders the table (viewport) of the Grid.
     *
     * @returns
     * The newly rendered table (viewport) of the Grid.
     */
    renderTable() {
        this.tableElement = makeHTMLElement('table', {
            className: Globals.getClassName('tableElement')
        }, this.contentWrapper);
        this.tableElement.setAttribute('role', 'grid');
        return new Table(this, this.tableElement);
    }
    /**
     * Renders a message that there is no data to display.
     */
    renderNoData() {
        makeHTMLElement('div', {
            className: Globals.getClassName('noData'),
            innerText: this.options?.lang?.noData
        }, this.contentWrapper);
    }
    /**
     * Returns the array of IDs of columns that should be displayed in the data
     * grid, in the correct order.
     */
    getEnabledColumnIDs() {
        const { columnOptionsMap } = this;
        const header = this.options?.header;
        const headerColumns = this.getColumnIds(header || [], false);
        const columnsIncluded = this.options?.rendering?.columns?.included || (headerColumns && headerColumns.length > 0 ?
            headerColumns : this.dataTable?.getColumnIds());
        if (!columnsIncluded?.length) {
            return [];
        }
        if (!columnOptionsMap) {
            return columnsIncluded;
        }
        let columnId;
        const result = [];
        for (let i = 0, iEnd = columnsIncluded.length; i < iEnd; ++i) {
            columnId = columnsIncluded[i];
            if (columnOptionsMap?.[columnId]?.options?.enabled !== false) {
                result.push(columnId);
            }
        }
        return result;
    }
    /**
     * Loads the data table of the Grid. If the data table is passed as a
     * reference, it should be used instead of creating a new one.
     */
    loadDataTable() {
        this.querying.shouldBeUpdated = true;
        // Unregister all events attached to the previous data table.
        this.dataTableEventDestructors.forEach((fn) => fn());
        const tableOptions = this.options?.dataTable;
        // If the table is passed as a reference, it should be used instead of
        // creating a new one.
        if (tableOptions?.clone) {
            this.dataTable = tableOptions;
            this.presentationTable = this.dataTable.getModified();
            return;
        }
        const dt = this.dataTable = this.presentationTable =
            new DataTable(tableOptions);
        // If the data table is modified, mark the querying controller to be
        // updated on the next proceed.
        [
            'afterDeleteColumns',
            'afterDeleteRows',
            'afterSetCell',
            'afterSetColumns',
            'afterSetRows'
        ].forEach((eventName) => {
            this.dataTableEventDestructors.push(dt.on(eventName, () => {
                this.querying.shouldBeUpdated = true;
            }));
        });
    }
    /**
     * Extracts all references to columnIds on all levels below defined level
     * in the settings.header structure.
     *
     * @param columnsTree
     * Structure that we start calculation
     *
     * @param [onlyEnabledColumns=true]
     * Extract all columns from header or columns filtered by enabled param
     * @returns
     */
    getColumnIds(columnsTree, onlyEnabledColumns = true) {
        let columnIds = [];
        const { enabledColumns } = this;
        for (const column of columnsTree) {
            const columnId = typeof column === 'string' ? column : column.columnId;
            if (columnId &&
                (!onlyEnabledColumns || (enabledColumns?.includes(columnId)))) {
                columnIds.push(columnId);
            }
            if (typeof column !== 'string' && column.columns) {
                columnIds = columnIds.concat(this.getColumnIds(column.columns, onlyEnabledColumns));
            }
        }
        return columnIds;
    }
    /**
     * Destroys the Grid.
     *
     * @param onlyDOM
     * Whether to destroy the Grid instance completely (`false` - default) or
     * just the DOM elements (`true`). If `true`, the Grid can be re-rendered
     * after destruction by calling the `render` method.
     */
    destroy(onlyDOM = false) {
        this.isRendered = false;
        const dgIndex = Grid.grids.findIndex((dg) => dg === this);
        this.dataTableEventDestructors.forEach((fn) => fn());
        this.accessibility?.destroy();
        this.pagination?.destroy();
        this.viewport?.destroy();
        if (this.container) {
            this.container.innerHTML = AST.emptyHTML;
            this.container.classList.remove(Globals.getClassName('container'));
        }
        if (onlyDOM) {
            return;
        }
        // Clear all properties
        Object.keys(this).forEach((key) => {
            delete this[key];
        });
        Grid.grids.splice(dgIndex, 1);
    }
    /**
     * Grey out the Grid and show a loading indicator.
     *
     * @param message
     * The message to display in the loading indicator.
     */
    showLoading(message) {
        if (this.loadingWrapper) {
            return;
        }
        // Create loading wrapper.
        this.loadingWrapper = makeHTMLElement('div', {
            className: Globals.getClassName('loadingWrapper')
        }, this.contentWrapper);
        // Create spinner element.
        makeHTMLElement('div', {
            className: Globals.getClassName('loadingSpinner')
        }, this.loadingWrapper);
        // Create loading message span element.
        const loadingSpan = makeHTMLElement('span', {
            className: Globals.getClassName('loadingMessage')
        }, this.loadingWrapper);
        setHTMLContent(loadingSpan, pick(message, this.options?.lang?.loading, ''));
    }
    /**
     * Removes the loading indicator.
     */
    hideLoading() {
        this.loadingWrapper?.remove();
        delete this.loadingWrapper;
    }
    /**
     * Returns the grid data as a JSON string.
     *
     * @param modified
     * Whether to return the modified data table (after filtering/sorting/etc.)
     * or the unmodified, original one. Default value is set to `true`.
     *
     * @return
     * JSON representation of the data
     */
    getData(modified = true) {
        const dataTable = modified ? this.presentationTable : this.dataTable;
        const tableColumns = dataTable?.columns;
        const outputColumns = {};
        if (!this.enabledColumns || !tableColumns) {
            return '{}';
        }
        const typeParser = (type) => {
            const TypeMap = {
                number: Number,
                datetime: Number,
                string: String,
                'boolean': Boolean
            };
            return (value) => (defined(value) ? TypeMap[type](value) : null);
        };
        for (const columnId of Object.keys(tableColumns)) {
            const column = this.viewport?.getColumn(columnId);
            if (column) {
                const columnData = tableColumns[columnId];
                const parser = typeParser(column.dataType);
                outputColumns[columnId] = (() => {
                    const result = [];
                    for (let i = 0, iEnd = columnData.length; i < iEnd; ++i) {
                        result.push(parser(columnData[i]));
                    }
                    return result;
                })();
            }
        }
        return JSON.stringify(outputColumns, null, 2);
    }
    /**
     * Returns the current Grid options.
     *
     * @param onlyUserOptions
     * Whether to return only the user options or all options (user options
     * merged with the default ones). Default is `true`.
     *
     * @returns
     * Grid options.
     */
    getOptions(onlyUserOptions = true) {
        const options = onlyUserOptions ? merge(this.userOptions) : merge(this.options);
        if (options.dataTable?.id) {
            options.dataTable = {
                columns: options.dataTable.columns
            };
        }
        return options;
    }
}
/* *
*
*  Properties
*
* */
/**
 * An array containing the current Grid objects in the page.
 * @private
 */
Grid.grids = [];
/* *
 *
 *  Default Export
 *
 * */
export default Grid;

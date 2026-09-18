/* *
 *
 *  Grid Column class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 *
 *  Authors:
 *  - Dawid Draguła
 *  - Sebastian Bochan
 *
 * */
'use strict';
import { hasDataTableProvider } from '../Data/DataProvider.js';
import ColumnFiltering from './Actions/ColumnFiltering/ColumnFiltering.js';
import Templating from '../../../Core/Templating.js';
import TextContent from './CellContent/TextContent.js';
import Globals from '../Globals.js';
import GridUtils from '../GridUtils.js';
import { defined, fireEvent } from '../../../Shared/Utilities.js';
const { createOptionsProxy } = GridUtils;
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a column in the data grid.
 */
export class Column {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Constructs a column in the data grid.
     *
     * @param viewport
     * The viewport (table) the column belongs to.
     *
     * @param id
     * The id of the column (`name` in the Data Table).
     *
     * @param index
     * The index of the column.
     */
    constructor(viewport, id, index) {
        var _a;
        /**
         * Type of the data in the column.
         */
        this.dataType = 'string';
        /**
         * The cells of the column.
         */
        this.cells = [];
        /**
         * Class names applied to every element of the column (header, body and
         * filter cells): the ones from the `className` option, plus the ones
         * features contribute.
         */
        this.classNames = [];
        const { grid } = viewport;
        this.id = id;
        this.index = index;
        this.viewport = viewport;
        // Populate column options map if not exists, to prepare option
        // references for each column.
        if (grid.options && !grid.columnPolicy.hasColumnOptions(id)) {
            const columnOptions = { id };
            ((_a = grid.options).columns ?? (_a.columns = [])).push(columnOptions);
            grid.columnPolicy.setColumnOption(id, {
                index: grid.options.columns.length - 1,
                options: columnOptions
            });
        }
        this.options = createOptionsProxy(grid.columnPolicy.getIndividualColumnOptions(id) ?? {}, grid.options?.columnDefaults);
        if (this.options.className) {
            this.classNames.push(...this.options.className.split(/\s+/g));
        }
    }
    /* *
    *
    *  Methods
    *
    * */
    /**
     * Initializes the column data-related properties.
     */
    async init() {
        this.loadData();
        this.dataType = await this.assumeDataType();
        if (this.viewport.grid.columnPolicy.isColumnFilteringEnabled(this.id)) {
            this.filtering = new ColumnFiltering(this);
        }
        fireEvent(this, 'afterInit');
    }
    /**
     * Loads the data of the column from the viewport's data table.
     */
    loadData() {
        const grid = this.viewport.grid;
        const dp = grid.dataProvider;
        const sourceColumnId = grid.columnPolicy.getColumnSourceId(this.id);
        const isUnbound = grid.columnPolicy.isColumnUnbound(this.id);
        if (hasDataTableProvider(dp) &&
            sourceColumnId && !isUnbound) {
            this.data = dp.getDataTable(true)?.getColumn(sourceColumnId, true);
        }
        else {
            delete this.data;
        }
        if (grid.columnPolicy.isColumnFilteringEnabled(this.id)) {
            this.filtering ?? (this.filtering = new ColumnFiltering(this));
        }
        else {
            delete this.filtering;
        }
    }
    /**
     * Resolves the raw value for a table cell.
     *
     * @param cell
     * The cell to resolve the value for.
     */
    async getCellValue(cell) {
        const valueGetter = this.options.cells?.valueGetter;
        if (valueGetter) {
            return this.conformValue(await valueGetter.call(cell, cell));
        }
        if (this.valueResolver) {
            const resolved = await this.valueResolver.call(cell, cell);
            if (defined(resolved)) {
                return this.conformValue(resolved);
            }
        }
        const sourceColumnId = this.viewport.grid.columnPolicy
            .getColumnSourceId(this.id);
        if (!sourceColumnId) {
            return void 0;
        }
        return this.conformValue(await this.viewport.grid.dataProvider?.getValue(sourceColumnId, cell.row.index));
    }
    /**
     * Whether the column derives its cell values from the row instead of
     * reading them from the data, so editing a cell of the row must re-resolve
     * them.
     */
    isDerived() {
        return !!(this.options.cells?.valueGetter || this.valueResolver);
    }
    /**
     * Keeps a value the grid resolves for a cell within the column's declared
     * `dataType`, so cell formatters and renderers written for the column never
     * receive a foreign type. Values derived by the grid are the usual source:
     * a numeric aggregator over a text column resolves to `0`.
     *
     * @param value
     * Resolved cell value.
     */
    conformValue(value) {
        if (this.dataType === 'string' &&
            defined(value) &&
            typeof value !== 'string') {
            return String(value);
        }
        return value;
    }
    /**
     * Creates a cell content instance.
     *
     * @param cell
     * The cell that is to be edited.
     *
     */
    createCellContent(cell) {
        return new TextContent(cell);
    }
    /**
     * Assumes the data type of the column based on the options or data in the
     * column if not specified.
     */
    async assumeDataType() {
        const { grid } = this.viewport;
        const dp = grid.dataProvider;
        const type = grid.columnPolicy
            .getIndividualColumnOptions(this.id)?.dataType ??
            grid.options?.columnDefaults?.dataType;
        if (type) {
            return type;
        }
        const sourceColumnId = grid.columnPolicy.getColumnSourceId(this.id);
        if (grid.columnPolicy.isColumnUnbound(this.id) || !sourceColumnId) {
            return 'string';
        }
        return (await dp?.getColumnDataType(sourceColumnId)) ?? 'string';
    }
    /**
     * Adds the column class names to one of its elements.
     *
     * @param element
     * Element of the column (a header, body or filter cell).
     */
    applyClassNames(element) {
        if (!this.classNames.length) {
            return;
        }
        element.classList.add(...this.classNames);
    }
    /**
     * Registers a cell in the column.
     *
     * @param cell
     * The cell to register.
     */
    registerCell(cell) {
        cell.htmlElement.setAttribute('data-column-id', this.id);
        this.applyClassNames(cell.htmlElement);
        if (this.viewport.grid.hoveredColumnId === this.id) {
            cell.htmlElement.classList.add(Globals.getClassName('hoveredColumn'));
        }
        this.cells.push(cell);
    }
    /**
     * Unregister a cell from the column.
     *
     * @param cell
     * The cell to unregister.
     */
    unregisterCell(cell) {
        const index = this.cells.indexOf(cell);
        if (index > -1) {
            this.cells.splice(index, 1);
        }
    }
    /**
     * Returns the width of the column in pixels.
     */
    getWidth() {
        return this.viewport.columnLayout.getColumnWidth(this);
    }
    /**
     * Adds or removes the hovered CSS class to the column element
     * and its cells.
     *
     * @param hovered
     * Whether the column should be hovered.
     */
    setHoveredState(hovered) {
        this.header?.htmlElement?.classList[hovered ? 'add' : 'remove'](Globals.getClassName('hoveredColumn'));
        for (let i = 0, iEnd = this.cells.length; i < iEnd; ++i) {
            this.cells[i].htmlElement.classList[hovered ? 'add' : 'remove'](Globals.getClassName('hoveredColumn'));
        }
    }
    /**
     * Adds or removes the synced CSS class to the column element
     * and its cells.
     *
     * @param synced
     * Whether the column should have synced state.
     */
    setSyncedState(synced) {
        this.header?.htmlElement?.classList[synced ? 'add' : 'remove'](Globals.getClassName('syncedColumn'));
        for (let i = 0, iEnd = this.cells.length; i < iEnd; ++i) {
            this.cells[i].htmlElement.classList[synced ? 'add' : 'remove'](Globals.getClassName('syncedColumn'));
        }
    }
    /**
     * Returns the formatted string where the templating context is the column.
     *
     * @param template
     * The template string.
     *
     * @return
     * The formatted string.
     */
    format(template) {
        return Templating.format(template, this, this.viewport.grid);
    }
    /**
     * Sets the new column options to the userOptions field.
     *
     * @param options
     * The options to set.
     *
     * @param overwrite
     * Whether to overwrite the existing column options with the new ones.
     * Default is `false`.
     *
     * @returns
     * The difference between the previous and the new column options in form
     * of a record of `[column.id]: column.options`.
     *
     * @internal
     */
    setOptions(options, overwrite = false) {
        return this.viewport.grid.setColumnOptions([{
                id: this.id,
                ...options
            }], overwrite);
    }
    /**
     * Updates the column with new options.
     *
     * @param newOptions
     * The new options for the column.
     *
     * @param render
     * Whether to re-render after the update. If `false`, the update will just
     * extend the options object. Defaults to `true`.
     */
    async update(newOptions, render = true) {
        await this.viewport.grid.updateColumn(this.id, newOptions, render);
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default Column;

/* *
 *
 *  Grid Column class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Dawid Dragula
 *  - Sebastian Bochan
 *
 * */
'use strict';
import ColumnFiltering from './Actions/ColumnFiltering/ColumnFiltering.js';
import Templating from '../../../Core/Templating.js';
import TextContent from './CellContent/TextContent.js';
import Globals from '../Globals.js';
import GridUtils from '../GridUtils.js';
import { fireEvent } from '../../../Shared/Utilities.js';
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
        const { grid } = viewport;
        this.id = id;
        this.index = index;
        this.viewport = viewport;
        // Populate column options map if not exists, to prepare option
        // references for each column.
        if (grid.options && !grid.columnOptionsMap?.[id]) {
            const columnOptions = { id };
            ((_a = grid.options).columns ?? (_a.columns = [])).push(columnOptions);
            grid.columnOptionsMap[id] = {
                index: grid.options.columns.length - 1,
                options: columnOptions
            };
        }
        this.options = createOptionsProxy(grid.columnOptionsMap?.[id]?.options ?? {}, grid.options?.columnDefaults);
        if (this.options.filtering?.enabled) {
            this.filtering = new ColumnFiltering(this);
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
        fireEvent(this, 'afterInit');
    }
    /**
     * Loads the data of the column from the viewport's data table.
     */
    loadData() {
        const dp = this.viewport.grid.dataProvider;
        if (dp && 'getDataTable' in dp) {
            this.data = dp.getDataTable(true)?.getColumn(this.id, true);
        }
        else {
            delete this.data;
        }
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
        const type = grid.columnOptionsMap?.[this.id]?.options.dataType ??
            grid.options?.columnDefaults?.dataType;
        if (type) {
            return type;
        }
        return (await dp?.getColumnDataType(this.id)) ?? 'string';
    }
    /**
     * Registers a cell in the column.
     *
     * @param cell
     * The cell to register.
     */
    registerCell(cell) {
        cell.htmlElement.setAttribute('data-column-id', this.id);
        if (this.options.className) {
            cell.htmlElement.classList.add(...this.options.className.split(/\s+/g));
        }
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
        return this.viewport.columnResizing.getColumnWidth(this);
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

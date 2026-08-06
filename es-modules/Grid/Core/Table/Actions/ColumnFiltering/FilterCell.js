/* *
 *
 *  Grid Filter Cell class
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
 *
 * */
'use strict';
import HeaderCell from '../../Header/HeaderCell.js';
import { fireEvent } from '../../../../../Shared/Utilities.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a cell in the data grid header.
 */
class FilterCell extends HeaderCell {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(row, column) {
        // `super() (via syncColumns)` sets column.header = this. A filter cell
        // must keep column.header pointing at the real header-row cell, so we
        // snapshot it and restore it afterwards.
        const originalHeader = column.header;
        super(row, column);
        column.header = originalHeader;
    }
    /* *
     *
     *  Methods
     *
     * */
    async render() {
        const { column } = this;
        if (!column) {
            return Promise.resolve();
        }
        // Render content of th element
        this.row.htmlElement.appendChild(this.htmlElement);
        this.htmlElement.setAttribute('scope', 'col');
        this.htmlElement.setAttribute('data-column-id', column.id);
        // Add user column classname
        if (column.options.className) {
            this.htmlElement.classList.add(...column.options.className.split(/\s+/g));
        }
        this.setCustomClassName(column.options.header?.className);
        fireEvent(this, 'afterRender', { column, filtering: true });
    }
    syncColumns(column, columnsTree) {
        // `super.syncColumns()` sets column.header = this. A filter cell must
        // keep column.header pointing at the real header-row cell, so we
        // snapshot it and restore it afterwards.
        const originalHeader = column?.header;
        super.syncColumns(column, columnsTree);
        if (column) {
            column.header = originalHeader;
        }
    }
    onKeyDown(e) {
        if (e.target === this.htmlElement) {
            if (e.key === 'Enter' &&
                this.column.viewport.grid.columnPolicy
                    .isColumnInlineFilteringEnabled(this.column.id)) {
                this.column.filtering?.focusFirstControl();
            }
            else {
                super.onKeyDown(e);
            }
        }
        else {
            this.column.filtering?.onKeyDown(e);
            if (e.key === 'Escape') {
                this.htmlElement.focus();
            }
        }
    }
    onClick(e) {
        if (e.target === this.htmlElement) {
            this.htmlElement.focus();
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default FilterCell;

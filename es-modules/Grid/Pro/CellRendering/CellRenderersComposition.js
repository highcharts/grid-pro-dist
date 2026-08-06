/* *
 *
 *  Cell Content Pro composition
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
import CellRendererRegistry from './CellRendererRegistry.js';
import Globals from '../../Core/Globals.js';
import { addEvent, pushUnique } from '../../../Shared/Utilities.js';
/* *
 *
 *  Composition
 *
 * */
/**
 * Extends the grid classes with cell editing functionality.
 *
 * @param ColumnClass
 * The class to extend.
 */
export function compose(ColumnClass) {
    if (!pushUnique(Globals.composed, 'CellRenderers')) {
        return;
    }
    addEvent(ColumnClass, 'afterInit', afterColumnInit);
    ColumnClass.prototype.createCellContent = createCellContent;
}
/**
 * Init a type of content for a column.
 * @param this
 * Current column.
 */
function afterColumnInit() {
    const rendererType = this.options.cells?.renderer?.type || 'text';
    let Renderer = CellRendererRegistry.types[rendererType];
    if (!Renderer) {
        // eslint-disable-next-line no-console
        console.warn(`The cell renderer of type "${rendererType}" is not registered. Using default text renderer instead.`);
        Renderer = CellRendererRegistry.types.text;
    }
    this.cellRenderer = new Renderer(this, this.options.cells?.renderer || {});
}
/**
 * Render content of cell.
 * @param this
 * Current column.
 *
 * @param cell
 * Current cell.
 *
 * @returns
 * Formatted cell content.
 */
function createCellContent(cell) {
    if (!this.cellRenderer) {
        throw new Error('Called cell renderer on uninitialized column.');
    }
    return this.cellRenderer.render(cell);
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    compose
};

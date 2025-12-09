/* *
 *
 *  Text Cell Content class
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import AST from '../../../../Core/Renderer/HTML/AST.js';
import CellContent from './CellContent.js';
import GridUtils from '../../GridUtils.js';
const { setHTMLContent } = GridUtils;
import Utils from '../../../../Core/Utilities.js';
const { defined, isString } = Utils;
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a text type of content.
 */
class TextContent extends CellContent {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(cell) {
        super(cell);
        this.add();
    }
    /* *
     *
     *  Methods
     *
     * */
    add() {
        this.update();
    }
    destroy() {
        this.cell.htmlElement.innerHTML = AST.emptyHTML;
    }
    update() {
        setHTMLContent(this.cell.htmlElement, this.format());
    }
    /**
     * Returns the formatted value of the cell.
     *
     * @internal
     */
    format() {
        const { cell } = this;
        const cellsDefaults = cell.row.viewport.grid.options?.columnDefaults?.cells || {};
        const { format, formatter } = cell.column.options.cells || {};
        let value = cell.value;
        if (!defined(value)) {
            value = '';
        }
        let cellContent = '';
        if (!format && !formatter) {
            return cell.format(TextContent.defaultFormatsForDataTypes[cell.column.dataType]);
        }
        const isDefaultFormat = cellsDefaults.format === format;
        const isDefaultFormatter = cellsDefaults.formatter === formatter;
        if (isDefaultFormat && isDefaultFormatter) {
            cellContent = formatter ?
                formatter.call(cell).toString() :
                (format ? cell.format(format) : value + '');
        }
        else if (isDefaultFormat) {
            const formattedValue = formatter?.call(cell);
            if (isString(formattedValue)) {
                cellContent = formattedValue;
            }
            else {
                cellContent = value + '';
            }
        }
        else if (isDefaultFormatter) {
            cellContent = format ? cell.format(format) : value + '';
        }
        return cellContent;
    }
}
/* *
 *
 *  Static Properties
 *
 * */
TextContent.defaultFormatsForDataTypes = {
    string: '{value}',
    number: '{value}',
    'boolean': '{value}',
    datetime: '{value:%Y-%m-%d %H:%M:%S}'
};
/* *
 *
 *  Default Export
 *
 * */
export default TextContent;

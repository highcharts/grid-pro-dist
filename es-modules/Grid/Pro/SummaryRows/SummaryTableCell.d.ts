import type { CellType as DataTableCellType } from '../../../Data/DataTable';
import type SummaryTableRow from './SummaryTableRow';
import type { CSSObject } from '../../../Core/Renderer/CSSObject';
import TableCell from '../../Core/Table/Body/TableCell.js';
/**
 * Read-only cell rendering a computed summary value from the row object.
 */
declare class SummaryTableCell extends TableCell {
    readonly row: SummaryTableRow;
    /**
     * Renders the value, sourcing it from the computed summary row object
     * instead of the data provider, then runs the normal cell pipeline so
     * `cells.format`, renderers and styles are honored. A per-cell summary
     * `format` overrides the column format for display only (the cell value and
     * `data-value` stay the raw aggregated/static value).
     *
     * A missing value renders empty; the base data-provider fetch (keyed by row
     * index) must never run for a synthetic summary row.
     *
     * @param value
     * Optional explicit value.
     *
     * @param updateDataset
     * Ignored for summary cells.
     */
    setValue(value?: DataTableCellType, updateDataset?: boolean): Promise<void>;
    /**
     * Adds the summary cell class name on top of the column's `cells.className`
     * instead of replacing it.
     *
     * @param template
     * Class name template from the column options.
     */
    protected setCustomClassName(template?: string): void;
    /**
     * Merges the summary cell style over the styles resolved from the column.
     */
    protected getCellStyles(): CSSObject;
    /**
     * Summary cells are never editable.
     */
    isEditable(): boolean;
}
export default SummaryTableCell;

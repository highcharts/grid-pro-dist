import type { DataEventDetail } from '../../../Data/DataEvent';
import type { CellType as DataTableCellType } from '../../../Data/DataTable';
import type DataModifierOptions from '../../../Data/Modifiers/DataModifierOptions';
import DataModifier from '../../../Data/Modifiers/DataModifier.js';
import DataTable from '../../../Data/DataTable.js';
/**
 * One column the modifier materializes into the queried table.
 */
export interface SummaryColumnSpec {
    /**
     * Id of the aggregating column, written into the table.
     */
    columnId: string;
    /**
     * Resolves the aggregated value of one row of the source table.
     *
     * @param table
     * Table the values are read from.
     *
     * @param rowIndex
     * Row of the table being resolved.
     */
    resolve(table: DataTable, rowIndex: number): DataTableCellType;
}
/**
 * Materializes aggregating columns (`columnAggregator` with `materialize`) into
 * the queried table, so that sorting, filtering and exporting see their values.
 *
 * It runs before the sorting and filtering modifiers, on a copy of the user
 * data table.
 */
declare class SummaryColumnsModifier extends DataModifier {
    readonly options: DataModifierOptions;
    /**
     * Columns to materialize, resolved from the Grid column options.
     */
    private readonly specs;
    /**
     * Constructs the modifier for a set of aggregating columns.
     *
     * @param specs
     * Columns to materialize.
     */
    constructor(specs: SummaryColumnSpec[]);
    modifyTable(table: DataTable, eventDetail?: DataEventDetail): DataTable;
}
export default SummaryColumnsModifier;

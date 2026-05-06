import type Grid from '../../Core/Grid';
import type Table from '../../Core/Table/Table';
import type Column from '../../Core/Table/Column';
import type TableRow from '../../Core/Table/Body/TableRow';
import type TableCell from '../../Core/Table/Body/TableCell';
import type { DeepPartial } from '../../../Shared/Types';
import type Options from '../../Core/Options';
import { type RowId as GridRowId, type RowPinningChangeAction, type RowPinningChangeEvent, type RowPinningChangeEventCallback, type RowPinningEvents, type RowPinningOptions, type RowPinningPosition, type RowPinningSectionOptions } from './RowPinningController.js';
import { classNames } from './RowPinningView.js';
/**
 * Default options for row pinning.
 */
export declare const defaultOptions: DeepPartial<Options>;
export { classNames };
/**
 * Compose row pinning APIs into Grid Pro.
 *
 * @param GridClass
 * Grid class to compose into.
 *
 * @param TableClass
 * Table class to compose into.
 *
 * @param ColumnClass
 * Column class to compose into.
 *
 * @param TableRowClass
 * TableRow class to compose into.
 *
 * @param TableCellClass
 * TableCell class to compose into.
 */
export declare function compose(GridClass: typeof Grid, TableClass: typeof Table, ColumnClass: typeof Column, TableRowClass: typeof TableRow, TableCellClass: typeof TableCell): void;
export type { GridRowId, RowPinningChangeAction, RowPinningChangeEvent, RowPinningChangeEventCallback, RowPinningEvents, RowPinningOptions, RowPinningPosition, RowPinningSectionOptions };
declare const _default: {
    readonly compose: typeof compose;
};
export default _default;

import type { AnyRecord } from '../../../../Shared/Types';
import type Column from '../../../Core/Table/Column';
import type TableCell from '../../../Core/Table/Body/TableCell';
import type DataTable from '../../../../Data/DataTable';
import type { EditModeRendererTypeName } from '../../CellEditing/CellEditingComposition';
import { CellRenderer, CellRendererOptions } from '../CellRenderer.js';
import SparklineContent from '../ContentTypes/SparklineContent.js';
/**
 * Renderer for the Text in a column..
 */
declare class SparklineRenderer extends CellRenderer {
    /**
     * Imports the Highcharts namespace to be used by the Sparkline Renderer.
     *
     * @param H
     * Highcharts namespace.
     */
    static useHighcharts(H: AnyRecord): void;
    /**
     * The default edit mode renderer type names for this view renderer.
     */
    static defaultEditingRenderer: EditModeRendererTypeName;
    /**
     * Default options for the sparkline renderer.
     */
    static defaultOptions: SparklineRendererOptions;
    options: SparklineRendererOptions;
    constructor(column: Column);
    render(cell: TableCell): SparklineContent;
}
/**
 * Options to control the sparkline renderer content.
 */
export interface SparklineRendererOptions extends CellRendererOptions {
    type: 'sparkline';
    chartOptions?: (((this: TableCell, data: DataTable.CellType) => AnyRecord) | AnyRecord);
}
declare module '../CellRendererType' {
    interface CellRendererTypeRegistry {
        sparkline: typeof SparklineRenderer;
    }
}
export default SparklineRenderer;

import type { AnyRecord } from '../../../../Shared/Types';
import type SparklineRenderer from '../Renderers/SparklineRenderer';
import type TableCell from '../../../Core/Table/Body/TableCell';
import CellContentPro from '../CellContentPro.js';
/**
 * Represents a sparkline type of cell content.
 */
declare class SparklineContent extends CellContentPro {
    /**
     * Highcharts namespace used by the Sparkline Renderer.
     * This is set to `undefined` by default, and should be set to the
     * Highcharts namespace before using the Sparkline Renderer.
     */
    static H: undefined | AnyRecord;
    /**
     * The default chart options for the sparkline content.
     */
    static defaultChartOptions: AnyRecord;
    /**
     * The Highcharts chart instance.
     */
    chart?: {
        update: (options: AnyRecord, force?: boolean, redraw?: boolean, animation?: boolean) => void;
        destroy: () => void;
    };
    /**
     * The parent element for the sparkline content.
     */
    private parentElement;
    /**
     * The HTML container element for the chart.
     */
    private chartContainer?;
    constructor(cell: TableCell, renderer: SparklineRenderer, parentElement?: HTMLElement);
    protected add(parentElement?: HTMLElement): void;
    update(): void;
    destroy(): void;
    private getProcessedOptions;
    private onKeyDown;
}
export default SparklineContent;

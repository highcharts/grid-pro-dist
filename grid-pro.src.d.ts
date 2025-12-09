/**
 * @license Highcharts Grid Pro v2.1.0 (2025-12-09)
 * @module grid/grid-pro
 *
 * (c) 2009-2025 Highsoft AS
 *
 * License: www.highcharts.com/license
 */
import type _Options from './es-modules/Grid/Core/Options';
import type * as H from './es-modules/Grid/Pro/highcharts';
import AST from './es-modules/Core/Renderer/HTML/AST.js';
import Templating from './es-modules/Core/Templating.js';
import ColumnResizing from './es-modules/Grid/Core/Table/ColumnResizing/ColumnResizing.js';
import DataConnector from './es-modules/Data/Connectors/DataConnector.js';
import DataConverter from './es-modules/Data/Converters/DataConverter.js';
import DataCursor from './es-modules/Data/DataCursor.js';
import _Grid from './es-modules/Grid/Core/Grid.js';
import DataModifier from './es-modules/Data/Modifiers/DataModifier.js';
import DataPool from './es-modules/Data/DataPool.js';
import DataTable from './es-modules/Data/DataTable.js';
import Table from './es-modules/Grid/Core/Table/Table.js';
import Column from './es-modules/Grid/Core/Table/Column.js';
import HeaderCell from './es-modules/Grid/Core/Table/Header/HeaderCell.js';
import TableCell from './es-modules/Grid/Core/Table/Body/TableCell.js';
import SvgIcons from './es-modules/Grid/Core/UI/SvgIcons.js';
import CellRendererRegistry from './es-modules/Grid/Pro/CellRendering/CellRendererRegistry.js';
import Pagination from './es-modules/Grid/Core/Pagination/Pagination.js';
import CellContentPro from './es-modules/Grid/Pro/CellRendering/CellContentPro.js';
import CellRenderer from './es-modules/Grid/Pro/CellRendering/CellRenderer.js';
import Popup from './es-modules/Grid/Core/UI/Popup.js';
import './es-modules/Data/Connectors/CSVConnector.js';
import './es-modules/Data/Connectors/GoogleSheetsConnector.js';
import './es-modules/Data/Connectors/HTMLTableConnector.js';
import './es-modules/Data/Connectors/JSONConnector.js';
import './es-modules/Data/Modifiers/ChainModifier.js';
import './es-modules/Data/Modifiers/InvertModifier.js';
import './es-modules/Data/Modifiers/RangeModifier.js';
import './es-modules/Data/Modifiers/SortModifier.js';
import './es-modules/Data/Modifiers/FilterModifier.js';
import './es-modules/Grid/Pro/GridEvents.js';
import './es-modules/Grid/Pro/CellEditing/CellEditingComposition.js';
import './es-modules/Grid/Pro/Credits/CreditsProComposition.js';
import './es-modules/Grid/Pro/Export/ExportingComposition.js';
import './es-modules/Grid/Pro/CellRendering/CellRenderer.js';
import './es-modules/Grid/Pro/CellRendering/CellContentPro.js';
import './es-modules/Grid/Pro/CellRendering/CellRenderersComposition.js';
import './es-modules/Grid/Pro/CellRendering/Renderers/TextRenderer.js';
import './es-modules/Grid/Pro/CellRendering/Renderers/CheckboxRenderer.js';
import './es-modules/Grid/Pro/CellRendering/Renderers/SelectRenderer.js';
import './es-modules/Grid/Pro/CellRendering/Renderers/TextInputRenderer.js';
import './es-modules/Grid/Pro/CellRendering/Renderers/DateInputRenderer.js';
import './es-modules/Grid/Pro/CellRendering/Renderers/DateTimeInputRenderer.js';
import './es-modules/Grid/Pro/CellRendering/Renderers/TimeInputRenderer.js';
import './es-modules/Grid/Pro/CellRendering/Renderers/SparklineRenderer.js';
import './es-modules/Grid/Pro/CellRendering/Renderers/NumberInputRenderer.js';
declare const G: {
    readonly AST: typeof AST;
    readonly CellContentPro: typeof CellContentPro;
    readonly CellRenderer: typeof CellRenderer;
    readonly CellRendererRegistry: {
        readonly types: import("./es-modules/Grid/Pro/CellRendering/CellRendererType").CellRendererTypeRegistry;
        readonly registerRenderer: typeof import("./es-modules/Grid/Pro/CellRendering/CellRendererRegistry.js").registerRenderer;
    };
    readonly classNamePrefix: string;
    readonly Column: typeof Column;
    readonly ColumnResizing: {
        readonly initMode: typeof import("./es-modules/Grid/Core/Table/ColumnResizing/ColumnResizing.js").initMode;
        readonly types: {
            adjacent: typeof import("./es-modules/Grid/Core/Table/ColumnResizing/AdjacentResizingMode").default;
            distributed: typeof import("./es-modules/Grid/Core/Table/ColumnResizing/DistributedResizingMode").default;
            independent: typeof import("./es-modules/Grid/Core/Table/ColumnResizing/IndependentResizingMode").default;
        };
        readonly AbstractStrategy: typeof import("./es-modules/Grid/Core/Table/ColumnResizing/ResizingMode").default;
    };
    readonly DataConnector: typeof DataConnector;
    readonly DataConverter: typeof DataConverter;
    readonly DataCursor: typeof DataCursor;
    readonly DataModifier: typeof DataModifier;
    readonly DataPool: typeof DataPool;
    readonly DataTable: typeof DataTable;
    readonly defaultOptions: import("./es-modules/Shared/Types").DeepPartial<_Options>;
    readonly Grid: typeof _Grid;
    readonly grid: typeof _Grid.grid;
    readonly grids: (_Grid | undefined)[];
    readonly HeaderCell: typeof HeaderCell;
    readonly isHighContrastModeActive: () => boolean;
    readonly merge: {
        <T = object>(extend: true, a?: T, ...n: Array<import("./es-modules/Shared/Types").DeepPartial<T> | undefined>): (T);
        <T1 extends object = object, T2 = unknown, T3 = unknown, T4 = unknown, T5 = unknown, T6 = unknown, T7 = unknown, T8 = unknown, T9 = unknown>(a?: T1, b?: T2, c?: T3, d?: T4, e?: T5, f?: T6, g?: T7, h?: T8, i?: T9): (T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9);
    };
    readonly Pagination: typeof Pagination;
    readonly Popup: typeof Popup;
    readonly product: "Grid Pro";
    readonly setOptions: typeof import("./es-modules/Grid/Core/Defaults.js").setOptions;
    readonly SvgIcons: {
        readonly createGridIcon: typeof import("./es-modules/Grid/Core/UI/SvgIcons.js").createGridIcon;
        readonly icons: Record<import("./es-modules/Grid/Core/UI/SvgIcons.js").GridIconName, import("./es-modules/Grid/Core/UI/SvgIcons.js").SVGDefinition>;
        readonly pathDefaults: Partial<import("./es-modules/Grid/Core/UI/SvgIcons.js").PathDefinition>;
    };
    readonly Table: typeof Table;
    readonly TableCell: typeof TableCell;
    readonly Templating: {
        dateFormat: (format: string, timestamp: number, upperCaseFirst?: boolean) => string;
        format: (str: string | undefined, ctx: any, owner?: Templating.Owner) => string;
        helpers: Record<string, Function>;
        numberFormat: (this: Templating.Owner | void, number: number, decimals: number, decimalPoint?: string, thousandsSep?: string) => string;
    };
    readonly version: "2.1.0";
    readonly win: Window & typeof globalThis;
};
export { AST, CellContentPro, CellRenderer, CellRendererRegistry, Column, ColumnResizing, DataConnector, DataConverter, DataCursor, DataModifier, DataPool, DataTable, HeaderCell, Pagination, Popup, SvgIcons, Table, TableCell, Templating };
export declare const classNamePrefix: string, defaultOptions: import("./es-modules/Shared/Types").DeepPartial<_Options>, Grid: typeof _Grid, grid: typeof _Grid.grid, grids: (_Grid | undefined)[], isHighContrastModeActive: () => boolean, merge: {
    <T = object>(extend: true, a?: T, ...n: Array<import("./es-modules/Shared/Types").DeepPartial<T> | undefined>): (T);
    <T1 extends object = object, T2 = unknown, T3 = unknown, T4 = unknown, T5 = unknown, T6 = unknown, T7 = unknown, T8 = unknown, T9 = unknown>(a?: T1, b?: T2, c?: T3, d?: T4, e?: T5, f?: T6, g?: T7, h?: T8, i?: T9): (T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9);
}, product: "Grid Pro", setOptions: typeof import("./es-modules/Grid/Core/Defaults.js").setOptions, version: "2.1.0", win: Window & typeof globalThis;
declare global {
    interface Window {
        Highcharts?: typeof H;
    }
}
declare namespace G {
    type Options = _Options;
}
export default G;

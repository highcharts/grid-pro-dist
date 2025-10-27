/**
 * @license Highcharts Grid Pro v@product.version@ (@product.date@)
 * @module grid/grid-pro
 *
 * (c) 2009-2025 Highsoft AS
 *
 * License: www.highcharts.com/license
 */
import type _Options from '../Grid/Core/Options';
import type * as H from '../Grid/Pro/highcharts';
import AST from '../Core/Renderer/HTML/AST.js';
import Templating from '../Core/Templating.js';
import ColumnResizing from '../Grid/Core/Table/ColumnResizing/ColumnResizing.js';
import DataConnector from '../Data/Connectors/DataConnector.js';
import DataConverter from '../Data/Converters/DataConverter.js';
import DataCursor from '../Data/DataCursor.js';
import _Grid from '../Grid/Core/Grid.js';
import DataModifier from '../Data/Modifiers/DataModifier.js';
import DataPool from '../Data/DataPool.js';
import DataTable from '../Data/DataTable.js';
import Defaults from '../Grid/Core/Defaults.js';
import Globals from '../Grid/Core/Globals.js';
import whcm from '../Accessibility/HighContrastMode.js';
import Utilities from '../Core/Utilities.js';
import Table from '../Grid/Core/Table/Table.js';
import Column from '../Grid/Core/Table/Column.js';
import HeaderCell from '../Grid/Core/Table/Header/HeaderCell.js';
import TableCell from '../Grid/Core/Table/Body/TableCell.js';
import SvgIcons from '../Grid/Core/UI/SvgIcons.js';
import CellRendererRegistry from '../Grid/Pro/CellRendering/CellRendererRegistry.js';
import Pagination from '../Grid/Core/Pagination/Pagination.js';
import CellContentPro from '../Grid/Pro/CellRendering/CellContentPro.js';
import CellRenderer from '../Grid/Pro/CellRendering/CellRenderer.js';
import '../Data/Connectors/CSVConnector.js';
import '../Data/Connectors/GoogleSheetsConnector.js';
import '../Data/Connectors/HTMLTableConnector.js';
import '../Data/Connectors/JSONConnector.js';
import '../Data/Modifiers/ChainModifier.js';
import '../Data/Modifiers/InvertModifier.js';
import '../Data/Modifiers/RangeModifier.js';
import '../Data/Modifiers/SortModifier.js';
import '../Data/Modifiers/FilterModifier.js';
import '../Grid/Pro/GridEvents.js';
import '../Grid/Pro/CellEditing/CellEditingComposition.js';
import '../Grid/Pro/Credits/CreditsProComposition.js';
import '../Grid/Pro/Export/ExportingComposition.js';
import '../Grid/Pro/CellRendering/CellRenderer.js';
import '../Grid/Pro/CellRendering/CellContentPro.js';
import '../Grid/Pro/CellRendering/CellRenderersComposition.js';
import '../Grid/Pro/CellRendering/Renderers/TextRenderer.js';
import '../Grid/Pro/CellRendering/Renderers/CheckboxRenderer.js';
import '../Grid/Pro/CellRendering/Renderers/SelectRenderer.js';
import '../Grid/Pro/CellRendering/Renderers/TextInputRenderer.js';
import '../Grid/Pro/CellRendering/Renderers/DateInputRenderer.js';
import '../Grid/Pro/CellRendering/Renderers/DateTimeInputRenderer.js';
import '../Grid/Pro/CellRendering/Renderers/TimeInputRenderer.js';
import '../Grid/Pro/CellRendering/Renderers/SparklineRenderer.js';
import '../Grid/Pro/CellRendering/Renderers/NumberInputRenderer.js';
declare global {
    interface GridNamespace {
        win: typeof Globals.win;
        product: 'Grid Lite' | 'Grid Pro';
        AST: typeof AST;
        classNamePrefix: typeof Globals.classNamePrefix;
        Grid: typeof _Grid;
        grid: typeof _Grid.grid;
        grids: Array<(_Grid | undefined)>;
        ColumnResizing: typeof ColumnResizing;
        DataConverter: typeof DataConverter;
        DataCursor: typeof DataCursor;
        DataModifier: typeof DataModifier;
        DataConnector: typeof DataConnector;
        DataPool: typeof DataPool;
        DataTable: typeof DataTable;
        isHighContrastModeActive: typeof whcm.isHighContrastModeActive;
        defaultOptions: typeof Defaults.defaultOptions;
        setOptions: typeof Defaults.setOptions;
        Table: typeof Table;
        Column: typeof Column;
        HeaderCell: typeof HeaderCell;
        TableCell: typeof TableCell;
        Pagination: typeof Pagination;
        Templating: typeof Templating;
        CellContentPro: typeof CellContentPro;
        merge: typeof Utilities.merge;
        CellRendererRegistry: typeof CellRendererRegistry;
        CellRenderer: typeof CellRenderer;
        SvgIcons: typeof SvgIcons;
    }
    interface Window {
        Grid: GridNamespace;
        Highcharts?: typeof H;
    }
}
declare const G: GridNamespace;
declare namespace G {
    type Options = _Options;
}
export default G;

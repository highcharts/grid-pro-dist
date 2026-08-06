/* *
 *
 *  (c) 2009-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 *
 *  Authors:
 *  - Dawid Draguła
 *  - Sebastian Bochan
 *
 * */
'use strict';
/* *
 *
 *  Constants
 *
 * */
export const classNamePrefix = 'hcg-';
export const version = '3.1.0';
export const buildDate = '2026-08-06';
export const rawClassNames = {
    container: 'container',
    themed: 'themed',
    tableElement: 'table',
    captionElement: 'caption',
    descriptionElement: 'description',
    theadElement: 'thead',
    tbodyElement: 'tbody',
    cell: 'cell',
    rowElement: 'row',
    rowEven: 'row-even',
    rowOdd: 'row-odd',
    hoveredRow: 'hovered-row',
    hoveredCell: 'hovered-cell',
    hoveredColumn: 'hovered-column',
    syncedRow: 'synced-row',
    syncedCell: 'synced-cell',
    syncedColumn: 'synced-column',
    editedCell: 'edited-cell',
    cellEditingContainer: 'cell-editing-container',
    mockedRow: 'mocked-row',
    rowsContentNowrap: 'rows-content-nowrap',
    virtualization: 'virtualization',
    columnVirtualization: 'column-virtualization',
    scrollableContent: 'scrollable-content',
    headerCell: 'header-cell',
    headerCellContainer: 'header-cell-container',
    headerCellContent: 'header-cell-content',
    headerCellFilterIcon: 'header-cell-filter-icon',
    headerCellIcons: 'header-cell-icons',
    headerCellSortIcon: 'header-cell-sort-icon',
    headerCellMenuIcon: 'header-cell-menu-icon',
    headerRow: 'head-row-content',
    noData: 'no-data',
    noPadding: 'no-padding',
    columnFirst: 'column-first',
    columnSortable: 'column-sortable',
    columnSortableIcon: 'column-sortable-icon',
    columnSortedAsc: 'column-sorted-asc',
    columnSortedDesc: 'column-sorted-desc',
    resizableContent: 'resizable-content',
    resizerHandles: 'column-resizer',
    resizedColumn: 'column-resized',
    creditsContainer: 'credits-container',
    creditsText: 'credits',
    creditsPro: 'credits-pro',
    visuallyHidden: 'visually-hidden',
    lastHeaderCellInRow: 'last-header-cell-in-row',
    loadingWrapper: 'loading-wrapper',
    loadingSpinner: 'spinner',
    loadingMessage: 'loading-message',
    popup: 'popup',
    button: 'button',
    buttonSelected: 'button-selected',
    input: 'input',
    icon: 'icon',
    iconSelected: 'icon-selected',
    iconHighlighted: 'icon-highlighted',
    popupContent: 'popup-content',
    columnFilterWrapper: 'column-filter-wrapper',
    columnFilterOperatorSpacer: 'column-filter-operator-spacer',
    menuContainer: 'menu-container',
    menuItem: 'menu-item',
    menuHeader: 'menu-header',
    menuHeaderCategory: 'menu-header-category',
    menuHeaderName: 'menu-header-name',
    menuItemIcon: 'menu-item-icon',
    menuItemLabel: 'menu-item-label',
    menuDivider: 'menu-divider',
    clearFilterButton: 'clear-filter-button',
    pagination: 'pagination',
    paginationPageInfo: 'pagination-info',
    paginationControls: 'pagination-controls',
    paginationPageSize: 'pagination-page-size',
    paginationPages: 'pagination-pages',
    paginationNavDropdown: 'pagination-nav-dropdown',
    paginationLeft: 'pagination-left',
    paginationCenter: 'pagination-center',
    paginationRight: 'pagination-right',
    paginationDistributed: 'pagination-distributed',
    noWidth: 'no-width',
    rightAlign: 'right',
    centerAlign: 'center',
    leftAlign: 'left'
};
export const win = (typeof window !== 'undefined' ?
    window :
    {});
export const composed = [];
export const userAgent = (win.navigator && win.navigator.userAgent) || '';
export const isChrome = userAgent.indexOf('Chrome') !== -1;
export const isSafari = !isChrome && userAgent.indexOf('Safari') !== -1;
export const isIos = !!win.navigator && (/iPhone|iPod|iPad/i.test(userAgent) ||
    (win.navigator.platform === 'MacIntel' &&
        win.navigator.maxTouchPoints > 1));
export const isTouchDevice = !!('ontouchstart' in win ||
    (win.navigator && win.navigator.maxTouchPoints > 0));
export const getClassName = (classNameKey) => classNamePrefix + rawClassNames[classNameKey];
/* *
 *
 *  Default Export
 *
 * */
export default {
    classNamePrefix,
    version,
    buildDate,
    rawClassNames,
    win,
    composed,
    userAgent,
    isChrome,
    isSafari,
    isIos,
    isTouchDevice,
    getClassName
};

/* *
 *
 *  Grid Summary View
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import SummaryTableRow from './SummaryTableRow.js';
import Globals from '../../Core/Globals.js';
import { applyUserClassNames, makeHTMLElement } from '../../Core/GridUtils.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Renders computed summary rows in dedicated frozen tbody sections above and/or
 * below the scrollable table body.
 */
class SummaryView {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(viewport) {
        this.viewport = viewport;
        this.top = this.createSection('top', 'before');
        this.bottom = this.createSection('bottom', 'after');
    }
    /* *
     *
     *  Methods
     *
     * */
    /**
     * Registers a summary body section.
     *
     * @param position
     * Summary position the section holds.
     *
     * @param sectionPosition
     * Body section placement relative to the main rows.
     */
    createSection(position, sectionPosition) {
        const prefix = Globals.classNamePrefix;
        const tbodyElement = makeHTMLElement('tbody', {
            className: prefix + 'tbody-summary ' + prefix +
                'tbody-summary-' + position
        });
        const section = { position, tbodyElement, rows: [] };
        this.viewport.registerBodySection({
            id: 'summary-' + position,
            position: sectionPosition,
            tbodyElement,
            getRows: () => section.rows,
            getRowByElement: (element) => section.rows.find((row) => row.htmlElement === element),
            getRowById: () => void 0
        });
        return section;
    }
    /**
     * Renders the given summary rows into the top and bottom sections.
     *
     * @param summaryRows
     * Resolved summary rows (values, formats, position).
     */
    async render(summaryRows) {
        await this.renderSection(this.top, summaryRows.filter((row) => row.position === 'top'), true);
        await this.renderSection(this.bottom, summaryRows.filter((row) => row.position !== 'top'), false);
        this.syncHorizontalScroll(this.viewport.tbodyElement.scrollLeft);
        await this.viewport.syncAriaRowIndexes();
    }
    /**
     * Renders one section's rows, reusing existing rows.
     *
     * @param section
     * Target section.
     *
     * @param summaryRows
     * Rows assigned to the section.
     *
     * @param before
     * Whether the section is inserted before the main body.
     */
    async renderSection(section, summaryRows, before) {
        const tableElement = this.viewport.tableElement;
        const { tbodyElement, rows } = section;
        section.className = applyUserClassNames(tbodyElement, section.className, this.viewport.grid.options?.rendering?.rows?.summary?.[section.position]?.className);
        if (summaryRows.length &&
            tbodyElement.parentElement !== tableElement) {
            if (before) {
                tableElement.insertBefore(tbodyElement, this.viewport.tbodyElement);
            }
            else {
                tableElement.appendChild(tbodyElement);
            }
        }
        for (let i = 0, iEnd = summaryRows.length; i < iEnd; ++i) {
            let row = rows[i];
            if (!row) {
                row = new SummaryTableRow(this.viewport, i);
                await row.sync(summaryRows[i], i);
                await row.init();
                await row.render();
                tbodyElement.appendChild(row.htmlElement);
                rows[i] = row;
            }
            else {
                await row.sync(summaryRows[i], i);
                if (!row.htmlElement.isConnected) {
                    tbodyElement.appendChild(row.htmlElement);
                }
            }
        }
        for (let i = rows.length - 1; i >= summaryRows.length; --i) {
            rows[i].destroy();
            rows.length = i;
        }
        if (!rows.length && tbodyElement.parentElement) {
            tbodyElement.remove();
        }
    }
    /**
     * Re-applies per-cell widths and horizontal offset after a reflow.
     */
    reflow() {
        this.reflowSection(this.top);
        this.reflowSection(this.bottom);
        this.syncHorizontalScroll(this.viewport.tbodyElement.scrollLeft);
    }
    /**
     * Reflows a single section's rows.
     *
     * @param section
     * Target section.
     */
    reflowSection(section) {
        for (let i = 0, iEnd = section.rows.length; i < iEnd; ++i) {
            section.rows[i].reflow();
        }
    }
    /**
     * Keeps the frozen rows aligned with the main body horizontal scroll.
     *
     * @param scrollLeft
     * Current horizontal scroll offset of the main body.
     */
    syncHorizontalScroll(scrollLeft) {
        const transform = scrollLeft ? `translateX(${-scrollLeft}px)` : '';
        this.offsetSection(this.top, transform);
        this.offsetSection(this.bottom, transform);
    }
    /**
     * Applies the horizontal offset to a single section.
     *
     * @param section
     * Target section.
     *
     * @param transform
     * Transform to apply to each row.
     */
    offsetSection(section, transform) {
        section.tbodyElement.scrollLeft = 0;
        for (let i = 0, iEnd = section.rows.length; i < iEnd; ++i) {
            section.rows[i].htmlElement.style.transform = transform;
        }
    }
    /**
     * Unregisters the sections and removes all rendered rows.
     */
    destroy() {
        this.destroySection('top', this.top);
        this.destroySection('bottom', this.bottom);
    }
    /**
     * Destroys a single section.
     *
     * @param position
     * Summary position the section holds.
     *
     * @param section
     * Target section.
     */
    destroySection(position, section) {
        this.viewport.unregisterBodySection('summary-' + position);
        for (let i = 0, iEnd = section.rows.length; i < iEnd; ++i) {
            section.rows[i].destroy();
        }
        section.rows.length = 0;
        section.tbodyElement.remove();
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default SummaryView;

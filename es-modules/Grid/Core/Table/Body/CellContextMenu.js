/* *
 *
 *  Grid Cell Context Menu
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *  Authors:
 *  - Mikkel Espolin Birkeland
 *
 * */
'use strict';
import ContextMenu from '../../UI/ContextMenu.js';
import CellContextMenuBuiltInActions from './CellContextMenuBuiltInActions.js';
import { openFocusedSubMenu, renderResolvedCellContextMenuItems } from './CellContextSubMenu.js';
import { addEvent } from '../../../../Shared/Utilities.js';
/* *
 *
 *  Class
 *
 * */
class CellContextMenu extends ContextMenu {
    showAt(cell, clientX, clientY) {
        const wrapper = this.grid.contentWrapper;
        if (!wrapper) {
            return;
        }
        this.cell = cell;
        this.removeCellOutdateListener?.();
        this.removeCellOutdateListener = addEvent(cell, 'outdate', () => {
            this.hide();
            delete this.cell;
        });
        const rect = wrapper.getBoundingClientRect();
        this.cursorAnchorElement = document.createElement('div');
        this.cursorAnchorElement.style.position = 'absolute';
        this.cursorAnchorElement.style.left = (clientX - rect.left) + 'px';
        this.cursorAnchorElement.style.top = (clientY - rect.top) + 'px';
        this.cursorAnchorElement.style.width = '0px';
        this.cursorAnchorElement.style.height = '0px';
        this.cursorAnchorElement.style.pointerEvents = 'none';
        wrapper.appendChild(this.cursorAnchorElement);
        super.show(this.cursorAnchorElement);
    }
    hide() {
        super.hide();
        this.cursorAnchorElement?.remove();
        this.removeCellOutdateListener?.();
        delete this.cursorAnchorElement;
        delete this.removeCellOutdateListener;
    }
    renderContent() {
        const { cell } = this;
        if (!cell) {
            return;
        }
        const items = CellContextMenuBuiltInActions.resolveCellContextMenuItems(cell);
        renderResolvedCellContextMenuItems(this, cell, items);
    }
    onKeyDown(event) {
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            openFocusedSubMenu(this);
            return;
        }
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            return;
        }
        super.onKeyDown(event);
    }
}
export default CellContextMenu;

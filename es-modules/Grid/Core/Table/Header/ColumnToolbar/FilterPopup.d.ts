import type Button from '../../../UI/Button';
import ColumnFiltering from '../../Actions/ColumnFiltering/ColumnFiltering.js';
import Popup from '../../../UI/Popup.js';
/**
 * The column filtering popup.
 */
declare class FilterPopup extends Popup {
    /**
     * The column filtering.
     */
    filtering: ColumnFiltering;
    /**
     * Constructs a column filtering popup.
     *
     * @param filtering
     * The column filtering.
     *
     * @param button
     * The button that opened the popup.
     *
     * @param options
     * Popup options.
     */
    constructor(filtering: ColumnFiltering, button: Button, options?: Popup.Options);
    show(anchorElement?: HTMLElement): void;
    protected renderContent(contentElement: HTMLElement): void;
    protected onKeyDown(event: KeyboardEvent): void;
}
export default FilterPopup;

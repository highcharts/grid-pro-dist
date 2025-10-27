import type ColumnsResizer from '../Actions/ColumnsResizer.js';
import ResizingMode from './ResizingMode.js';
declare class IndependentResizingMode extends ResizingMode {
    readonly type: "independent";
    resize(resizer: ColumnsResizer, diff: number): void;
}
export default IndependentResizingMode;

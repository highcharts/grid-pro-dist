/**
 * Contains all possible class types of the cell renderer registry.
 */
export type CellRendererClassType = CellRendererTypeRegistry[keyof CellRendererTypeRegistry];
/**
 * Contains all possible types of the class registry.
 */
export type CellRendererType = CellRendererClassType['prototype'];
/**
 * Describes the class registry as a record object with class name and their
 * class types (aka class constructor).
 */
export interface CellRendererTypeRegistry {
}
export default CellRendererType;

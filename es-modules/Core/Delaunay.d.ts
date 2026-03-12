/**
 * Delaunay triangulation of a 2D point set.
 */
declare class Delaunay<T extends Float32Array | Float64Array = Float32Array> {
    /**
     * The resulting triangulation as a flat array of triangle vertex indices.
     */
    readonly triangles: Uint32Array;
    /**
     * The input points array.
     */
    readonly points: T;
    /**
     * Sorted and deduplicated point indices used for triangulation.
     */
    private readonly ids;
    /**
     * Numerical tolerance for geometric predicates.
     */
    private readonly epsilon;
    /**
     * Minimum X value used for normalization.
     */
    private readonly minX;
    /**
     * Minimum Y value used for normalization.
     */
    private readonly minY;
    /**
     * Inverse X scale factor used for normalization.
     */
    private readonly invScaleX;
    /**
     * Inverse Y scale factor used for normalization.
     */
    private readonly invScaleY;
    /**
     * Create a new Delaunay triangulation.
     *
     * @param {Float32Array|Float64Array} points
     * A 1D array of points in the format [x0, y0, x1, y1, ...].
     */
    constructor(points: T);
    /**
     * Triangulate the points.
     *
     * @return {Uint32Array}
     * A 1D array of triangle vertex indices.
     */
    private triangulate;
}
export default Delaunay;

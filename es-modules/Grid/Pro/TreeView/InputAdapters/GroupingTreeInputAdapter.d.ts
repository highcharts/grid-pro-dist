import type DataTable from '../../../../Data/DataTable';
import type { TreeIndexBuildResult } from '../TreeViewTypes';
import type { NormalizedTreeInputGroupingOptions } from '../TreeViewOptionsNormalizer';
/**
 * Builds a canonical tree index by grouping flat rows by source columns.
 *
 * @param table
 * Source table.
 *
 * @param input
 * Normalized grouping tree input options.
 *
 * @param idColumn
 * Column ID containing stable row IDs, when configured.
 *
 * @returns
 * Canonical tree index.
 */
export declare function buildIndexFromColumns(table: DataTable, input: NormalizedTreeInputGroupingOptions, idColumn?: string): TreeIndexBuildResult;

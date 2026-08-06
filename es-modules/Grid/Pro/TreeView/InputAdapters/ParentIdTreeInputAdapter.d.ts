import type DataTable from '../../../../Data/DataTable';
import type { TreeIndexBuildResult } from '../TreeViewTypes';
import type { NormalizedTreeInputParentIdOptions } from '../TreeViewOptionsNormalizer';
/**
 * Builds a canonical tree index from flat columns using `id` and `parentId`.
 *
 * @param table
 * Source table.
 *
 * @param input
 * Normalized tree input options.
 *
 * @param idColumn
 * Column ID containing stable row IDs, when configured.
 *
 * @returns
 * Canonical tree index.
 */
export declare function buildIndexFromColumns(table: DataTable, input: NormalizedTreeInputParentIdOptions, idColumn?: string): TreeIndexBuildResult;

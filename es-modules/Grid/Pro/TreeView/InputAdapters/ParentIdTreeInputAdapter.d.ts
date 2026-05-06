import type { ColumnCollection } from '../../../../Data/DataTable';
import type { TreeIndexBuildResult } from '../TreeViewTypes';
import type { NormalizedTreeInputParentIdOptions } from '../TreeViewOptionsNormalizer';
/**
 * Builds a canonical tree index from flat columns using `id` and `parentId`.
 *
 * @param columns
 * Source columns.
 *
 * @param idColumn
 * Column ID containing stable row IDs.
 *
 * @param input
 * Normalized tree input options.
 *
 * @returns
 * Canonical tree index.
 */
export declare function buildIndexFromColumns(columns: ColumnCollection, idColumn: string, input: NormalizedTreeInputParentIdOptions): TreeIndexBuildResult;

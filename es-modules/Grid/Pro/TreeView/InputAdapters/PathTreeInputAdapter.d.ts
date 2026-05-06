import type { ColumnCollection } from '../../../../Data/DataTable';
import type { TreeIndexBuildResult } from '../TreeViewTypes';
import type { NormalizedTreeInputPathOptions } from '../TreeViewOptionsNormalizer';
/**
 * Builds a canonical tree index from full path definitions.
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
export declare function buildIndexFromColumns(columns: ColumnCollection, idColumn: string, input: NormalizedTreeInputPathOptions): TreeIndexBuildResult;

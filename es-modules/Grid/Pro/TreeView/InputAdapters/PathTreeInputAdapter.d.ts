import type DataTable from '../../../../Data/DataTable';
import type { TreeIndexBuildResult } from '../TreeViewTypes';
import type { NormalizedTreeInputPathOptions } from '../TreeViewOptionsNormalizer';
/**
 * Builds a canonical tree index from full path definitions.
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
export declare function buildIndexFromColumns(table: DataTable, input: NormalizedTreeInputPathOptions, idColumn?: string): TreeIndexBuildResult;

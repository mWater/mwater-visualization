import { DataSource, Expr, Schema } from "mwater-expressions";
import { JsonQLFilter } from "..";
/** Perform query to find quickfilter values for text and text[] expressions
 * text[] expressions are tricky as they need a special query
 * In order to filter the text[] queries, filters must use table "value" and filter on no column
 */
export declare function findExprValues(expr: Expr, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[] | undefined, offset: number | undefined, limit: number | undefined, callback: (err: any, values?: string[]) => void): void;

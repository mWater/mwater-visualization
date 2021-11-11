import { JsonQLFilter } from "../JsonQLFilter";
import { Expr } from "mwater-expressions";
/** Data source that returns values for text-based and id-based quickfilters. Allows client-server model that supports sharing */
export interface QuickfiltersDataSource {
    /** Gets the values of the quickfilter at index */
    getValues(index: number, expr: Expr, filters: JsonQLFilter[], offset: number | null, limit: number, callback: (error: any, values?: any[]) => void): void;
}

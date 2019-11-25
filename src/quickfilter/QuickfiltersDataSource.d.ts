import { JsonQLFilter } from "..";

/** Data source that returns values for text-based and id-based quickfilters. Allows client-server model that supports sharing */
export default class QuickfiltersDataSource {
  /** Gets the values of the quickfilter at index */
  getValues(index: number, expr: Expr, filters: JsonQLFilter[], offset: number, limit: number, callback: (values: any[]) => void): void
}
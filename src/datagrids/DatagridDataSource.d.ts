import { DatagridDesign } from "./DatagridDesign"
import { JsonQLFilter } from ".."
import { Row } from "mwater-expressions"
import { QuickfiltersDataSource } from "../quickfilter/QuickfiltersDataSource"

/** Data source for a datagrid that allows client-server model that supports sharing of datagrids */
export default class DatagridDataSource {
  /** Gets the rows specified */
  getRows(design: DatagridDesign, offset: number, limit: number, filters: JsonQLFilter[] | undefined, callback: (error: any, rows: Row[]) => void): void

  /** Gets the quickfilters data source */
  getQuickfiltersDataSource(): QuickfiltersDataSource
}
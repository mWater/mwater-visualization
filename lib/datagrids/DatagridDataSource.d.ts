import { Row } from "mwater-expressions";
import { DatagridDesign, JsonQLFilter } from "..";
import { QuickfiltersDataSource } from "../quickfilter/QuickfiltersDataSource";
export default class DatagridDataSource {
    /** Gets the rows specified */
    getRows(design: DatagridDesign, offset: number, limit: number, filters: JsonQLFilter[] | undefined, callback: (error: any, rows: Row[]) => void): void;
    /** Gets the quickfilters data source */
    getQuickfiltersDataSource(): QuickfiltersDataSource;
}

import DatagridDataSource from "./DatagridDataSource";
import { DataSource, Row, Schema } from "mwater-expressions";
import { DatagridDesign } from "./DatagridDesign";
import { JsonQLFilter } from "../JsonQLFilter";
/** Uses direct DataSource queries */
export default class DirectDatagridDataSource implements DatagridDataSource {
    options: {
        schema: Schema;
        dataSource: DataSource;
    };
    constructor(options: {
        schema: Schema;
        dataSource: DataSource;
    });
    /** Gets the rows specified */
    getRows(design: DatagridDesign, offset: number, limit: number, filters: JsonQLFilter[] | undefined, callback: (error: any, rows: Row[]) => void): void;
    getQuickfiltersDataSource(): {
        getValues: (index: any, expr: any, filters: any, offset: any, limit: any, callback: any) => void;
    };
}

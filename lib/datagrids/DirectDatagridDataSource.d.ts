import { DataSource, Schema } from "mwater-expressions";
export default class DirectDatagridDataSource {
    options: {
        schema: Schema;
        dataSource: DataSource;
    };
    constructor(options: {
        schema: Schema;
        dataSource: DataSource;
    });
    getRows(design: any, offset: any, limit: any, filters: any, callback: any): void;
    getQuickfiltersDataSource(): {
        getValues: (index: any, expr: any, filters: any, offset: any, limit: any, callback: any) => void;
    };
}

export default class DirectDatagridDataSource {
    constructor(options: any);
    getRows(design: any, offset: any, limit: any, filters: any, callback: any): any;
    getQuickfiltersDataSource(): {
        getValues: (index: any, expr: any, filters: any, offset: any, limit: any, callback: any) => void;
    };
}

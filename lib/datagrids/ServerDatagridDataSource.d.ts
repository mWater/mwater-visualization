/// <reference types="jquery" />
import DatagridDataSource from "./DatagridDataSource";
export default class ServerDatagridDataSource extends DatagridDataSource {
    constructor(options: any);
    getRows(design: any, offset: any, limit: any, filters: any, callback: any): JQuery.jqXHR<any>;
    getQuickfiltersDataSource(): ServerQuickfilterDataSource;
}
declare class ServerQuickfilterDataSource {
    constructor(options: any);
    getValues(index: any, expr: any, filters: any, offset: any, limit: any, callback: any): JQuery.jqXHR<any>;
}
export {};

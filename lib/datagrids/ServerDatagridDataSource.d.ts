/// <reference types="jquery" />
import DatagridDataSource from "./DatagridDataSource";
import { DatagridDesign } from "..";
export interface ServerDatagridDataSourceOptions {
    /** API url to use for talking to mWater server */
    apiUrl: string;
    /** client id to use for talking to mWater server */
    client?: string;
    /** share id to use for talking to mWater server */
    share?: string;
    /** datagrid id to use on server */
    datagridId: string;
    /** revision to use to allow caching */
    rev?: number;
}
/** Uses mWater server to get datagrid data to allow sharing with unprivileged users */
export default class ServerDatagridDataSource extends DatagridDataSource {
    options: ServerDatagridDataSourceOptions;
    constructor(options: ServerDatagridDataSourceOptions);
    getRows(design: DatagridDesign, offset: any, limit: any, filters: any, callback: any): JQuery.jqXHR<any>;
    getQuickfiltersDataSource(): ServerQuickfilterDataSource;
}
interface ServerQuickfilterDataSourceOptions {
    /** API url to use for talking to mWater server */
    apiUrl: string;
    /** client id to use for talking to mWater server */
    client?: string;
    /** share id to use for talking to mWater server */
    share?: string;
    /** datagrid id to use on server */
    datagridId: string;
    /** revision to use to allow caching */
    rev?: number;
}
declare class ServerQuickfilterDataSource {
    options: ServerQuickfilterDataSourceOptions;
    constructor(options: ServerQuickfilterDataSourceOptions);
    getValues(index: any, expr: any, filters: any, offset: any, limit: any, callback: any): JQuery.jqXHR<any>;
}
export {};

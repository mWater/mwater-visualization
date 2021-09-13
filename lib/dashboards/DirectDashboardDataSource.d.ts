import DirectWidgetDataSource from "../widgets/DirectWidgetDataSource";
import DashboardDataSource from "./DashboardDataSource";
import { Schema, DataSource } from "mwater-expressions";
/** Uses direct DataSource queries */
export default class DirectDashboardDataSource extends DashboardDataSource {
    options: {
        /** schema to use */
        schema: any;
        /** data source to use */
        dataSource: any;
        /** API url to use for talking to mWater server */
        apiUrl?: string | undefined;
        /** client id to use for talking to mWater server */
        client?: string | undefined;
    };
    /** Create dashboard data source that uses direct jsonql calls */
    constructor(options: {
        /** schema to use */
        schema: Schema;
        /** data source to use */
        dataSource: DataSource;
        /** API url to use for talking to mWater server */
        apiUrl?: string;
        /** client id to use for talking to mWater server */
        client?: string;
    });
    getWidgetDataSource(widgetType: any, widgetId: any): DirectWidgetDataSource;
    getQuickfiltersDataSource(): {
        getValues: (index: any, expr: any, filters: any, offset: any, limit: any, callback: any) => void;
    };
}

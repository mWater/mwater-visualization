/// <reference types="jquery" />
import { DataSource, Expr } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter";
import { QuickfiltersDataSource } from "../quickfilter/QuickfiltersDataSource";
import { MapDesign, MapLayerView } from "../maps/MapDesign";
import { MapDataSource } from "../maps/MapDataSource";
import { MapLayerDataSource } from "../maps/MapLayerDataSource";
import { WidgetDataSource } from "../widgets/WidgetDataSource";
interface ServerDashboardDataSourceOptions {
    /** API url to use for talking to mWater server */
    apiUrl: string;
    /** client id to use for talking to mWater server */
    client?: string;
    /** share id to use for talking to mWater server */
    share?: string;
    /** dashboard id to use on server */
    dashboardId: string;
    /** data source that is used for determining cache expiry */
    dataSource: DataSource;
    /** revision to use to allow caching */
    rev: string;
}
interface ServerWidgetDataSourceOptions extends ServerDashboardDataSourceOptions {
    widgetId: string;
}
interface ServerWidgetMapDataSourceOptions extends ServerDashboardDataSourceOptions {
    widgetId: string;
    design: MapDesign;
}
/** Uses mWater server to get widget data to allow sharing with unprivileged users */
export default class ServerDashboardDataSource {
    options: ServerDashboardDataSourceOptions;
    constructor(options: ServerDashboardDataSourceOptions);
    getWidgetDataSource(widgetType: string, widgetId: string): ServerWidgetDataSource;
    getQuickfiltersDataSource(): ServerQuickfilterDataSource;
}
declare class ServerQuickfilterDataSource implements QuickfiltersDataSource {
    options: ServerDashboardDataSourceOptions;
    constructor(options: ServerDashboardDataSourceOptions);
    getValues(index: number, expr: Expr, filters: JsonQLFilter[], offset: number, limit: number, callback: (error: any, values?: any[]) => void): void;
}
declare class ServerWidgetDataSource {
    options: ServerWidgetDataSourceOptions;
    constructor(options: ServerWidgetDataSourceOptions);
    getData(design: any, filters: JsonQLFilter[], callback: (error: any, data?: any) => void): JQuery.jqXHR<any>;
    getMapDataSource(design: any): ServerWidgetMapDataSource;
    getImageUrl(imageId: string, height?: number): string;
}
declare class ServerWidgetMapDataSource implements MapDataSource {
    options: ServerWidgetMapDataSourceOptions;
    constructor(options: ServerWidgetMapDataSourceOptions);
    getLayerDataSource(layerId: string): ServerWidgetLayerDataSource;
    getBounds(design: MapDesign, filters: JsonQLFilter[], callback: (error: any, bounds?: {
        w: number;
        n: number;
        e: number;
        s: number;
    } | null) => void): void;
}
interface ServerWidgetLayerDataSourceOptions extends ServerDashboardDataSourceOptions {
    widgetId: string;
    /** Layer view to use */
    layerView: MapLayerView;
}
declare class ServerWidgetLayerDataSource implements MapLayerDataSource {
    options: ServerWidgetLayerDataSourceOptions;
    constructor(options: ServerWidgetLayerDataSourceOptions);
    getTileUrl(design: any, filters: JsonQLFilter[]): any;
    getUtfGridUrl(design: any, filters: JsonQLFilter[]): string | null;
    /** Get the url for vector tile source with an expiry time. Only for layers of type "VectorTile"
     * @param createdAfter ISO 8601 timestamp requiring that tile source on server is created after specified datetime
     */
    getVectorTileUrl(layerDesign: any, filters: JsonQLFilter[], createdAfter: string): Promise<{
        url: string;
        expires: string;
    }>;
    getPopupWidgetDataSource(design: any, widgetId: string): ServerWidgetLayerPopupWidgetDataSource;
    createUrl(filters: JsonQLFilter[], extension: string): string;
    createLegacyUrl(design: any, extension: string, filters: JsonQLFilter[]): string;
}
interface ServerWidgetLayerPopupDataSourceOptions extends ServerDashboardDataSourceOptions {
    widgetId: string;
    /** layer view of map inside widget */
    layerView: MapLayerView;
    /** id of popup widget */
    popupWidgetId: string;
}
declare class ServerWidgetLayerPopupWidgetDataSource implements WidgetDataSource {
    options: ServerWidgetLayerPopupDataSourceOptions;
    constructor(options: ServerWidgetLayerPopupDataSourceOptions);
    getData(design: any, filters: JsonQLFilter[], callback: (error: any, data?: any) => void): void;
    /** For map widgets, the following is required */
    getMapDataSource(design: MapDesign): MapDataSource;
    getImageUrl(imageId: string, height?: number): string;
}
export {};

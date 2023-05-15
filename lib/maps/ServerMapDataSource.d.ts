/// <reference types="jquery" />
import { DataSource, Expr, Schema } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter";
import { MapDesign, MapLayerView } from "./MapDesign";
import { MapDataSource } from "./MapDataSource";
import { MapLayerDataSource } from "./MapLayerDataSource";
import { WidgetDataSource } from "../widgets/WidgetDataSource";
import { QuickfiltersDataSource } from "../quickfilter/QuickfiltersDataSource";
interface ServerMapDataSourceOptions {
    /** schema to use */
    schema: Schema;
    /** data source to use */
    dataSource: DataSource;
    /** design of entire map */
    design: MapDesign;
    /** share id to use for talking to mWater server */
    share?: string;
    /** API url to use for talking to mWater server */
    apiUrl: string;
    /** client id to use for talking to mWater server */
    client?: string;
    /** map id to use on server */
    mapId: string;
    /** revision to use to allow caching */
    rev: string;
}
interface ServerMapLayerDataSourceOptions extends ServerMapDataSourceOptions {
    layerView: MapLayerView;
}
/** Get map urls for map stored on server */
export default class ServerMapDataSource implements MapDataSource {
    options: ServerMapDataSourceOptions;
    constructor(options: ServerMapDataSourceOptions);
    getLayerDataSource(layerId: string): ServerLayerDataSource;
    getBounds(design: MapDesign, filters: JsonQLFilter[], callback: (error: any, bounds?: {
        w: number;
        n: number;
        e: number;
        s: number;
    } | null) => void): void;
    getQuickfiltersDataSource(): ServerQuickfilterDataSource;
}
declare class ServerLayerDataSource implements MapLayerDataSource {
    options: ServerMapLayerDataSourceOptions;
    constructor(options: ServerMapLayerDataSourceOptions);
    getTileUrl(design: any, filters: JsonQLFilter[]): any;
    getUtfGridUrl(design: any, filters: JsonQLFilter[]): string | null;
    /** Get the url for vector tile source with an expiry time. Only for layers of type "VectorTile"
     * @param createdAfter ISO 8601 timestamp requiring that tile source on server is created after specified datetime
     */
    getVectorTileUrl(layerDesign: any, filters: JsonQLFilter[], createdAfter: string): Promise<{
        url: string;
        expires: string;
    }>;
    getPopupWidgetDataSource(design: any, widgetId: string): ServerMapLayerPopupWidgetDataSource;
    createUrl(filters: JsonQLFilter[], extension: string): string;
    createLegacyUrl(design: any, extension: string, filters: JsonQLFilter[]): string;
}
interface ServerMapLayerPopupWidgetDataSourceOptions {
    /** API url to use for talking to mWater server */
    apiUrl: string;
    /** client id to use for talking to mWater server */
    client?: string;
    /** share id to use for talking to mWater server */
    share?: string;
    /** map id to use on server */
    mapId: string;
    /** revision to use to allow caching */
    rev: string;
    /** Layer id to use */
    layerId: string;
    /** Popup widget id to use */
    popupWidgetId: string;
}
declare class ServerMapLayerPopupWidgetDataSource implements WidgetDataSource {
    options: ServerMapLayerPopupWidgetDataSourceOptions;
    constructor(options: ServerMapLayerPopupWidgetDataSourceOptions);
    getData(design: any, filters: JsonQLFilter[], callback: (error: any, data?: any) => void): JQuery.jqXHR<any>;
    getImageUrl(imageId: string, height?: number): string;
}
declare class ServerQuickfilterDataSource implements QuickfiltersDataSource {
    options: ServerMapDataSourceOptions;
    constructor(options: ServerMapDataSourceOptions);
    getValues(index: number, expr: Expr, filters: JsonQLFilter[], offset: number, limit: number, callback: (error: any, values?: any[]) => void): void;
}
export {};

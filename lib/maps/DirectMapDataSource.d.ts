import { DataSource, Schema } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter";
import { MapDesign } from "./MapDesign";
import { MapDataSource } from "./MapDataSource";
import { VectorTileCTE, VectorTileSourceLayer } from "./Layer";
import { MapLayerDataSource } from "./MapLayerDataSource";
interface DirectMapDataSourceOptions {
    /** schema to use */
    schema: Schema;
    /** general data source */
    dataSource: DataSource;
    /** design of entire map */
    design: MapDesign;
    /** API url to use for talking to mWater server */
    apiUrl: string;
    /** client id to use for talking to mWater server */
    client?: string;
}
export default class DirectMapDataSource implements MapDataSource {
    options: DirectMapDataSourceOptions;
    constructor(options: DirectMapDataSourceOptions);
    getLayerDataSource(layerId: string): MapLayerDataSource;
    getBounds(design: MapDesign, filters: JsonQLFilter[], callback: (error: any, bounds?: {
        w: number;
        n: number;
        e: number;
        s: number;
    } | null) => void): void;
}
/** Interface for a request made to get a token for vector tiles.
 * The response is a token that can be used to get the actual tiles.
 * The token is a string that is passed to the server as a query parameter.
 * This type of request
 */
export interface VectorTileDirectTokenRequest {
    /** Layers to include in the resulting tiles */
    layers: VectorTileSourceLayer[];
    /** Common table expressions of the tiles */
    ctes: VectorTileCTE[];
    /** Requests that the created tiles not be based on data older than */
    createdAfter?: string;
    /** Earliest expiry of the token (ISO 8601 datetime) */
    expiresAfter: string;
    /** Enforced minimum zoom level */
    minZoom?: number;
    /** Enforced maximum zoom level */
    maxZoom?: number;
}
export {};

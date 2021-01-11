import { DataSource, Schema } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter";
import { MapDesign } from "./MapDesign";
import { MapDataSource } from "./MapDataSource";
import { MapLayerDataSource } from './MapLayerDataSource';
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
export {};

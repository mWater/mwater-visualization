import { DataSource, Schema } from "mwater-expressions";
export interface MWaterLoaderOptions {
    /** e.g. "https://api.mwater.co/v3/". required */
    apiUrl: string;
    /** client id if logged in. optional */
    client?: string;
    /** share if using a share to get schema. optional */
    share?: string;
    /** Load schema as a specific user (for shared dashboards, etc). optional */
    asUser?: string;
    /** Extra tables to load in schema. Forms are not loaded by default as they are too many */
    extraTables: string[];
    /** False to disable local caching of queries. Default true */
    localCaching?: boolean;
    /** Locales of the schema to load. Default is all. */
    locales?: string[];
}
/** Loads a schema and data source that is specific to mWater server */
export default function mWaterLoader(options: MWaterLoaderOptions, callback: (error: any, config?: {
    schema: Schema;
    dataSource: DataSource;
}) => void): void;
export default function mWaterLoader(options: MWaterLoaderOptions): Promise<{
    schema: Schema;
    dataSource: DataSource;
}>;

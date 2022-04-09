import React, { ReactElement } from "react";
import { DataSource, Schema } from "mwater-expressions";
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent";
import LoadingComponent from "react-library/lib/LoadingComponent";
import MWaterContextComponent from "./MWaterContextComponent";
export default class MWaterLoaderComponent extends AsyncLoadComponent<{
    apiUrl: string;
    client?: string;
    share?: string;
    /**  user id of logged in user */
    user?: string;
    /**  Load schema as a specific user (for shared dashboards, etc) */
    asUser?: string;
    /**  Extra tables to load in schema. Forms are not loaded by default as they are too many */
    extraTables?: string[];
    /**  Called when extra tables are changed and schema will be reloaded */
    onExtraTablesChange?: (extraTables: string[]) => void;
    /**  Override default add layer component. See AddLayerComponent for details */
    addLayerElementFactory?: any;
    children: (error: any, config?: {
        schema: Schema;
        dataSource: DataSource;
    }) => ReactElement<any>;
    /** Custom error formatter that returns React node or string, gets passed the error response from server */
    errorFormatter: (data: any, defaultError: string) => string;
}, {
    error: any;
    schema: Schema | null;
    dataSource: DataSource | null;
    loading: boolean;
}> {
    mounted: boolean;
    constructor(props: any);
    isLoadNeeded(newProps: any, oldProps: any): boolean;
    load(props: any, prevProps: any, callback: any): void;
    render(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.CElement<import("react-library/lib/LoadingComponent").LoadingComponentProps, LoadingComponent> | React.CElement<{
        apiUrl: string;
        client?: string | undefined;
        user?: string | undefined;
        schema: Schema;
        extraTables?: string[] | undefined;
        onExtraTablesChange?: ((extraTables: string[]) => void) | undefined; /**  Called when extra tables are changed and schema will be reloaded */
        addLayerElementFactory?: any;
    }, MWaterContextComponent>;
}

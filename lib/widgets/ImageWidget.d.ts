import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import Widget, { CreateViewElementOptions } from "./Widget";
export default class ImageWidget extends Widget {
    createViewElement(options: CreateViewElementOptions): React.CElement<{
        schema: Schema;
        dataSource: DataSource;
        widgetDataSource: import("./WidgetDataSource").WidgetDataSource;
        filters: import("..").JsonQLFilter[];
        design: object;
        onDesignChange: ((design: object) => void) | null | undefined;
        width: number | undefined;
        height: number | undefined;
        singleRowTable: string | undefined;
    }, React.Component<{
        schema: Schema;
        dataSource: DataSource;
        widgetDataSource: import("./WidgetDataSource").WidgetDataSource;
        filters: import("..").JsonQLFilter[];
        design: object;
        onDesignChange: ((design: object) => void) | null | undefined;
        width: number | undefined;
        height: number | undefined;
        singleRowTable: string | undefined;
    }, any, any>>;
    getData(design: any, schema: Schema, dataSource: DataSource, filters: any, callback: any): any;
    isAutoHeight(): boolean;
    getFilterableTables(design: any, schema: Schema): any[];
}

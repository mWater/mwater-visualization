import React from "react";
import { DataSource, Expr, Schema } from "mwater-expressions";
import Widget, { CreateViewElementOptions } from "./Widget";
import { JsonQLFilter } from "..";
/** Image widget. Design is */
export interface ImageWidgetDesign {
    /** arbitrary url of image if using url */
    imageUrl?: string | null;
    /** uid of image if on server */
    uid?: string | null;
    /** image or imagelist expression if using expression */
    expr?: Expr;
    /** string caption */
    caption?: string | null;
    /** optional rotation in degrees for imageUrl or uid */
    rotation?: number;
    /** "top"/"bottom". Defaults to "bottom" */
    captionPosition?: "top" | "bottom";
    /** Optional URL to open when clicked */
    url?: string;
    /** Opens URL in same tab if true*/
    openUrlInSameTab?: boolean;
}
export default class ImageWidget extends Widget {
    createViewElement(options: CreateViewElementOptions): React.CElement<{
        schema: Schema;
        dataSource: DataSource;
        widgetDataSource: import("./WidgetDataSource").WidgetDataSource;
        filters: JsonQLFilter[];
        design: object;
        onDesignChange: ((design: object) => void) | null | undefined;
        width: number | undefined;
        height: number | undefined;
        singleRowTable: string | undefined;
    }, React.Component<{
        schema: Schema;
        dataSource: DataSource;
        widgetDataSource: import("./WidgetDataSource").WidgetDataSource;
        filters: JsonQLFilter[];
        design: object;
        onDesignChange: ((design: object) => void) | null | undefined;
        width: number | undefined;
        height: number | undefined;
        singleRowTable: string | undefined;
    }, any, any>>;
    getData(design: ImageWidgetDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any): any;
    isAutoHeight(): boolean;
    getFilterableTables(design: any, schema: Schema): any[];
}

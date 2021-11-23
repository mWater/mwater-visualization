import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import Widget, { CreateViewElementOptions } from "../Widget";
export default class TextWidget extends Widget {
    createViewElement(options: CreateViewElementOptions): React.CElement<{
        schema: Schema;
        dataSource: DataSource;
        widgetDataSource: import("../WidgetDataSource").WidgetDataSource;
        filters: import("../..").JsonQLFilter[];
        design: object;
        onDesignChange: ((design: object) => void) | null | undefined;
        width: number | undefined;
        height: number | undefined;
        singleRowTable: string | undefined;
        namedStrings: {
            [key: string]: string;
        } | undefined;
        ref: ((widget: any) => void) | undefined;
    }, any>;
    getData(design: any, schema: Schema, dataSource: DataSource, filters: any, callback: any): void;
    isAutoHeight(): boolean;
    getExprItems(items: any): any;
    getFilterableTables(design: any, schema: Schema): any[];
    getTOCEntries(design: any, namedStrings: any): any;
}

import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import Widget from "./Widget";
export default class ImageWidget extends Widget {
    createViewElement(options: any): React.CElement<{
        schema: any;
        dataSource: any;
        widgetDataSource: any;
        filters: any;
        design: any;
        onDesignChange: any;
        width: any;
        height: any;
        singleRowTable: any;
    }, React.Component<{
        schema: any;
        dataSource: any;
        widgetDataSource: any;
        filters: any;
        design: any;
        onDesignChange: any;
        width: any;
        height: any;
        singleRowTable: any;
    }, any, any>>;
    getData(design: any, schema: Schema, dataSource: DataSource, filters: any, callback: any): any;
    isAutoHeight(): boolean;
    getFilterableTables(design: any, schema: Schema): any[];
}

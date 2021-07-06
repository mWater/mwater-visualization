import React from "react";
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
    getData(design: any, schema: any, dataSource: any, filters: any, callback: any): any;
    isAutoHeight(): boolean;
    getFilterableTables(design: any, schema: any): any[];
}

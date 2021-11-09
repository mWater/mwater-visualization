import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import Widget from "../Widget";
export default class TextWidget extends Widget {
    createViewElement(options: any): React.ReactSVGElement;
    getData(design: any, schema: Schema, dataSource: DataSource, filters: any, callback: any): void;
    isAutoHeight(): boolean;
    getExprItems(items: any): any;
    getFilterableTables(design: any, schema: Schema): any[];
    getTOCEntries(design: any, namedStrings: any): any;
}

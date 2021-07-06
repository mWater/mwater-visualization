import React from "react";
import Widget from "../Widget";
export default class TextWidget extends Widget {
    createViewElement(options: any): React.ReactSVGElement;
    getData(design: any, schema: any, dataSource: any, filters: any, callback: any): void;
    isAutoHeight(): boolean;
    getExprItems(items: any): any;
    getFilterableTables(design: any, schema: any): any[];
    getTOCEntries(design: any, namedStrings: any): any;
}

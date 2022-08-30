import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import Widget, { CreateViewElementOptions } from "../Widget";
import { JsonQLFilter } from "../../JsonQLFilter";
import { HtmlItem } from "../../richtext/ItemsHtmlConverter";
import { HtmlItemExpr } from "../../richtext/ExprItemsHtmlConverter";
import { TextWidgetDesign } from "./TextWidgetDesign";
export default class TextWidget extends Widget {
    createViewElement(options: CreateViewElementOptions): React.CElement<{
        schema: Schema;
        dataSource: DataSource;
        widgetDataSource: import("../WidgetDataSource").WidgetDataSource;
        filters: JsonQLFilter[];
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
    getData(design: any, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any): void;
    isAutoHeight(): boolean;
    getExprItems(items: HtmlItem[]): HtmlItemExpr[];
    getFilterableTables(design: TextWidgetDesign, schema: Schema): string[];
    getTOCEntries(design: any, namedStrings: any): any;
}

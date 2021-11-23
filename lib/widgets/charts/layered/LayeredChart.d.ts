import React from "react";
import Chart, { ChartCreateViewElementOptions } from "../Chart";
import { DataSource, Schema } from "mwater-expressions";
import { LayeredChartDesign } from "./LayeredChartDesign";
import { WidgetDataSource } from "../../WidgetDataSource";
import { JsonQLFilter } from "../../..";
export default class LayeredChart extends Chart {
    cleanDesign(design: LayeredChartDesign, schema: Schema): LayeredChartDesign;
    validateDesign(design: LayeredChartDesign, schema: Schema): string | null | undefined;
    isEmpty(design: any): boolean;
    createDesignerElement(options: any): React.FunctionComponentElement<{
        schema: any;
        dataSource: any;
        design: LayeredChartDesign;
        filters: any;
        onDesignChange: (design: any) => any;
    }>;
    getData(design: any, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[] | null, callback: any): void;
    createViewElement(options: ChartCreateViewElementOptions): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    createDropdownItems(design: any, schema: Schema, widgetDataSource: WidgetDataSource, filters: any): {
        label: string;
        icon: string;
        onClick: any;
    }[];
    createDataTable(design: LayeredChartDesign, schema: Schema, dataSource: DataSource, data: any, locale: string): any[][];
    getFilterableTables(design: LayeredChartDesign, schema: Schema): string[];
    getPlaceholderIcon(): string;
}

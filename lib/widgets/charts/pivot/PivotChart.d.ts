import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import Chart, { ChartCreateViewElementOptions } from "../Chart";
import { WidgetDataSource } from "../../WidgetDataSource";
import { PivotChartDesign } from "./PivotChartDesign";
import { JsonQLFilter } from "../../../JsonQLFilter";
export default class PivotChart extends Chart {
    cleanDesign(design: PivotChartDesign, schema: Schema): PivotChartDesign;
    validateDesign(design: PivotChartDesign, schema: Schema): string | null;
    isAutoHeight(): boolean;
    isEmpty(design: any): boolean;
    hasDesignerPreview(): boolean;
    getEditLabel(): string;
    createDesignerElement(options: any): React.FunctionComponentElement<{
        schema: any;
        dataSource: any;
        design: PivotChartDesign;
        filters: any;
        onDesignChange: (design: any) => any;
    }>;
    getData(design: PivotChartDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: (error: any, data?: any) => void): void;
    createViewElement(options: ChartCreateViewElementOptions): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    createDropdownItems(design: any, schema: Schema, widgetDataSource: WidgetDataSource, filters: any): never[];
    createDataTable(design: PivotChartDesign, schema: Schema, dataSource: DataSource, data: any, locale: string): (string | undefined)[][];
    getFilterableTables(design: any, schema: Schema): any[];
    getPlaceholderIcon(): string;
}

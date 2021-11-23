import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import Chart, { ChartCreateViewElementOptions } from "../Chart";
import TableChartViewComponent from "./TableChartViewComponent";
export default class TableChart extends Chart {
    cleanDesign(design: any, schema: Schema): any;
    validateDesign(design: any, schema: Schema): string | null;
    isEmpty(design: any): boolean;
    createDesignerElement(options: any): React.FunctionComponentElement<{
        schema: any;
        design: any;
        dataSource: any;
        onDesignChange: (design: any) => any;
    }>;
    getData(design: any, schema: Schema, dataSource: DataSource, filters: any, callback: any): Promise<import("mwater-expressions").Row[]> & void;
    createViewElement(options: ChartCreateViewElementOptions): React.CElement<import("./TableChartViewComponent").TableChartViewComponentProps, TableChartViewComponent>;
    createDataTable(design: any, schema: Schema, dataSource: DataSource, data: any, locale: any): any[][];
    getFilterableTables(design: any, schema: Schema): any[];
    getPlaceholderIcon(): string;
}

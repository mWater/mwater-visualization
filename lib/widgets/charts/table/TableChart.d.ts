import React from "react";
import { DataSource, Expr, Schema } from "mwater-expressions";
import Chart, { ChartCreateViewElementOptions } from "../Chart";
import TableChartViewComponent from "./TableChartViewComponent";
import { Axis } from "../../../axes/Axis";
import { JsonQLFilter } from "../../../JsonQLFilter";
export interface TableChartDesign {
    version?: number;
    /** table to use for data source */
    table: string;
    titleText?: string;
    columns: TableChartColumn[];
    /** optional logical expression to filter by */
    filter: Expr;
    orderings: TableChartOrdering[];
    /** optional limit to number of rows */
    limit?: number;
}
export interface TableChartColumn {
    /** unique id of column (uuid v4) */
    id: string;
    /** header text */
    headerText?: string;
    /** axis that creates the text value of the column. NOTE: now no longer using as an axis, but only using expression within! */
    textAxis?: Axis | null;
    /** optional d3-format format for numeric values. Default if null is "," */
    format?: string | null;
    /** Summarize in the table footer, only applicable for number type column expressions */
    summarize?: boolean;
    summaryType?: "sum" | "avg" | "min" | "max";
    /** color axis for background of cells */
    backgroundColorAxis?: Axis | null;
}
export interface TableChartOrdering {
    /** axis that creates the order expression. NOTE: now no longer using as an axis, but only using expression within! */
    axis: Axis | null;
    direction: "asc" | "desc";
}
/**
 * Table control
 */
export default class TableChart extends Chart {
    cleanDesign(design: TableChartDesign, schema: Schema): TableChartDesign;
    validateDesign(design: any, schema: Schema): string | null;
    isEmpty(design: any): boolean;
    createDesignerElement(options: any): React.FunctionComponentElement<{
        schema: any;
        design: TableChartDesign;
        dataSource: any;
        onDesignChange: (design: any) => any;
    }>;
    getData(design: TableChartDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: (error: any, data?: any) => void): void;
    createViewElement(options: ChartCreateViewElementOptions): React.CElement<import("./TableChartViewComponent").TableChartViewComponentProps, TableChartViewComponent>;
    createDataTable(design: any, schema: Schema, dataSource: DataSource, data: any, locale: any): any[][];
    getFilterableTables(design: any, schema: Schema): any[];
    getPlaceholderIcon(): string;
}

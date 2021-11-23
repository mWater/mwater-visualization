import React from "react";
import { DataSource, Expr, Schema } from "mwater-expressions";
import Chart, { ChartCreateViewElementOptions } from "../Chart";
import { Axis } from "../../../axes/Axis";
import { JsonQLFilter } from "../../..";
export interface CalendarChartDesign {
    /** table to use for data source */
    table: string;
    /** title text */
    titleText: string;
    /** date axis to use */
    dateAxis: Axis | null;
    /** axis for value */
    valueAxis: Axis | null;
    /** optional logical expression to filter by */
    filter: Expr;
    /** Optional cell color (default "#FDAE61") */
    cellColor?: string;
    /** Version of chart */
    version?: number;
}
/** Chart with a calendar by day */
export default class CalendarChart extends Chart {
    cleanDesign(design: CalendarChartDesign, schema: Schema): CalendarChartDesign;
    validateDesign(design: CalendarChartDesign, schema: Schema): string | null;
    isEmpty(design: CalendarChartDesign): boolean;
    createDesignerElement(options: any): React.FunctionComponentElement<{
        schema: any;
        design: CalendarChartDesign;
        dataSource: any;
        filters: any;
        onDesignChange: (design: any) => any;
    }>;
    getData(design: CalendarChartDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any): void;
    createViewElement(options: ChartCreateViewElementOptions): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    createDataTable(design: any, schema: Schema, dataSource: DataSource, data: any): string[][];
    getFilterableTables(design: any, schema: Schema): any[];
    getPlaceholderIcon(): string;
}

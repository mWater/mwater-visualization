import { Schema } from "mwater-expressions";
import { ExprUtils } from "mwater-expressions";
import AxisBuilder from "../../../axes/AxisBuilder";
import { JsonQLFilter, WidgetScope } from "../../..";
import { LayeredChartDesign } from "./LayeredChartDesign";
import { JsonQLExpr, JsonQLQuery } from "jsonql";
import { ChartOptions, PrimitiveArray, ChartTypes } from "billboard.js";
/** Data for a chart */
declare type C3ChartData = {
    [key: string]: any[];
};
/** Intermediate data structure that contains most of chart formatting */
interface C3Data {
    types?: {
        [key: string]: ChartTypes;
    };
    columns: PrimitiveArray[];
    xAxisType?: "category" | "indexed" | "log" | "timeseries";
    xAxisTickFit?: boolean;
    xs?: {
        [key: string]: string;
    };
    /** map of "layername:index" to { layerIndex, row } */
    dataMap: {
        [key: string]: {
            layerIndex: number;
            row: any[];
        };
    };
    format: {
        [layerId: string]: (value: any) => string;
    };
    xAxisLabelText?: string;
    yAxisLabelText?: string;
    titleText?: string;
    legendHide?: boolean;
    /**
       * Set custom data name.
       */
    names?: {
        [key: string]: string;
    };
    /**
     * Set groups for the data for stacking.
     */
    groups?: string[][];
    /**
     * Set label text colors.
     */
    colors?: {
        [key: string]: string;
    };
    order?: "asc" | "desc";
    color?: any;
    /**
     * Set custom data class.
     * If this option is specified, the element g for the data has an additional class that has the prefix billboard-target- (e.g. billboard-target-additional-data1-class).
     */
    classes?: {
        [key: string]: string;
    };
}
export default class LayeredChartCompiler {
    schema: Schema;
    exprUtils: ExprUtils;
    axisBuilder: AxisBuilder;
    constructor(options: {
        schema: Schema;
    });
    /** Create the queries needed for the chart.
     * extraFilters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. }
     * @returns queries indexed by layerX
     */
    createQueries(design: LayeredChartDesign, extraFilters?: JsonQLFilter[] | null): {
        [key: string]: JsonQLQuery;
    };
    createDataMap(design: LayeredChartDesign, data: C3ChartData): {
        [key: string]: {
            layerIndex: number;
            row: any[];
        };
    };
    createChartOptions(options: {
        design: LayeredChartDesign;
        data: any;
        width: number;
        height: number;
        locale?: string;
    }): ChartOptions;
    isCategoricalX(design: LayeredChartDesign): boolean;
    compileData(design: LayeredChartDesign, data: C3ChartData, locale?: string): C3Data;
    compileDataPolar(design: LayeredChartDesign, data: C3ChartData, locale: any): C3Data;
    compileDataNonCategorical(design: LayeredChartDesign, data: C3ChartData, locale?: string): C3Data;
    fixStringYValues(rows?: any): any;
    flattenRowData(rows: any): any[];
    compileDataCategorical(design: LayeredChartDesign, data: C3ChartData, locale?: string): C3Data;
    compileExpr(expr: any): JsonQLExpr;
    getLayerType(design: any, layerIndex: any): any;
    getLayerTypeString(design: any, layerIndex: any): any;
    doesLayerNeedGrouping(design: any, layerIndex: any): boolean;
    canLayerUseXExpr(design: any, layerIndex: any): boolean;
    isXAxisRequired(design: any, layerIndex: any): boolean;
    isColorAxisRequired(design: any, layerIndex: any): boolean;
    compileDefaultTitleText(design: any, locale: any): string;
    compileDefaultYAxisLabelText(design: any, locale?: string): string;
    compileDefaultXAxisLabelText(design: any, locale?: string): string;
    compileTitleText(design: any, locale?: string): any;
    compileYAxisLabelText(design: any, locale?: string): any;
    compileXAxisLabelText(design: any, locale: any): any;
    createScope(design: LayeredChartDesign, layerIndex: number, row: any, locale?: string): WidgetScope;
    makeRowsCumulative(rows: any): any[];
}
export {};

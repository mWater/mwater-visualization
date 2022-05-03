import { Schema } from "mwater-expressions";
import { ExprUtils } from "mwater-expressions";
import AxisBuilder from "../../../axes/AxisBuilder";
import { JsonQLFilter } from "../../..";
import { LayeredChartDesign } from "./LayeredChartDesign";
import { JsonQLQuery } from "jsonql";
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
    createDataMap(design: any, data: any): {};
    createChartOptions(options: any): {
        data: {
            types: {};
            columns: any;
            names: {};
            groups: any;
            xs: any;
            colors: {};
            labels: any;
            order: string | null;
            color: any;
            classes: any;
        };
        legend: {
            hide: any;
        };
        grid: {
            focus: {
                show: boolean;
            };
        };
        axis: {
            x: {
                type: string;
                label: {
                    text: any;
                    position: string;
                };
                tick: {
                    fit: any;
                };
            };
            y: {
                label: {
                    text: any;
                    position: string;
                };
                max: any;
                min: any;
                padding: {
                    top: number | undefined;
                    bottom: number | undefined;
                };
                tick: {
                    format: any;
                };
            };
            rotated: any;
        };
        size: {
            width: any;
            height: any;
        };
        pie: {
            label: {
                show: boolean;
                format: ((value: any, ratio: any, id: any) => string) | undefined;
            };
            expand: boolean;
        };
        donut: {
            label: {
                show: boolean;
                format: ((value: any, ratio: any, id: any) => string) | undefined;
            };
            expand: boolean;
        };
        transition: {
            duration: number;
        };
    };
    isCategoricalX(design: any): boolean;
    compileData(design: LayeredChartDesign, data: any, locale?: string): {
        columns: any;
        types: {};
        names: {};
        dataMap: {};
        colors: {};
        xAxisType: string;
        titleText: any;
        order: string | null;
        format: {};
    };
    compileDataPolar(design: any, data: any, locale: any): {
        columns: any;
        types: {};
        names: {};
        dataMap: {};
        colors: {};
        xAxisType: string;
        titleText: any;
        order: string | null;
        format: {};
    };
    compileDataNonCategorical(design: any, data: any, locale: any): {
        columns: any;
        types: {};
        names: {};
        groups: any;
        dataMap: {};
        colors: {};
        xs: {};
        legendHide: any;
        classes: {};
        xAxisType: string;
        xAxisTickFit: boolean;
        xAxisLabelText: any;
        yAxisLabelText: any;
        titleText: any;
        order: null;
        format: {};
    };
    fixStringYValues(rows?: any): any;
    flattenRowData(rows: any): any[];
    compileDataCategorical(design: any, data: any, locale: any): {
        columns: string[][];
        types: {};
        names: {};
        dataMap: {};
        colors: {};
        xs: {};
        groups: any;
        legendHide: any;
        classes: {};
        xAxisType: string;
        xAxisTickFit: boolean;
        xAxisLabelText: any;
        yAxisLabelText: any;
        titleText: any;
        order: null;
        format: {};
        color: (color: any, d: any) => any;
    };
    compileExpr(expr: any): import("jsonql").JsonQLExpr;
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
    createScope(design: any, layerIndex: any, row: any, locale: any): {
        name: string;
        filter: {
            table: any;
            jsonql: {
                type: string;
                op: string;
                exprs: (string | number | boolean | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken | {
                    type: string;
                    op: string;
                    exprs: {
                        type: string;
                        op: string;
                        exprs: import("jsonql").JsonQLExpr[];
                    }[];
                } | null)[];
            };
        } | {
            table: any;
            jsonql: string | number | boolean | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken | {
                type: string;
                op: string;
                exprs: {
                    type: string;
                    op: string;
                    exprs: import("jsonql").JsonQLExpr[];
                }[];
            } | null;
        };
        filterExpr: import("mwater-expressions").LiteralExpr | import("mwater-expressions").FieldExpr | import("mwater-expressions").OpExpr | import("mwater-expressions").IdExpr | import("mwater-expressions").ScalarExpr | import("mwater-expressions").CaseExpr | import("mwater-expressions").ScoreExpr | import("mwater-expressions").BuildEnumsetExpr | import("mwater-expressions").VariableExpr | import("mwater-expressions").ExtensionExpr | import("mwater-expressions").LegacyComparisonExpr | import("mwater-expressions").LegacyCountExpr | {
            table: any;
            type: string;
            op: string;
            exprs: any[];
        } | null;
        data: {
            layerIndex: any;
        };
    };
    makeRowsCumulative(rows: any): any[];
}

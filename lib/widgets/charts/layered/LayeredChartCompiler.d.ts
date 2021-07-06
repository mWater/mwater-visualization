export default class LayeredChartCompiler {
    constructor(options: any);
    createQueries(design: any, extraFilters: any): {};
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
    compileData(design: any, data: any, locale: any): {
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
    fixStringYValues(rows: any): any;
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
    doesLayerNeedGrouping(design: any, layerIndex: any): boolean;
    canLayerUseXExpr(design: any, layerIndex: any): boolean;
    isXAxisRequired(design: any, layerIndex: any): boolean;
    isColorAxisRequired(design: any, layerIndex: any): boolean;
    compileDefaultTitleText(design: any, locale: any): string;
    compileDefaultYAxisLabelText(design: any, locale: any): any;
    compileDefaultXAxisLabelText(design: any, locale: any): any;
    compileTitleText(design: any, locale: any): any;
    compileYAxisLabelText(design: any, locale: any): any;
    compileXAxisLabelText(design: any, locale: any): any;
    createScope(design: any, layerIndex: any, row: any, locale: any): {
        name: string;
        filter: {
            table: any;
            jsonql: any;
        };
        filterExpr: any;
        data: {
            layerIndex: any;
        };
    };
    makeRowsCumulative(rows: any): any[];
}

import { ExprUtils, Schema } from "mwater-expressions";
import AxisBuilder from "../../../axes/AxisBuilder";
import { PivotChartDesign, PivotChartSegment } from "./PivotChartDesign";
import { PivotChartLayout, PivotChartLayoutCell } from "./PivotChartLayout";
export declare type PivotChartData = {
    [intersectionId: string]: any[];
};
export default class PivotChartLayoutBuilder {
    schema: Schema;
    exprUtils: ExprUtils;
    axisBuilder: AxisBuilder;
    constructor(options: {
        schema: Schema;
    });
    buildLayout(design: PivotChartDesign, data: PivotChartData, locale: string): PivotChartLayout;
    buildIntersectionCell(design: PivotChartDesign, dataIndexed: any, locale: string, row: {
        segment: PivotChartSegment;
        label: string;
        value: any;
    }[], column: {
        segment: PivotChartSegment;
        label: string;
        value: any;
    }[]): PivotChartLayoutCell | {
        type: string;
        text: null;
    };
    setupSummarize(design: any, layout: any): (boolean | undefined)[][];
    setupBorders(layout: any): any[][];
    getRowsOrColumns(isRow: boolean, segment: PivotChartSegment, data: {
        [intersectionId: string]: any[];
    }, locale: string, parentSegments?: PivotChartSegment[], parentValues?: any[]): {
        segment: PivotChartSegment;
        label: string;
        value: any;
    }[][];
}

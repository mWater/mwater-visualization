import { ExprUtils, Schema } from "mwater-expressions";
import AxisBuilder from "../../../axes/AxisBuilder";
import { PivotChartDesign, PivotChartSegment } from "./PivotChartDesign";
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
    buildLayout(design: PivotChartDesign, data: PivotChartData, locale: string): any;
    buildIntersectionCell(design: PivotChartDesign, dataIndexed: any, locale: string, row: any, column: any): {
        type: string;
        subtype: string;
        section: string;
        text: any;
        align: string;
        bold: boolean | undefined;
        italic: boolean | undefined;
    } | {
        type: string;
        text: null;
    };
    setupSummarize(design: any, layout: any): (boolean | undefined)[][];
    setupBorders(layout: any): any[][];
    getRowsOrColumns(isRow: any, segment: PivotChartSegment, data: {
        [intersectionId: string]: any[];
    }, locale: string, parentSegments?: PivotChartSegment[], parentValues?: any[]): {
        segment: PivotChartSegment;
        label: string;
        value: any;
    }[][];
}

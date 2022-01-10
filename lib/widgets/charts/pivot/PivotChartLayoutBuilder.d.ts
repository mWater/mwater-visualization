import { ExprUtils, Schema } from "mwater-expressions";
import AxisBuilder from "../../../axes/AxisBuilder";
import { PivotChartDesign } from "./PivotChartDesign";
export default class PivotChartLayoutBuilder {
    schema: Schema;
    exprUtils: ExprUtils;
    axisBuilder: AxisBuilder;
    constructor(options: {
        schema: Schema;
    });
    buildLayout(design: PivotChartDesign, data: any, locale: any): any;
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
    getRowsOrColumns(isRow: any, segment: any, data: any, locale: any, parentSegments?: never[], parentValues?: never[]): any;
}

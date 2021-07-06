export default class PivotChartLayoutBuilder {
    constructor(options: any);
    buildLayout(design: any, data: any, locale: any): {
        rows: never[];
        striping: any;
    };
    buildIntersectionCell(design: any, dataIndexed: any, locale: any, row: any, column: any): {
        type: string;
        subtype: string;
        section: string;
        text: any;
        align: string;
        bold: any;
        italic: any;
    } | {
        type: string;
        text: null;
    };
    setupSummarize(design: any, layout: any): (boolean | undefined)[][];
    setupBorders(layout: any): any[][];
    getRowsOrColumns(isRow: any, segment: any, data: any, locale: any, parentSegments?: never[], parentValues?: never[]): any;
}

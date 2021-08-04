import { Axis } from "./Axis";
export default class AxisBuilder {
    constructor(options: any);
    cleanAxis(options: any): any;
    validateAxis(options: any): any;
    compileAxis(options: any): import("jsonql").JsonQLExpr;
    compileBinMinMax(expr: any, table: any, filterExpr: any, numBins: any): {
        type: string;
        selects: {
            type: string;
            expr: {
                type: string;
                op: string;
                exprs: {
                    type: string;
                    tableAlias: string;
                    column: string;
                }[];
            };
            alias: string;
        }[];
        from: {
            type: string;
            query: {
                type: string;
                selects: ({
                    type: string;
                    expr: string | number | true | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken;
                    alias: string;
                    over?: undefined;
                } | {
                    type: string;
                    expr: {
                        type: string;
                        op: string;
                        exprs: any[];
                    };
                    over: {
                        orderBy: {
                            expr: string | number | true | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken;
                            direction: string;
                        }[];
                    };
                    alias: string;
                })[];
                from: {
                    type: string;
                    table: any;
                    alias: string;
                };
                where: {
                    type: string;
                    op: string;
                    exprs: (string | number | true | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken)[];
                };
            };
            alias: string;
        };
        where: {
            type: string;
            op: string;
            exprs: any[];
        };
    } | null;
    getExprTypes(types: any): any;
    getValueColor(axis: any, value: any): any;
    getCategories(axis: any, values: any, locale: any): {
        value: any;
        label: any;
    }[];
    getAxisType(axis: any): any;
    isAxisAggr(axis: any): any;
    doesAxisSupportCumulative(axis: any): boolean;
    formatCategory(axis: any, category: any): any;
    summarizeAxis(axis: any, locale: any): any;
    formatValue(axis: Axis, value: any, locale: string, legacyPercentFormat?: any): any;
    createValueFilter(axis: any, value: any): {
        type: string;
        op: string;
        exprs: (string | number | boolean | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken | {
            type: string;
            value: any;
        } | null)[];
    };
    createValueFilterExpr(axis: any, value: any): {
        table: any;
        type: string;
        op: string;
        exprs: any[];
    };
    isCategorical(axis: any): boolean;
    convertAxisToExpr(axis: any): any;
}

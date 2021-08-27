import { Schema } from "mwater-expressions";
import { ExprValidator } from "mwater-expressions";
import { ExprUtils } from "mwater-expressions";
import { ExprCleaner } from "mwater-expressions";
import { Axis } from "./Axis";
import { JsonQLExpr } from "jsonql";
declare type AggrNeed = "none" | "optional" | "required";
export default class AxisBuilder {
    schema: Schema;
    exprUtils: ExprUtils;
    exprCleaner: ExprCleaner;
    exprValidator: ExprValidator;
    constructor(options: {
        schema: Schema;
    });
    /** Clean an axis with respect to a specific table
      options:
       axis: axis to clean
       table: table that axis is to be for
       aggrNeed is "none", "optional" or "required"
       types: optional list of types to require it to be one of
    */
    cleanAxis(options: {
        axis: Axis | null;
        table?: string | null;
        aggrNeed?: AggrNeed;
        types?: string[];
    }): Axis | null;
    /** Checks whether an axis is valid
      options:
       axis: axis to validate
    */
    validateAxis(options: {
        axis: Axis | null;
    }): string | null;
    /**
     * Compile an axis to JsonQL
     */
    compileAxis(options: {
        axis: Axis;
        tableAlias: string;
    }): JsonQLExpr;
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
    /** Get all categories for a given axis type given the known values
     * Returns array of { value, label }
     */
    getCategories(axis: Axis, values: any[], locale?: string): {
        value: any;
        label: string;
    }[];
    getAxisType(axis: any): string | null;
    isAxisAggr(axis: any): any;
    doesAxisSupportCumulative(axis: any): boolean;
    formatCategory(axis: any, category: any): any;
    summarizeAxis(axis: any, locale: any): string;
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
export {};

import { Expr, LiteralType, Schema } from "mwater-expressions";
import { ExprValidator } from "mwater-expressions";
import { ExprUtils } from "mwater-expressions";
import { ExprCleaner } from "mwater-expressions";
import { Axis, AxisCategory } from "./Axis";
import { JsonQLExpr, JsonQLSelectQuery } from "jsonql";
export declare type AggrNeed = "none" | "optional" | "required";
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
        axis: Axis | null | undefined;
    }): string | null;
    /**
     * Compile an axis to JsonQL
     */
    compileAxis(options: {
        axis: Axis;
        tableAlias: string;
    }): JsonQLExpr;
    compileBinMinMax(expr: any, table: any, filterExpr: any, numBins: any): JsonQLSelectQuery | null;
    getExprTypes(types: any): any;
    getValueColor(axis: Axis, value: any): string | null;
    /** Get all categories for a given axis type given the known values
     * Returns array of { value, label }
     */
    getCategories(axis: Axis, values: any[] | null, locale?: string): AxisCategory[];
    getAxisType(axis: any): LiteralType | null;
    isAxisAggr(axis: any): any;
    doesAxisSupportCumulative(axis: any): boolean;
    formatCategory(axis: any, category: any): any;
    summarizeAxis(axis: any, locale: any): string;
    formatValue(axis: Axis, value: any, locale: string, legacyPercentFormat?: any): any;
    createValueFilter(axis: any, value: any): JsonQLExpr;
    createValueFilterExpr(axis: any, value: any): Expr;
    isCategorical(axis: any): boolean;
    convertAxisToExpr(axis: any): any;
}

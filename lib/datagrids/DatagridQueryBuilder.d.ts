import { JsonQLQuery, JsonQLSelect } from "jsonql";
import { Schema } from "mwater-expressions";
export default class DatagridQueryBuilder {
    schema: Schema;
    constructor(schema: Schema);
    createQuery(design: any, options?: {}): JsonQLQuery;
    createSimpleQuery(design: any, options: any): JsonQLQuery;
    createComplexQuery(design: any, options: any): JsonQLQuery;
    createComplexMainQuery(design: any, options: any): JsonQLQuery;
    createComplexSubtableQuery(design: any, options: any, subtable: any, subtableIndex: any): {
        type: string;
        selects: {
            type: string;
            expr: any;
            alias: string;
        }[];
        from: {
            type: string;
            kind: string;
            left: {
                type: string;
                table: any;
                alias: string;
            };
            right: {
                type: string;
                table: string;
                alias: string;
            };
            on: any;
        };
    };
    getMainOrderByExprs(design: any, isAggr?: boolean): (string | number | boolean | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken | {
        type: string;
        tableAlias: string;
        column: string | undefined;
    } | null)[];
    getMainOrderByDirections(design: any, isAggr?: boolean): any[];
    getSubtableOrderByExprs(design: any, subtable: any): (string | number | boolean | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken | {
        type: string;
        tableAlias: string;
        column: string | undefined;
    } | null)[];
    getSubtableOrderByDirections(design: any, subtable: any): any[];
    getSubtableOrderByExprTypes(design: any, subtable: any): (string | null)[];
    createColumnSelect(column: any, columnIndex: any, subtable: any, fillSubtableRows: any): {
        type: string;
        expr: {
            type: string;
            op: string;
            exprs: null[];
        } | null;
        alias: string;
    } | {
        type: string;
        expr: import("jsonql").JsonQLExpr;
        alias: string;
    };
    createSimpleSelects(design: any, isAggr: any): JsonQLSelect[];
    createNullExpr(exprType: any): {
        type: string;
        op: string;
        exprs: null[];
    } | null;
    isMainAggr(design: any): boolean;
}

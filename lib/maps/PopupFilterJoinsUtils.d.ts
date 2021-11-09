import { Schema } from "mwater-expressions";
export declare function createPopupFilters(popupFilterJoins: any, schema: Schema, layerTable: any, rowId: any, useWithin?: boolean): ({
    table: string;
    jsonql: import("jsonql").JsonQLExpr;
} | {
    table: string;
    jsonql: {
        type: string;
        op: string;
        exprs: (string | number | boolean | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken | {
            type: string;
            value: any;
        } | null)[];
    };
} | {
    table: string;
    jsonql: {
        type: string;
        op: string;
        exprs: (string | number | boolean | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken | {
            type: string;
            op: string;
            exprs: {
                type: string;
                value: string;
            }[];
        } | null)[];
    };
})[];
export declare function createDefaultPopupFilterJoins(table: any): {};

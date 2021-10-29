export default class QuickfilterCompiler {
    constructor(schema: any);
    compile(design: any, values: any, locks: any): {
        table: any;
        jsonql: string | number | boolean | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken;
    }[];
    compileToFilterExpr(expr: any, value: any, multi: any): {
        type: string;
        op: any;
        table: any;
        exprs: any[];
    } | null;
}

export default class DatagridQueryBuilder {
    constructor(schema: any);
    createQuery(design: any, options?: {}): {
        type: string;
        selects: {
            type: string;
            expr: {
                type: string;
                tableAlias: string;
                column: any;
            };
            alias: string;
        }[];
        from: {
            type: string;
            table: any;
            alias: string;
        };
        orderBy: never[];
        offset: any;
        limit: any;
    } | {
        type: string;
        selects: {
            type: string;
            expr: {
                type: string;
                tableAlias: string;
                column: string;
            };
            alias: string;
        }[];
        from: {
            type: string;
            query: {
                type: string;
                queries: ({
                    type: string;
                    selects: ({
                        type: string;
                        expr: {
                            type: string;
                            tableAlias: string;
                            column: any;
                        };
                        alias: string;
                    } | {
                        type: string;
                        expr: number;
                        alias: string;
                    })[];
                    from: {
                        type: string;
                        table: any;
                        alias: string;
                    };
                } | {
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
                })[];
            };
            alias: string;
        };
        orderBy: never[];
        offset: any;
        limit: any;
    };
    createSimpleQuery(design: any, options: any): {
        type: string;
        selects: {
            type: string;
            expr: {
                type: string;
                tableAlias: string;
                column: any;
            };
            alias: string;
        }[];
        from: {
            type: string;
            table: any;
            alias: string;
        };
        orderBy: never[];
        offset: any;
        limit: any;
    };
    createComplexQuery(design: any, options: any): {
        type: string;
        selects: {
            type: string;
            expr: {
                type: string;
                tableAlias: string;
                column: string;
            };
            alias: string;
        }[];
        from: {
            type: string;
            query: {
                type: string;
                queries: ({
                    type: string;
                    selects: ({
                        type: string;
                        expr: {
                            type: string;
                            tableAlias: string;
                            column: any;
                        };
                        alias: string;
                    } | {
                        type: string;
                        expr: number;
                        alias: string;
                    })[];
                    from: {
                        type: string;
                        table: any;
                        alias: string;
                    };
                } | {
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
                })[];
            };
            alias: string;
        };
        orderBy: never[];
        offset: any;
        limit: any;
    };
    createComplexMainQuery(design: any, options: any): {
        type: string;
        selects: ({
            type: string;
            expr: {
                type: string;
                tableAlias: string;
                column: any;
            };
            alias: string;
        } | {
            type: string;
            expr: number;
            alias: string;
        })[];
        from: {
            type: string;
            table: any;
            alias: string;
        };
    };
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
        column: any;
    } | null)[];
    getMainOrderByDirections(design: any, isAggr?: boolean): any[];
    getSubtableOrderByExprs(design: any, subtable: any): (string | number | boolean | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken | {
        type: string;
        tableAlias: string;
        column: any;
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
    createSimpleSelects(design: any, isAggr: any): {
        type: string;
        expr: {
            type: string;
            tableAlias: string;
            column: any;
        };
        alias: string;
    }[];
    createNullExpr(exprType: any): {
        type: string;
        op: string;
        exprs: null[];
    } | null;
    isMainAggr(design: any): boolean;
}

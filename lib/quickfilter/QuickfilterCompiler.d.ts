import { Schema } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter";
import { Quickfilter, QuickfilterLock } from "./Quickfilter";
/** Compiles quickfilter values into filters */
export default class QuickfilterCompiler {
    schema: Schema;
    constructor(schema: Schema);
    /** design is array of quickfilters (see README.md)
     * values is array of values
     * locks is array of locked quickfilters. Overrides values
     * Returns array of filters { table: table id, jsonql: JsonQL with {alias} for the table name to filter by }
     * See README for values
     */
    compile(design: Quickfilter[], values: any[] | null, locks: QuickfilterLock[]): JsonQLFilter[];
    compileToFilterExpr(expr: any, value: any, multi: any): {
        type: string;
        op: any;
        table: any;
        exprs: any[];
    } | null;
}

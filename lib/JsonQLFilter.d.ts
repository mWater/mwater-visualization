import { JsonQLExpr } from "jsonql";
/** Filter on a table, defined in JsonQL */
export interface JsonQLFilter {
    table: string;
    /** jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    jsonql: JsonQLExpr;
}

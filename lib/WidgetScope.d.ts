import { Expr } from "mwater-expressions";
import { JsonQLFilter } from "./JsonQLFilter";
/** Scope that a particular widget can apply when a part of it is clicked */
export interface WidgetScope {
    /** Human-readable name of the scope */
    name: string;
    /** Filter as JsonQL */
    filter: JsonQLFilter;
    /** Filter as an expression */
    filterExpr: Expr;
    /** Widget-specific data */
    data: any;
}

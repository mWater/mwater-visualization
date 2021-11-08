import { Expr, LiteralType } from "mwater-expressions";
/** Design of data grid */
export interface DatagridDesign {
    /** table id of main table */
    table: string | null;
    /** array of columns */
    columns: DatagridDesignColumn[];
    /** mwater-expression */
    filter?: Expr;
    /** locale to display localizable strings in. optional */
    locale?: string;
    /** array of subtables (1-n joins) */
    subtables?: DatagridDesignSubtable[];
    /** array of { expr: expression to order on, direction: "asc"/"desc" } */
    orderBys?: {
        expr: Expr;
        direction: "asc" | "desc";
    }[];
    /** array of quick filters (user-selectable filters). See quickfilter/README.md TODO */
    quickfilters?: any;
    /** true to show row numbers */
    showRowNumbers?: boolean;
    /** array of global filters. See below. */
    globalFilters?: DatagridDesignGlobalFilter[];
}
export interface DatagridDesignColumn {
    /** unique id of the column */
    id: string;
    /** optional label for the column */
    label?: string;
    /** subtable from which column is from. Null/undefined for main table */
    subtable?: string | null;
    /** width of column in pixels */
    width: number;
    /** type of the column */
    type: "expr";
    /** Expression */
    expr: Expr;
    /** Format for formattable types (number and geometry) */
    format?: string;
}
export interface DatagridDesignSubtable {
    /** unique id of the subtable (not the id of the table, just a unique id) */
    id: string;
    /** name of subtable (optional) */
    name?: string;
    /** array of join columns to get to subtable from the table */
    joins: string[];
    /** mwater-expression */
    filter?: Expr;
    /** array of { expr: expression to order on, direction: "asc"/"desc" } */
    orderBys: {
        expr: Expr;
        direction: "asc" | "desc";
    }[];
}
/** Global Filters

Global filters apply to multiple tables at once if a certain column is present. User-interface to set them is application-specific
and the default (non-mWater) dashboard applies them but does not allow editing.

Note: This is less applicable in the case of datagrids since there is a single table, but is included for consistency and ease
of setting complex but common filters.
*/
export interface DatagridDesignGlobalFilter {
    /** id of column to filter */
    columnId: string;
    /** type of column to filter (to ensure that consistent) */
    columnType: LiteralType;
    /** op of expression for filtering */
    op: string;
    /** array of expressions to use for filtering. field expression for column will be injected as expression 0 in the resulting filter expression */
    exprs: Expr[];
}

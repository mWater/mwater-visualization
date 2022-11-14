import { Column, Expr, Schema } from "mwater-expressions";
/** Expression with a label attached */
export interface LabeledExpr {
    expr: Expr;
    label: string;
    /** Which joins from the originating table to get to expression. Used for 1-n joins
     * which are included (they are not by default). In most cases will be []
     */
    joins: string[];
}
export interface LabeledExprGeneratorOptions {
    /** e.g. "en". Uses _base by default, then en [null] */
    locale?: string | null;
    /** "text", "code" or "both" ["code"] */
    headerFormat?: "text" | "code" | "both";
    /** "name" or "code" ["name"] */
    enumFormat?: "name" | "code";
    /** split geometry into lat/lng [false] */
    splitLatLng?: boolean;
    /** split enumset into true/false expressions [false] */
    splitEnumset?: boolean;
    /** use ids of n-1 joins, not the code/name/etc [false] */
    useJoinIds?: boolean;
    /** optional boolean predicate to filter columns included. Called with table id, column object */
    columnFilter?: (tableId: string, column: Column) => boolean;
    /** optional boolean predicate to filter 1-n/n-n joins to include. Called with table id, join column object. Default is to not include those joins */
    multipleJoinCondition?: (tableId: string, column: Column) => boolean;
    /** optional boolean to replace redacted columns with unredacted ones */
    useConfidential?: boolean;
    /** number duplicate label columns with " (1)", " (2)" , etc. */
    numberDuplicatesLabels?: boolean;
    /** Override how a column is processed. Return array if processed, null to pass through */
    overrideColumn?: (tableId: string, column: Column, joins: string[], label: string) => null | LabeledExpr[];
}
/** Generates labeled expressions (expr, label and joins) for a table. Used to make a datagrid, do export or import. */
export default class LabeledExprGenerator {
    schema: Schema;
    constructor(schema: Schema);
    generate(table: string, options?: LabeledExprGeneratorOptions): LabeledExpr[];
}

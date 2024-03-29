import { Expr } from "mwater-expressions";
/**
  design is an array of quick filters (user-selectable filters).
  */
export interface Quickfilter {
    /** filter expression (left hand side only. Usually enum, enumset, text, date, datetime, id[], text[]) */
    expr: Expr;
    /** optional label */
    label?: string;
    /** true to merge on display with the previous quickfilter. Only applicable if previous one has same type and enum values and id table (if applicable) and multi.  */
    merged?: boolean;
    /** true for multi-select (text and enum and enumset only) */
    multi?: boolean;
}
/** Lock on a quickfilter */
export interface QuickfilterLock {
    /** Expression that is locked to a specific value */
    expr: Expr;
    /** Value of the lock */
    value: any;
}

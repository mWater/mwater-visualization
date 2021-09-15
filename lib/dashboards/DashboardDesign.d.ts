import { Quickfilter } from "../quickfilter/Quickfilter";
import { LiteralType, Expr } from "mwater-expressions";
import { BlocksLayoutOptions, DashboardTheme } from "./layoutOptions";
/** Dashboard design
 * Each understands enough of the dashboard design to create widgets.
 * Widget refers to the widget itself, where *item* refers also to the layout and id that it has in the dashboard.
 */
export interface DashboardDesign {
    /** dashboard items. Format depends on layout of dashboard. See layouts/.../README.md */
    items: any;
    /** array of quick filters (user-selectable filters). See quickfilter/README.md */
    quickfilters: Quickfilter[];
    /** layout engine to use (`blocks` is new default)  */
    layout: "blocks" | "grid";
    /** optional theme to use */
    style?: DashboardTheme;
    /** Options for layout including responsiveness, scaling, etc */
    layoutOptions?: BlocksLayoutOptions;
    /** filter expression indexed by table. e.g. { sometable: logical expression, etc. } */
    filters?: {
        [tableId: string]: Expr;
    };
    /** optional locale (e.g. "fr") to use for display */
    locale?: string;
    /** true to enable implicit filtering (see ImplicitFilterBuilder). Defaults to true for older dashboards. */
    implicitFiltersEnabled: boolean;
    /** array of global filters. See below. */
    globalFilters?: GlobalFilter[];
}
/** Global Filters:

Global filters apply to multiple tables at once if a certain column is present. User-interface to set them is application-specific
and the default (non-mWater) dashboard applies them but does not allow editing.

*/
export interface GlobalFilter {
    /** id of column to filter */
    columnId: string;
    /** type of column to filter (to ensure that consistent) */
    columnType: LiteralType;
    /** op of expression for filtering */
    op: string;
    /** array of expressions to use for filtering. field expression for column will be injected as expression 0 in the resulting filter expression */
    exprs: Expr[];
}

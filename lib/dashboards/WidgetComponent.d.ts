/// <reference types="react" />
import { Schema, DataSource } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter";
import { WidgetScope } from "../WidgetScope";
import DashboardDataSource from "./DashboardDataSource";
/**
 * Component which renders a widget and ensures that props do not change
 * unnecessarily.
 */
export declare function WidgetComponent(props: {
    /** Widget id */
    id: string;
    /** Widget type */
    type: string;
    /** Widget design */
    design: any;
    /** Called with new widget design. null/undefined for readonly **/
    onDesignChange?: {
        (design: object): void;
    } | null;
    /** Data source for dashboard */
    dashboardDataSource: DashboardDataSource;
    /** schema to use **/
    schema: Schema;
    /** data source to use. Only used when designing, for display uses widgetDataSource **/
    dataSource: DataSource;
    /** scope of the widget (when the widget self-selects a particular scope) **/
    scope?: WidgetScope | null;
    /** array of filters to apply.**/
    filters: JsonQLFilter[];
    /** called with scope of widget **/
    onScopeChange: (scope: WidgetScope | null) => void;
    /** width in pixels on screen **/
    width?: number;
    /** height in pixels on screen **/
    height?: number;
    /** optional table name of table that will be filtered to have a single row present. Widget designer should optionally account for this **/
    singleRowTable?: string;
    /** Called with (tableId, rowId) when item is clicked **/
    onRowClick?: (tableId: string, rowId: any) => void;
    /** Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget */
    namedStrings?: {
        [key: string]: string;
    };
    /** Entries in the table of content */
    tocEntries?: string[];
    /** the widget callback ref */
    widgetRef: (widget: any) => void;
    /** called with (widgetId, tocEntryId) to scroll to TOC entry */
    onScrollToTOCEntry?: (widgetId: string, tocEntryId: string) => void;
}): import("react").ReactElement<any, string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => import("react").Component<any, any, any>)> | null) | (new (props: any) => import("react").Component<any, any, any>)>;

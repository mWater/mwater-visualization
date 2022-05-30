import PropTypes from "prop-types";
import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import WidgetScoper from "../widgets/WidgetScoper";
import WidgetScopesViewComponent from "../widgets/WidgetScopesViewComponent";
import { DashboardDataSource, DashboardDesign, JsonQLFilter } from "..";
export interface DashboardViewComponentProps {
    /** schema to use */
    schema: Schema;
    /** data source to use. Only used when designing, for display uses dashboardDataSource */
    dataSource: DataSource;
    /** dashboard data source */
    dashboardDataSource: DashboardDataSource;
    design: DashboardDesign;
    /** Leave unset for readonly */
    onDesignChange?: (design: DashboardDesign) => void;
    /** Called with (tableId, rowId) when item is clicked */
    onRowClick?: (tableId: string, rowId: any) => void;
    /** Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget */
    namedStrings?: {
        [key: string]: string;
    };
    /** Filters to add to the dashboard (includes extra filters and any quickfilters from the dashboard component. Does not include dashboard level filters) */
    filters?: JsonQLFilter[];
    /** Entry to scroll to initially when dashboard is loaded */
    initialTOCEntryScroll?: {
        widgetId: string;
        entryId: any;
    };
    /** True to hide scope display */
    hideScopes?: boolean;
    /** True to render in print mode (prevents odd clipping issue) */
    printMode?: boolean;
    /** Change to force a refresh */
    refreshKey?: any;
}
/**
 * Displays a dashboard, handling removing of widgets. No title bar or other decorations.
 * Handles scoping and stores the state of scope
 */
export default class DashboardViewComponent extends React.Component<DashboardViewComponentProps, {
    widgetScoper: WidgetScoper;
}> {
    static childContextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    widgetComps: {
        [widgetId: string]: any;
    };
    getChildContext(): {
        locale: string | undefined;
    };
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    handleStorageChange: () => void;
    handleScopeChange: (id: any, scope: any) => void;
    handleRemoveScope: (id: any) => void;
    handleItemsChange: (items: any) => void;
    handleClipboardChange: (block: any) => void;
    getClipboardContents(): any;
    print: () => Promise<void>;
    getCompiledFilters(): JsonQLFilter[];
    getTOCEntries(layoutManager: any): any[];
    handleScrollToTOCEntry: (widgetId: any, entryId: any) => any;
    renderScopes(): React.CElement<import("../widgets/WidgetScopesViewComponent").WidgetScopesViewComponentProps, WidgetScopesViewComponent>;
    compRef: (widgetId: any, comp: any) => any;
    render(): React.DetailedReactHTMLElement<{
        style: React.CSSProperties;
    }, HTMLElement>;
}

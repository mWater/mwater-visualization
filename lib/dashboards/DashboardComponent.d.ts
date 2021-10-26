import PropTypes from "prop-types";
import React, { ReactNode } from "react";
import { DataSource, Schema } from "mwater-expressions";
import UndoStack from "../UndoStack";
import DashboardViewComponent from "./DashboardViewComponent";
import QuickfiltersComponent from "../quickfilter/QuickfiltersComponent";
import { DashboardDesign } from "./DashboardDesign";
import DashboardDataSource from "./DashboardDataSource";
import { JsonQLFilter } from "..";
export interface DashboardComponentProps {
    design: DashboardDesign;
    /** If not set, readonly */
    onDesignChange?: (design: DashboardDesign) => void;
    schema: Schema;
    dataSource: DataSource;
    /** dashboard data source */
    dashboardDataSource: DashboardDataSource;
    /** Extra element to include in title at left */
    titleElem?: ReactNode;
    /** Extra elements to add to right */
    extraTitleButtonsElem?: ReactNode;
    /** Key that changes when the undo stack should be reset. Usually a document id or suchlike */
    undoStackKey?: any;
    /** True to scale for printing */
    printScaling?: boolean;
    /** Called with (tableId, rowId) when item is clicked */
    onRowClick?: (tableId: string, rowId: any) => void;
    /** Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget */
    namedStrings?: {
        [key: string]: string;
    };
    /** Locked quickfilter values. See README in quickfilters */
    quickfilterLocks?: any[];
    /** Initial quickfilter values */
    quickfiltersValues?: any[];
    /** Filters to add to the dashboard */
    filters?: JsonQLFilter[];
    /** True to hide title bar and related controls */
    hideTitleBar?: boolean;
}
export interface DashboardComponentState {
    undoStack: UndoStack;
    quickfiltersValues: any[];
    editing: boolean;
    layoutOptionsOpen: boolean;
    hideQuickfilters: boolean;
    refreshKey: number;
}
/** Dashboard component that includes an action bar at the top
 * Manages undo stack and quickfilter value
 */
export default class DashboardComponent extends React.Component<DashboardComponentProps, DashboardComponentState> {
    dashboardView: DashboardViewComponent | null;
    static defaultProps: {
        printScaling: boolean;
    };
    static childContextTypes: {
        locale: PropTypes.Requireable<string>;
        activeTables: PropTypes.Requireable<string[]>;
    };
    getChildContext(): {
        locale: string | undefined;
        activeTables: string[];
    };
    constructor(props: any);
    getQuickfilterValues: () => any[];
    componentWillReceiveProps(nextProps: any): void;
    handlePrint: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
    handleSaveDesignFile: () => any;
    handleSettings: () => any;
    handleToggleEditing: () => void;
    handleOpenLayoutOptions: () => void;
    handleRefreshData: () => void;
    handleStyleChange: (style: any) => void;
    handleDesignChange: (design: any) => void;
    handleShowQuickfilters: () => void;
    handleUpgrade: () => void;
    getCompiledFilters(): JsonQLFilter[];
    renderEditingSwitch(): React.DetailedReactHTMLElement<{
        key: string;
        className: string;
        onClick: () => void;
    }, HTMLElement>;
    renderStyleItem(style: any): React.DetailedReactHTMLElement<{
        key: any;
        className: string;
        onClick: any;
    }, HTMLElement>;
    renderStyle(): React.DetailedReactHTMLElement<{
        type: string;
        key: string;
        className: string;
        onClick: () => void;
    }, HTMLElement>;
    renderActionLinks(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderTitleBar(): React.DetailedReactHTMLElement<{
        style: {
            height: number;
            padding: number;
        };
    }, HTMLElement>;
    renderQuickfilter(): React.CElement<import("../quickfilter/QuickfiltersComponent").QuickfiltersComponentProps, QuickfiltersComponent>;
    refDashboardView: (el: any) => any;
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "grid";
            gridTemplateRows: string;
            height: string;
        };
    }, HTMLElement>;
}

import PropTypes from "prop-types";
import React, { ReactNode } from "react";
import AutoSizeComponent from "react-library/lib/AutoSizeComponent";
import UndoStack from "../UndoStack";
import { DataSource, Schema } from "mwater-expressions";
import { MapDataSource } from "./MapDataSource";
import { MapDesign } from "./MapDesign";
import { JsonQLFilter } from "../JsonQLFilter";
export interface MapComponentProps {
    schema: Schema;
    dataSource: DataSource;
    mapDataSource: MapDataSource;
    design: MapDesign;
    onDesignChange?: (design: MapDesign) => void;
    /** Called with (tableId, rowId) when item is clicked */
    onRowClick?: (tableId: string, rowId: any) => void;
    /** Extra filters to apply to view */
    extraFilters?: JsonQLFilter[];
    /** Extra element to include in title at left */
    titleElem?: ReactNode;
    /** Extra elements to add to right */
    extraTitleButtonsElem?: ReactNode;
    /** True to enable quickfilters */
    enableQuickfilters?: boolean;
    /** Locked quickfilter values. See README in quickfilters */
    quickfilterLocks?: any[];
    /** Initial quickfilter values */
    quickfiltersValues?: any[];
    /** True to hide title bar and related controls */
    hideTitleBar?: boolean;
}
interface MapComponentState {
    undoStack: UndoStack;
    transientDesign: MapDesign;
    zoomLocked: boolean;
    /** Values of quickfilters */
    quickfiltersValues: any[] | null;
    /** True to hide quickfilters */
    hideQuickfilters: boolean;
}
/** Map with designer on right */
export default class MapComponent extends React.Component<MapComponentProps, MapComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    constructor(props: MapComponentProps);
    componentDidUpdate(prevProps: MapComponentProps): void;
    handleUndo: () => void;
    handleRedo: () => void;
    handleShowQuickfilters: () => void;
    handleZoomLockClick: () => void;
    renderActionLinks(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderHeader(): React.DetailedReactHTMLElement<{
        style: {
            padding: number;
            borderBottom: string;
            gridArea: "header";
        };
    }, HTMLElement>;
    handleDesignChange: (design: any) => void;
    getDesign(): MapDesign;
    handleToggleDesignPanel: () => void;
    getQuickfilterValues: () => any[];
    renderView(): React.CElement<import("react-library/lib/AutoSizeComponent").AutoSizeComponentProps, AutoSizeComponent>;
    getCompiledFilters(): {
        table: string;
        jsonql: import("jsonql").JsonQLExpr;
    }[];
    renderQuickfilter(): React.DetailedReactHTMLElement<{
        style: {
            gridArea: "quickfilters";
            borderBottom: string;
        };
    }, HTMLElement>;
    renderDesigner(): React.DetailedReactHTMLElement<{
        style: {
            gridArea: "designer";
            borderLeft: string;
        };
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: string;
            height: string;
            display: "grid";
            gridTemplateColumns: string;
            gridTemplateRows: string;
            gridTemplateAreas: "\"header designer\" \"quickfilters designer\" \"view designer\"";
        };
    }, HTMLElement>;
}
export {};

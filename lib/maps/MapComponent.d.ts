import PropTypes from "prop-types";
import React, { ReactNode } from "react";
import MapControlComponent from "./MapControlComponent";
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
}
interface MapComponentState {
    undoStack: UndoStack;
    transientDesign: MapDesign;
    zoomLocked: boolean;
}
/** Map with designer on right */
export default class MapComponent extends React.Component<MapComponentProps, MapComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    constructor(props: MapComponentProps);
    componentWillReceiveProps(nextProps: any): void;
    handleUndo: () => void;
    handleRedo: () => void;
    handleZoomLockClick: () => void;
    renderActionLinks(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderHeader(): React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            top: number;
            left: number;
            right: number;
            height: number;
            padding: number;
            borderBottom: string;
        };
    }, HTMLElement>;
    handleDesignChange: (design: any) => void;
    getDesign(): MapDesign;
    renderView(): React.CElement<import("react-library/lib/AutoSizeComponent").AutoSizeComponentProps, AutoSizeComponent>;
    renderDesigner(): React.CElement<import("./MapControlComponent").MapControlComponentProps, MapControlComponent>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: string;
            height: string;
            position: "relative";
        };
    }, HTMLElement>;
}
export {};

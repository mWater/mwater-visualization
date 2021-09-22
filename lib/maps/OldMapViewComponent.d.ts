import PropTypes from "prop-types";
import React, { ReactNode } from "react";
import LeafletMapComponent from "./LeafletMapComponent";
import { Schema, DataSource } from "mwater-expressions";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
import { JsonQLFilter } from "../JsonQLFilter";
import { MapDesign } from "./MapDesign";
import { MapDataSource } from "./MapDataSource";
import { MapScope } from "./MapUtils";
interface OldMapViewComponentProps {
    schema: Schema;
    dataSource: DataSource;
    mapDataSource: MapDataSource;
    design: MapDesign;
    onDesignChange?: (design: MapDesign) => void;
    /** Width in pixels */
    width: number;
    /** Height in pixels */
    height: number;
    /** Called with (tableId, rowId) when item is clicked */
    onRowClick?: (tableId: string, rowId: any) => void;
    /** Extra filters to apply to view */
    extraFilters?: JsonQLFilter[];
    /** scope of the map (when a layer self-selects a particular scope) */
    scope?: MapScope;
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange: (scope: MapScope | null) => void;
    /** Whether the map be draggable with mouse/touch or not. Default true */
    dragging?: boolean;
    /** Whether the map can be zoomed by touch-dragging with two fingers. Default true */
    touchZoom?: boolean;
    /** Whether the map can be zoomed by using the mouse wheel. Default true */
    scrollWheelZoom?: boolean;
    /** Whether changes to zoom level should be persisted. Default false  */
    zoomLocked?: boolean;
}
export default class OldMapViewComponent extends React.Component<OldMapViewComponentProps, {
    popupContents: ReactNode;
    legendHidden: boolean;
}> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    leafletMap?: LeafletMapComponent;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: any): void;
    performAutoZoom(): void;
    handleBoundsChange: (bounds: any) => void;
    handleGridClick: (layerViewId: any, ev: any) => void;
    getCompiledFilters(): JsonQLFilter[];
    renderLegend(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    renderPopup(): React.CElement<any, ModalPopupComponent> | null;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: number;
            height: number;
            position: "relative";
        };
    }, HTMLElement>;
}
export {};

/// <reference types="react" />
import { DataSource, Schema } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter";
import { MapDesign } from "./MapDesign";
import { MapDataSource } from "./MapDataSource";
import { MapScope } from "./MapUtils";
import "maplibre-gl/dist/maplibre-gl.css";
import "./VectorMapViewComponent.css";
/** Component that displays just the map, using vector tile technology */
export declare function VectorMapViewComponent(props: {
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
    onScopeChange?: (scope: MapScope | null) => void;
    /** Whether the map be draggable with mouse/touch or not. Default true */
    dragging?: boolean;
    /** Whether the map can be zoomed by touch-dragging with two fingers. Default true */
    touchZoom?: boolean;
    /** Whether the map can be zoomed by using the mouse wheel. Default true */
    scrollWheelZoom?: boolean;
    /** Whether changes to zoom level should be persisted. Default false  */
    zoomLocked?: boolean;
    /** Locale to use */
    locale: string;
    /** Increment to force refresh */
    refreshTrigger?: number;
    /** Optional callback that gets updated MapLibre map each render. Used to allow
     * external zooming/panning.
     */
    onMapUpdate?: (map: maplibregl.Map) => void;
}): JSX.Element;

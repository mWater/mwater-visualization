import { Expr } from "mwater-expressions";
import { Axis } from "../axes/Axis";
import { HoverOverItem } from "./maps";
/** Layer which draws a buffer around geometries (i.e. a radius circle around points) */
export interface BufferLayerDesign {
    /** table to get data from */
    table: string;
    /** axes (see below) */
    axes: {
        /** where to draw buffers around */
        geometry: Axis | null;
        /** color axis */
        color: Axis | null;
    };
    /** optional logical expression to filter by */
    filter?: Expr;
    /** color of layer (e.g. #FF8800). Color axis overrides */
    color?: string;
    /** Opacity to fill the circles (0-1) */
    fillOpacity: number;
    /** radius to draw in meters */
    radius: number;
    /** minimum zoom level */
    minZoom?: number;
    /** maximum zoom level */
    maxZoom?: number;
    /** True to union circles together. Makes ids unavailable as geometries are combined.
     * Only implemented for vector tiles */
    unionShapes?: boolean;
    /** contains items: which is BlocksLayoutManager items. Will be displayed when the circle is clicked */
    popup: any;
    hoverOver: {
        items: HoverOverItem[];
    };
    /** customizable filtering for popup. See PopupFilterJoins.md */
    popupFilterJoins: any;
}

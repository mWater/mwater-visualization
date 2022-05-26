/// <reference types="react" />
import { LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./NewMapViewComponent.css";
/** This must be called to set the appropriate key before use. If it is not set, vector maps will not function.
 * Maps will fall back to leaflet if the key is not set or if set to ""
 */
export declare function setMapTilerApiKey(key: string): void;
/** Check if vector maps are enabled by setting API key */
export declare function areVectorMapsEnabled(): boolean;
export declare type BaseLayer = "bing_road" | "bing_aerial" | "cartodb_positron" | "cartodb_dark_matter" | "blank";
/** Loads a vector map, refreshing the WebGL context as needed */
export declare function useVectorMap(options: {
    divRef: HTMLDivElement | null;
    bounds?: LngLatBoundsLike;
    scrollZoom?: boolean;
    dragPan?: boolean;
    touchZoomRotate?: boolean;
}): import("maplibre-gl").Map | undefined;
/** Sets cursor as pointer when over any layers with the specified ids */
export declare function useHoverCursor(map: maplibregl.Map | undefined, layerIds: string[]): void;
/** Apply user style to a map with base style */
export declare function useStyleMap(options: {
    map: maplibregl.Map | undefined;
    baseLayer: BaseLayer;
    baseLayerOpacity?: number | null;
    userStyle: maplibregl.StyleSpecification | null | undefined;
}): void;
/** Loads a base style for the map */
export declare function useBaseStyle(baseLayer: BaseLayer): import("maplibre-gl").StyleSpecification | null;
/** Combines a base style and a user style */
export declare function mergeBaseAndUserStyle(baseStyle: maplibregl.StyleSpecification | null | undefined, userStyle: maplibregl.StyleSpecification | null | undefined, baseLayerOpacity?: number | null): import("maplibre-gl").StyleSpecification | null;
/** Resizes map to width and height, throttling to avoid flicker and possibly bugs in maplibre when resizing too quickly */
export declare function useThrottledMapResize(map: maplibregl.Map | undefined, width: number, height: number): void;
export declare function AttributionControl(props: {
    baseLayer: BaseLayer;
    extraText?: string;
}): JSX.Element;
export declare function VectorMapLogo(props: {
    baseLayer: BaseLayer;
}): JSX.Element | null;

import Layer from "./Layer";
import { Schema, DataSource } from "mwater-expressions";
import { JsonQLFilter } from "../index";
import React from "react";
/**
 * Layer that is composed of multiple tile urls that can be switched between
 * Loads legend from the server as well
 */
export interface SwitchableTileUrlLayerDesign {
    options: SwitchableOption[];
    /** id of active option */
    activeOption: string;
    /** Minimum zoom level allowed */
    minZoom?: number;
    /** Maximum zoom level allowed */
    maxZoom?: number;
    /** Optional note to display */
    note?: string;
}
/** One option that can be selected with its own urls */
interface SwitchableOption {
    /** Unique id of the option */
    id: string;
    /** Name of the option */
    name: string;
    /** Url with {z}, {x}, {y} included to get tiles */
    tileUrl?: string;
    /** Url with {z}, {x}, {y} included to get utf grid tiles */
    utfGridUrl?: string;
    /** Url to get legend html from. {name} will be replaced with url-encoded name of layer */
    legendUrl?: string;
}
/** Layer that has multiple tile urls that it can display. Switchable but not editable */
export default class SwitchableTileUrlLayer extends Layer<SwitchableTileUrlLayerDesign> {
    getLayerDefinitionType(): "TileUrl";
    getMinZoom(design: SwitchableTileUrlLayerDesign): number | null;
    getMaxZoom(design: SwitchableTileUrlLayerDesign): number;
    /** Gets the tile url for definition type "TileUrl" */
    getTileUrl(design: SwitchableTileUrlLayerDesign, filters: JsonQLFilter[]): string | null;
    /** Gets the utf grid url for definition type "TileUrl" */
    getUtfGridUrl(design: SwitchableTileUrlLayerDesign, filters: JsonQLFilter[]): string | null;
    getLegend(design: SwitchableTileUrlLayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters: JsonQLFilter[]): JSX.Element | null;
    /** True if layer can be edited */
    isEditable(): boolean;
    createDesignerElement(options: {
        design: SwitchableTileUrlLayerDesign;
        schema: Schema;
        dataSource: DataSource;
        onDesignChange: (design: SwitchableTileUrlLayerDesign) => void;
        filters: JsonQLFilter[];
    }): React.ReactElement<{}>;
}
export {};

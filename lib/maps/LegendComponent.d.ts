/// <reference types="react" />
import { DataSource, Schema } from "mwater-expressions";
import { JsonQLFilter } from "..";
import { MapLayerView } from "./MapDesign";
export default function LegendComponent(props: {
    schema: Schema;
    dataSource: DataSource;
    layerViews: MapLayerView[];
    zoom: number | null;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters: JsonQLFilter[];
    locale: string;
    onHide: () => void;
}): JSX.Element | null;

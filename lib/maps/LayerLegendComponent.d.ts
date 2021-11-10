import React from "react";
import LegendGroup from "./LegendGroup";
import { Schema } from "mwater-expressions";
import { Axis } from "../axes/Axis";
export interface LayerLegendComponentProps {
    schema: Schema;
    name: string;
    radiusLayer?: boolean;
    axis?: Axis;
    symbol?: string;
    markerSize?: number;
    defaultColor?: string;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters?: any;
    locale?: string;
}
export default class LayerLegendComponent extends React.Component<LayerLegendComponentProps> {
    static defaultProps: {
        radiusLayer: boolean;
    };
    getCategories(): import("../axes/Axis").AxisCategory[] | undefined;
    render(): React.CElement<import("./LegendGroup").LegendGroupProps, LegendGroup>;
}

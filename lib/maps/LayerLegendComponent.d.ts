import React from "react";
import { Schema } from "mwater-expressions";
interface LayerLegendComponentProps {
    schema: Schema;
    name: string;
    radiusLayer?: boolean;
    axis?: any;
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
    render(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
}
export {};

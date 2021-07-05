import React from "react";
interface LayerLegendComponentProps {
    schema: any;
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
    getCategories(): {
        value: any;
        label: any;
    }[] | undefined;
    render(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
}
export {};

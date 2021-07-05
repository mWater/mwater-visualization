import React from "react";
interface LegendGroupProps {
    items?: any;
    radiusLayer?: boolean;
    defaultColor?: string;
    name?: string;
    symbol?: string;
    markerSize?: number;
}
export default class LegendGroup extends React.Component<LegendGroupProps> {
    static defaultProps: {
        items: never[];
        radiusLayer: boolean;
        symbol: null;
    };
    render(): React.DetailedReactHTMLElement<{
        style: {
            marginBottom: number;
        };
    }, HTMLElement>;
}
export {};

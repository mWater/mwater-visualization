import React from "react";
export interface LegendGroupProps {
    items?: {
        color: string;
        name: string;
    }[];
    radiusLayer?: boolean;
    defaultColor?: string;
    name?: string;
    symbol?: string | null;
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

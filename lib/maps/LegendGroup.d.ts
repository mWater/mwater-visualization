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
    static initClass(): void;
    render(): React.DetailedReactHTMLElement<{
        style: {
            marginBottom: number;
        };
    }, HTMLElement>;
}
export {};

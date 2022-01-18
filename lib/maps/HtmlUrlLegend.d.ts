import React from "react";
export interface HtmlUrlLegendProps {
    url: string;
}
interface HtmlUrlLegendState {
    html: string;
}
/** Loads a html legend and sanitizes it from a url */
export declare class HtmlUrlLegend extends React.Component<HtmlUrlLegendProps, HtmlUrlLegendState> {
    constructor(props: HtmlUrlLegendProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: HtmlUrlLegendProps): void;
    loadLegend(): void;
    render(): JSX.Element;
}
export {};

import React from "react";
export interface GridLayoutComponentProps {
    width: number;
    items?: any;
    onItemsChange?: any;
    renderWidget: any;
}
export default class GridLayoutComponent extends React.Component<GridLayoutComponentProps> {
    renderPageBreaks(layoutEngine: any, layouts: any): React.DetailedReactHTMLElement<{
        className: string;
        key: string;
        style: {
            position: "absolute";
            top: number;
        };
    }, HTMLElement>[];
    render(): React.ReactElement<{
        style: {
            height: string;
            position: string;
        };
    }, string | React.JSXElementConstructor<any>>;
}

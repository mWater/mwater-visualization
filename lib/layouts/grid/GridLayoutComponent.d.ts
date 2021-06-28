import React from "react";
interface GridLayoutComponentProps {
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
    }, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
}
export {};

import React from "react";
interface WidgetScopesViewComponentProps {
    /** lookup of id to scope (see WidgetScoper for definition) */
    scopes: any;
    onRemoveScope: any;
}
export default class WidgetScopesViewComponent extends React.Component<WidgetScopesViewComponentProps> {
    renderScope: (id: any, scope: any) => React.DetailedReactHTMLElement<{
        key: any;
        style: {
            cursor: string;
            borderRadius: number;
            border: string;
            padding: string;
            color: string;
            backgroundColor: string;
            display: string;
            marginLeft: number;
            marginRight: number;
        };
        onClick: any;
    }, HTMLElement> | null;
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
}
export {};

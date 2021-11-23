import React from "react";
export interface BaseLayerDesignerComponentProps {
    /** See Map Design.md */
    design: any;
    onDesignChange: any;
}
export default class BaseLayerDesignerComponent extends React.Component<BaseLayerDesignerComponentProps> {
    updateDesign(changes: any): any;
    handleBaseLayerChange: (baseLayer: any) => any;
    renderBaseLayer(id: any, name: any): React.DetailedReactHTMLElement<{
        key: any;
        className: string;
        style: {
            display: "inline-block";
        };
        onClick: any;
    }, HTMLElement>;
    handleOpacityChange: (newValue: any) => any;
    renderOpacityControl(): React.DetailedReactHTMLElement<{
        className: string;
        style: {
            paddingTop: number;
        };
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}

import React from "react";
interface ColorComponentProps {
    color?: string;
    onChange?: any;
}
interface ColorComponentState {
    open: any;
    advanced: any;
}
export default class ColorComponent extends React.Component<ColorComponentProps, ColorComponentState> {
    constructor(props: any);
    handleClick: () => void;
    handleClose: (color: any) => any;
    handleReset: () => any;
    handleTransparent: () => any;
    handleAdvanced: () => void;
    render(): React.DetailedReactHTMLElement<{
        style: {
            position: "relative";
            display: "inline-block";
        };
    }, HTMLElement>;
}
export {};

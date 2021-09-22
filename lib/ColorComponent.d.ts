import React from "react";
interface ColorComponentProps {
    color: string | null | undefined;
    onChange: (value: string | null) => void;
}
interface ColorComponentState {
    open: any;
    advanced: any;
}
export default class ColorComponent extends React.Component<ColorComponentProps, ColorComponentState> {
    constructor(props: any);
    handleClick: () => void;
    handleClose: (color: any) => void;
    handleReset: () => void;
    handleTransparent: () => void;
    handleAdvanced: () => void;
    render(): React.DetailedReactHTMLElement<{
        style: {
            position: "relative";
            display: "inline-block";
        };
    }, HTMLElement>;
}
export {};

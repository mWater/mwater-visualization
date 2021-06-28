import React from "react";
interface AxisColorEditorComponentProps {
    schema: any;
    axis: any;
    /** Called with new axis */
    onChange: any;
    /** Categories of the axis */
    categories?: any;
    /** is the color map reorderable */
    reorderable?: boolean;
    defaultColor?: string;
    /** True to allow excluding of values via checkboxes */
    allowExcludedValues?: boolean;
    /** True to start values expanded */
    initiallyExpanded?: boolean;
    /** True to automatically set the colors if blank */
    autosetColors?: boolean;
}
interface AxisColorEditorComponentState {
    mode: any;
}
export default class AxisColorEditorComponent extends React.Component<AxisColorEditorComponentProps, AxisColorEditorComponentState> {
    static initClass(): void;
    constructor(props: any);
    componentWillMount(): void;
    componentDidUpdate(): void;
    updateColorMap(): void;
    handleSelectPalette: () => void;
    handleResetPalette: () => void;
    handlePaletteChange: (palette: any) => void;
    handleCancelCustomize: () => void;
    renderPreview(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

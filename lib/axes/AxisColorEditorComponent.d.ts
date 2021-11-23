import React from "react";
import { Axis, AxisCategory, ColorMap } from "./Axis";
import { Schema } from "mwater-expressions";
export interface AxisColorEditorComponentProps {
    schema: Schema;
    axis: Axis;
    /** Called with new axis */
    onChange: (axis: Axis) => void;
    /** Categories of the axis */
    categories?: AxisCategory[];
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
    static defaultProps: {
        reorderable: boolean;
        autosetColors: boolean;
    };
    constructor(props: any);
    componentWillMount(): void;
    componentDidUpdate(): void;
    updateColorMap(): void;
    handleSelectPalette: () => void;
    handleResetPalette: () => void;
    handlePaletteChange: (palette: ColorMap) => void;
    handleCancelCustomize: () => void;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

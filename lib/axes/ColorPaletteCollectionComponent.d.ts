import React from "react";
import { Axis, AxisCategory } from "./Axis";
interface ColorPaletteCollectionComponentProps {
    onPaletteSelected: any;
    axis: Axis;
    categories: AxisCategory[];
    onCancel: any;
}
export default class ColorPaletteCollectionComponent extends React.Component<ColorPaletteCollectionComponentProps> {
    static palettes: {
        type: string;
        reversed: boolean;
    }[];
    onPaletteSelected: (index: any) => any;
    renderCancel: () => React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | null;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

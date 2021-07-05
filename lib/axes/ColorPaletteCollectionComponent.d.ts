import React from "react";
interface ColorPaletteCollectionComponentProps {
    onPaletteSelected: any;
    axis: any;
    categories: any;
    onCancel: any;
}
export default class ColorPaletteCollectionComponent extends React.Component<ColorPaletteCollectionComponentProps> {
    static palettes: {
        type: string;
        reversed: boolean;
    }[];
    onPaletteSelected: (index: any) => any;
    renderCancel: () => React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

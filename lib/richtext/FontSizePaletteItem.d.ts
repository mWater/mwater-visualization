import React from "react";
interface FontSizePaletteItemProps {
    /** Called with "125%", etc. */
    onSetSize: any;
    /** should the popup be under or over? */
    position?: string;
}
interface FontSizePaletteItemState {
    open: any;
}
export default class FontSizePaletteItem extends React.Component<FontSizePaletteItemProps, FontSizePaletteItemState> {
    static defaultProps: {
        position: string;
    };
    constructor(props: any);
    handleMouseDown: (ev: any) => void;
    renderSize(label: any, value: any): React.DetailedReactHTMLElement<{
        className: string;
        onMouseDown: (ev: React.MouseEvent<HTMLElement, MouseEvent>) => void;
        key: any;
    }, HTMLElement>;
    renderSizes(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.CElement<{
        onClickOut: () => void;
    }, React.Component<{
        onClickOut: () => void;
    }, any, any>>;
}
export {};

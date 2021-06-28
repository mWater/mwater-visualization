import React from "react";
interface FontColorPaletteItemProps {
    /** Called with "#FF8800", etc. */
    onSetColor: any;
    /** should the popup be under or over? */
    position?: string;
}
interface FontColorPaletteItemState {
    open: any;
}
export default class FontColorPaletteItem extends React.Component<FontColorPaletteItemProps, FontColorPaletteItemState> {
    static initClass(): void;
    constructor(props: any);
    handleMouseDown: (ev: any) => void;
    render(): React.CElement<{
        onClickOut: () => void;
    }, React.Component<{
        onClickOut: () => void;
    }, any, any>>;
}
export {};

import React from "react";
export interface FontColorPaletteItemProps {
    /** Called with "#FF8800", etc. */
    onSetColor: any;
    /** should the popup be under or over? */
    position?: string;
}
interface FontColorPaletteItemState {
    open: any;
}
export default class FontColorPaletteItem extends React.Component<FontColorPaletteItemProps, FontColorPaletteItemState> {
    static defaultProps: {
        position: string;
    };
    constructor(props: any);
    handleMouseDown: (ev: any) => void;
    render(): React.CElement<{
        onClickOut: () => void;
    }, React.Component<{
        onClickOut: () => void;
    }, any, any>>;
}
export {};

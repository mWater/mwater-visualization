import React from "react";
export interface PaletteItemComponentProps {
    /** Create the drag item */
    createItem: any;
    title?: any;
    subtitle?: any;
}
export default class PaletteItemComponent extends React.Component<PaletteItemComponentProps> {
    render(): React.CElement<{
        createDragItem: any;
    }, React.Component<{
        createDragItem: any;
    }, any, any>>;
}

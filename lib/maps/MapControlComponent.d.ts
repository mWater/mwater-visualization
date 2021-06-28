import React from "react";
interface MapControlComponentProps {
    /** Schema to use */
    schema: any;
    dataSource: any;
    /** See Map Design.md */
    design: any;
    onDesignChange: any;
}
export default class MapControlComponent extends React.Component<MapControlComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            padding: number;
        };
    }, HTMLElement>;
}
export {};

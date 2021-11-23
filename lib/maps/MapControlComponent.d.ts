import React from "react";
import { DataSource, Schema } from "mwater-expressions";
export interface MapControlComponentProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
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

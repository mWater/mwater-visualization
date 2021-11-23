import PropTypes from "prop-types";
import React from "react";
import { DataSource, Schema } from "mwater-expressions";
export interface AddLayerComponentProps {
    /** Number of layers that already exist */
    layerNumber: number;
    /** See Map Design.md */
    design: any;
    /** Called with new design */
    onDesignChange: any;
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
}
export default class AddLayerComponent extends React.Component<AddLayerComponentProps> {
    static contextTypes: {
        addLayerElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
    };
    handleAddLayer: (newLayer: any) => any;
    handleAddLayerView: (layerView: any) => any;
    render(): any;
}

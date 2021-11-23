import PropTypes from "prop-types";
import React from "react";
import { DataSource, Schema } from "mwater-expressions";
export interface MapDesignerComponentProps {
    /** Schema to use */
    schema: Schema;
    /** Data source to use */
    dataSource: DataSource;
    /** See Map Design.md */
    design: any;
    /** Called with new design */
    onDesignChange: any;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters?: any;
}
export default class MapDesignerComponent extends React.Component<MapDesignerComponentProps> {
    static childContextTypes: {
        activeTables: PropTypes.Requireable<string[]>;
    };
    getChildContext(): {
        activeTables: string[];
    };
    handleAttributionChange: (text: any) => any;
    handleAutoBoundsChange: (value: any) => any;
    handleShowLayerSwitcherChange: (value: any) => any;
    handleConvertToClusterMap: () => any;
    handleInitialLegendDisplayChange: (value: any) => any;
    renderOptionsTab(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            padding: number;
        };
    }, HTMLElement>;
}

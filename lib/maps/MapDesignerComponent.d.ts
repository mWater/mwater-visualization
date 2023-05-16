import PropTypes from "prop-types";
import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import { MapDesign } from "./MapDesign";
import { JsonQLFilter } from "../JsonQLFilter";
export interface MapDesignerComponentProps {
    /** Schema to use */
    schema: Schema;
    /** Data source to use */
    dataSource: DataSource;
    /** See Map Design.md */
    design: MapDesign;
    /** Called with new design */
    onDesignChange: (design: MapDesign) => void;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters?: JsonQLFilter[];
    /** True to enable quickfilters */
    enableQuickfilters?: boolean;
}
export default class MapDesignerComponent extends React.Component<MapDesignerComponentProps> {
    static childContextTypes: {
        activeTables: PropTypes.Requireable<string[]>;
    };
    getChildContext(): {
        activeTables: string[];
    };
    handleAttributionChange: (text: any) => void;
    handleAutoBoundsChange: (value: any) => void;
    handleShowLayerSwitcherChange: (value: any) => void;
    handleConvertToClusterMap: () => void;
    handleConvertToMarkersMap: () => void;
    handleInitialLegendDisplayChange: (value: any) => void;
    renderOptionsTab(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            padding: number;
        };
    }, HTMLElement>;
}

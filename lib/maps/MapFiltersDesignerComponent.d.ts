import PropTypes from "prop-types";
import React from "react";
interface MapFiltersDesignerComponentProps {
    /** Schema to use */
    schema: any;
    /** Data source to use */
    dataSource: any;
    /** See Map Design.md */
    design: any;
    /** Called with new design */
    onDesignChange: any;
}
export default class MapFiltersDesignerComponent extends React.Component<MapFiltersDesignerComponentProps> {
    static contextTypes: {
        globalFiltersElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
    };
    handleFiltersChange: (filters: any) => any;
    handleGlobalFiltersChange: (globalFilters: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | null;
}
export {};

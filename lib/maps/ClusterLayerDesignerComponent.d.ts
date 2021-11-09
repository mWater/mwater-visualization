import React from "react";
import { DataSource, Schema } from "mwater-expressions";
interface ClusterLayerDesignerComponentProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
    /** Design of the design */
    design: any;
    /** Called with new design */
    onDesignChange: any;
    filters?: any;
}
export default class ClusterLayerDesignerComponent extends React.Component<ClusterLayerDesignerComponentProps> {
    update(updates: any): any;
    updateAxes(changes: any): any;
    handleTableChange: (table: any) => any;
    handleGeometryAxisChange: (axis: any) => any;
    handleFilterChange: (expr: any) => any;
    handleTextColorChange: (color: any) => any;
    handleFillColorChange: (color: any) => any;
    renderTable(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderGeometryAxis(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderTextColor(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderFillColor(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderFilter(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

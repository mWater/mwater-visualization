/// <reference types="jquery" />
import React from "react";
declare const _default: {
    new (): {
        onGridClick(ev: any, options: any): {
            row: {
                tableId: any;
                primaryKey: any;
            };
        } | null;
        getMinZoom(design: any): any;
        getMaxZoom(design: any): any;
        getLegend(design: any, schema: any): React.CElement<any, LoadingLegend>;
        getFilterableTables(design: any, schema: any): any[];
        isEditable(): boolean;
        cleanDesign(design: any, schema: any): any;
        validateDesign(design: any, schema: any): null;
        getLayerDefinitionType(): string;
        getJsonQLCss(design: any, schema: any, filters: any): void;
        getTileUrl(design: any, filters: any): void;
        getUtfGridUrl(design: any, filters: any): void;
        getVectorTile(design: any, filters: any): void;
        getBounds(design: any, schema: any, dataSource: any, filters: any, callback: any): any;
        isIncomplete(design: any, schema: any): boolean;
        createDesignerElement(options: any): void;
        getKMLExportJsonQL(design: any, schema: any, filters: any): void;
        getBoundsFromExpr(schema: any, dataSource: any, table: any, geometryExpr: any, filterExpr: any, filters: any, callback: any): any;
    };
};
export default _default;
interface LoadingLegendProps {
    url?: string;
}
interface LoadingLegendState {
    html: any;
}
declare class LoadingLegend extends React.Component<LoadingLegendProps, LoadingLegendState> {
    constructor(props: any);
    componentDidMount(): JQuery.jqXHR<any>;
    componentWillReceiveProps(nextProps: any): JQuery.jqXHR<any> | undefined;
    render(): React.DetailedReactHTMLElement<{
        style: {
            font: "14px/16px Arial, Helvetica, sans-serif";
            color: "#555";
        };
        dangerouslySetInnerHTML: {
            __html: any;
        };
    }, HTMLElement>;
}

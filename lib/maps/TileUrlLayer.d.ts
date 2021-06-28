import React from "react";
declare const _default: {
    new (): {
        getLayerDefinitionType(): string;
        getTileUrl(design: any, filters: any): any;
        getUtfGridUrl(design: any, filters: any): null;
        getMinZoom(design: any): any;
        getMaxZoom(design: any): any;
        isEditable(): boolean;
        isIncomplete(design: any, schema: any): boolean;
        createDesignerElement(options: any): React.CElement<TileUrlLayerDesignerComponentProps, TileUrlLayerDesignerComponent>;
        cleanDesign(design: any, schema: any): any;
        validateDesign(design: any, schema: any): "Missing Url" | null;
        getJsonQLCss(design: any, schema: any, filters: any): void;
        getVectorTile(design: any, filters: any): void;
        onGridClick(ev: any, options: any): null;
        getBounds(design: any, schema: any, dataSource: any, filters: any, callback: any): any;
        getLegend(design: any, schema: any, name: any, dataSource: any, locale: any, filters?: never[]): null;
        getFilterableTables(design: any, schema: any): never[];
        getKMLExportJsonQL(design: any, schema: any, filters: any): void;
        getBoundsFromExpr(schema: any, dataSource: any, table: any, geometryExpr: any, filterExpr: any, filters: any, callback: any): any;
    };
};
export default _default;
interface TileUrlLayerDesignerComponentProps {
    /** Design of the marker layer */
    design: any;
    onDesignChange: any;
}
declare class TileUrlLayerDesignerComponent extends React.Component<TileUrlLayerDesignerComponentProps> {
    handleTileUrlChange: (ev: any) => any;
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
}

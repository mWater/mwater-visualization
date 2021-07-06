export default class Layer {
    getLayerDefinitionType(): string;
    getJsonQLCss(design: any, schema: any, filters: any): void;
    getTileUrl(design: any, filters: any): void;
    getUtfGridUrl(design: any, filters: any): void;
    getVectorTile(design: any, filters: any): void;
    onGridClick(ev: any, options: any): null;
    getBounds(design: any, schema: any, dataSource: any, filters: any, callback: any): any;
    getMinZoom(design: any): null;
    getMaxZoom(design: any): null;
    getLegend(design: any, schema: any, name: any, dataSource: any, locale: any, filters?: never[]): null;
    getFilterableTables(design: any, schema: any): never[];
    isEditable(): boolean;
    isIncomplete(design: any, schema: any): boolean;
    createDesignerElement(options: any): void;
    cleanDesign(design: any, schema: any): any;
    validateDesign(design: any, schema: any): null;
    getKMLExportJsonQL(design: any, schema: any, filters: any): void;
    getBoundsFromExpr(schema: any, dataSource: any, table: any, geometryExpr: any, filterExpr: any, filters: any, callback: any): any;
}

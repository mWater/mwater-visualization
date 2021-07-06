export default class Chart {
    cleanDesign(design: any, schema: any): void;
    validateDesign(design: any, schema: any): void;
    isEmpty(design: any): boolean;
    isAutoHeight(): boolean;
    hasDesignerPreview(): boolean;
    getEditLabel(): string;
    createDesignerElement(options: any): void;
    getData(design: any, schema: any, dataSource: any, filters: any, callback: any): void;
    createViewElement(options: any): void;
    createDropdownItems(design: any, schema: any, widgetDataSource: any, filters: any): never[];
    createDataTable(design: any, schema: any, dataSource: any, data: any, locale: any): void;
    getFilterableTables(design: any, schema: any): void;
    getPlaceholderIcon(): string;
}

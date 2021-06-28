import React from "react";
declare const _default: {
    new (): {
        cleanDesign(design: any, schema: any): any;
        validateDesign(design: any, schema: any): any;
        isAutoHeight(): boolean;
        isEmpty(design: any): boolean;
        hasDesignerPreview(): boolean;
        getEditLabel(): string;
        createDesignerElement(options: any): React.FunctionComponentElement<{
            schema: any;
            dataSource: any;
            design: any;
            filters: any;
            onDesignChange: (design: any) => any;
        }>;
        getData(design: any, schema: any, dataSource: any, filters: any, callback: any): void;
        createViewElement(options: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
        createDropdownItems(design: any, schema: any, widgetDataSource: any, filters: any): never[];
        createDataTable(design: any, schema: any, dataSource: any, data: any, locale: any): any[][];
        getFilterableTables(design: any, schema: any): any[];
        getPlaceholderIcon(): string;
    };
};
export default _default;

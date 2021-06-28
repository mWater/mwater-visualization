import React from "react";
declare const _default: {
    new (): {
        cleanDesign(design: any, schema: any): <Base extends (draft: any) => void>(base?: Base | undefined, ...rest: unknown[]) => any;
        validateDesign(design: any, schema: any): any;
        isEmpty(design: any): boolean;
        createDesignerElement(options: any): React.FunctionComponentElement<{
            schema: any;
            dataSource: any;
            design: <Base extends (draft: any) => void>(base?: Base | undefined, ...rest: unknown[]) => any;
            filters: any;
            onDesignChange: (design: any) => any;
        }>;
        getData(design: any, schema: any, dataSource: any, filters: any, callback: any): void;
        createViewElement(options: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
        createDropdownItems(design: any, schema: any, widgetDataSource: any, filters: any): {
            label: string;
            icon: string;
            onClick: any;
        }[];
        createDataTable(design: any, schema: any, dataSource: any, data: any, locale: any): any[][] | undefined;
        getFilterableTables(design: any, schema: any): any[];
        getPlaceholderIcon(): string;
        isAutoHeight(): boolean;
        hasDesignerPreview(): boolean;
        getEditLabel(): string;
    };
};
export default _default;

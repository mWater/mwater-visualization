import React from "react";
import Chart from "../Chart";
export default class ImageMosaicChart extends Chart {
    cleanDesign(design: any, schema: any): any;
    validateDesign(design: any, schema: any): string | null;
    isEmpty(design: any): boolean;
    createDesignerElement(options: any): React.FunctionComponentElement<{
        schema: any;
        design: any;
        dataSource: any;
        filters: any;
        onDesignChange: (design: any) => any;
    }>;
    getData(design: any, schema: any, dataSource: any, filters: any, callback: any): any;
    createViewElement(options: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    createDataTable(design: any, schema: any, dataSource: any, data: any): null;
    getFilterableTables(design: any, schema: any): any[];
    getPlaceholderIcon(): string;
}

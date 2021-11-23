import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import Chart, { ChartCreateViewElementOptions } from "../Chart";
import { JsonQLFilter } from "../../..";
export default class ImageMosaicChart extends Chart {
    cleanDesign(design: any, schema: Schema): any;
    validateDesign(design: any, schema: Schema): string | null;
    isEmpty(design: any): boolean;
    createDesignerElement(options: any): React.FunctionComponentElement<{
        schema: any;
        design: any;
        dataSource: any;
        filters: any;
        onDesignChange: (design: any) => any;
    }>;
    getData(design: any, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[] | null, callback: any): void;
    createViewElement(options: ChartCreateViewElementOptions): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    createDataTable(design: any, schema: Schema, dataSource: DataSource, data: any): null;
    getFilterableTables(design: any, schema: Schema): any[];
    getPlaceholderIcon(): string;
}

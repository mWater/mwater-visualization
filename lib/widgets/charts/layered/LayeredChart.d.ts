import React from "react";
import Chart from "../Chart";
import { DataSource, Schema } from "mwater-expressions";
import { LayeredChartDesign } from "./LayeredChartDesign";
export default class LayeredChart extends Chart {
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
    createDataTable(design: LayeredChartDesign, schema: Schema, dataSource: DataSource, data: any, locale: string): any[][];
    getFilterableTables(design: any, schema: any): any[];
    getPlaceholderIcon(): string;
}

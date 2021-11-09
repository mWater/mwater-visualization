import React from "react";
import Chart from "../Chart";
import { DataSource, Schema } from "mwater-expressions";
import { LayeredChartDesign } from "./LayeredChartDesign";
import { WidgetDataSource } from "../../WidgetDataSource";
export default class LayeredChart extends Chart {
    cleanDesign(design: any, schema: Schema): <Base extends (draft: any) => void>(base?: Base | undefined, ...rest: unknown[]) => any;
    validateDesign(design: any, schema: Schema): string | null | undefined;
    isEmpty(design: any): boolean;
    createDesignerElement(options: any): React.FunctionComponentElement<{
        schema: any;
        dataSource: any;
        design: <Base extends (draft: any) => void>(base?: Base | undefined, ...rest: unknown[]) => any;
        filters: any;
        onDesignChange: (design: any) => any;
    }>;
    getData(design: any, schema: Schema, dataSource: DataSource, filters: any, callback: any): void;
    createViewElement(options: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    createDropdownItems(design: any, schema: Schema, widgetDataSource: WidgetDataSource, filters: any): {
        label: string;
        icon: string;
        onClick: any;
    }[];
    createDataTable(design: LayeredChartDesign, schema: Schema, dataSource: DataSource, data: any, locale: string): any[][];
    getFilterableTables(design: any, schema: Schema): any[];
    getPlaceholderIcon(): string;
}

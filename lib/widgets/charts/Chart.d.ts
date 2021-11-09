import { DataSource, Schema } from "mwater-expressions";
import { ReactNode } from "react";
import { WidgetDataSource } from "../WidgetDataSource";
export default class Chart {
    cleanDesign(design: any, schema: Schema): void;
    validateDesign(design: any, schema: Schema): null | undefined | string;
    isEmpty(design: any): boolean;
    isAutoHeight(): boolean;
    hasDesignerPreview(): boolean;
    getEditLabel(): string;
    createDesignerElement(options: any): void;
    getData(design: any, schema: Schema, dataSource: DataSource, filters: any, callback: any): void;
    createViewElement(options: any): ReactNode;
    createDropdownItems(design: any, schema: Schema, widgetDataSource: WidgetDataSource, filters: any): never[];
    createDataTable(design: any, schema: Schema, dataSource: DataSource, data: any, locale: any): void;
    getFilterableTables(design: any, schema: Schema): void;
    getPlaceholderIcon(): string;
}

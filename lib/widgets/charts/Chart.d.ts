import { DataSource, Schema } from "mwater-expressions";
import { ReactNode } from "react";
import { JsonQLFilter } from "../../JsonQLFilter";
import { WidgetScope } from "../../WidgetScope";
import { WidgetDataSource } from "../WidgetDataSource";
export interface ChartCreateViewElementOptions {
    /** schema to use **/
    schema: Schema;
    /** data source to use. Only used when designing, for display uses data **/
    dataSource: DataSource;
    /** Chart design **/
    design: any;
    /** called with new design. null/undefined for readonly **/
    onDesignChange?: {
        (design: any): void;
    } | null;
    /** Data that chart requested */
    data: any;
    /** scope of the widget (when the widget self-selects a particular scope) **/
    scope?: WidgetScope | null;
    /** called with scope of widget **/
    onScopeChange?: (scope: WidgetScope | null) => void;
    /** array of filters to apply.**/
    filters?: JsonQLFilter[];
    /** width in pixels on screen **/
    width?: number;
    /** height in pixels on screen **/
    height?: number;
    /** Called with (tableId, rowId) when item is clicked **/
    onRowClick?: (tableId: string, rowId: any) => void;
}
export default class Chart {
    cleanDesign(design: any, schema: Schema): void;
    validateDesign(design: any, schema: Schema): null | undefined | string;
    isEmpty(design: any): boolean;
    isAutoHeight(): boolean;
    hasDesignerPreview(): boolean;
    getEditLabel(): string;
    createDesignerElement(options: any): void;
    getData(design: any, schema: Schema, dataSource: DataSource, filters: any, callback: any): void;
    createViewElement(options: ChartCreateViewElementOptions): ReactNode;
    createDropdownItems(design: any, schema: Schema, widgetDataSource: WidgetDataSource, filters: any): {
        label: ReactNode;
        icon?: string;
        onClick: () => void;
    }[];
    createDataTable(design: any, schema: Schema, dataSource: DataSource, data: any, locale: any): void;
    getFilterableTables(design: any, schema: Schema): void;
    getPlaceholderIcon(): string;
}

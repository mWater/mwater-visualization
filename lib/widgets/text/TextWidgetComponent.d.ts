import React from "react";
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent";
import { DataSource, Schema } from "mwater-expressions";
import { JsonQLFilter } from "../../JsonQLFilter";
import { TextWidgetDesign } from "./TextWidgetDesign";
export interface TextWidgetComponentProps {
    design: TextWidgetDesign;
    /** Called with new design. null/undefined for readonly */
    onDesignChange?: (design: TextWidgetDesign) => void;
    filters: JsonQLFilter[];
    schema: Schema;
    /** Data source to use for chart */
    dataSource: DataSource;
    widgetDataSource: any;
    width?: number;
    height?: number;
    /** Table that is filtered to have one row */
    singleRowTable?: string;
    namedStrings?: any;
}
export default class TextWidgetComponent extends AsyncLoadComponent<TextWidgetComponentProps, {
    loading: boolean;
    exprValues: any;
    error: any;
    cacheExpiry: any;
}> {
    divComp: HTMLElement | null;
    constructor(props: any);
    isLoadNeeded(newProps: any, oldProps: any): boolean;
    load(props: any, prevProps: any, callback: any): any;
    scrollToTOCEntry(entryId: any): void;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}

import React from "react";
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent";
import { DataSource, Schema } from "mwater-expressions";
export interface TextWidgetComponentProps {
    design: any;
    /** Called with new design. null/undefined for readonly */
    onDesignChange?: any;
    filters?: any;
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
export default class TextWidgetComponent extends AsyncLoadComponent<TextWidgetComponentProps> {
    constructor(props: any);
    isLoadNeeded(newProps: any, oldProps: any): boolean;
    load(props: any, prevProps: any, callback: any): any;
    scrollToTOCEntry(entryId: any): any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}

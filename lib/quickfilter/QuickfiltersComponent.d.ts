import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import { Quickfilter, QuickfilterLock } from "./Quickfilter";
import { QuickfiltersDataSource } from "./QuickfiltersDataSource";
import { JsonQLFilter } from "..";
export interface QuickfiltersComponentProps {
    /** Design of quickfilters. See README.md */
    design: Quickfilter[];
    /** Current values of quickfilters (state of filters selected) */
    values?: any[];
    /** Called when value changes */
    onValuesChange: (values: any[]) => void;
    locks?: QuickfilterLock[];
    schema: Schema;
    dataSource: DataSource;
    quickfiltersDataSource: QuickfiltersDataSource;
    /** Filters to add to restrict quick filter data to */
    filters?: JsonQLFilter[];
    /** True to hide top border */
    hideTopBorder?: boolean;
    /** Called when user hides the quickfilter bar */
    onHide?: () => void;
}
/** Displays quick filters and allows their value to be modified */
export default class QuickfiltersComponent extends React.Component<QuickfiltersComponentProps> {
    renderQuickfilter(item: any, index: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | React.CElement<TextQuickfilterComponentProps, TextQuickfilterComponent> | React.CElement<DateQuickfilterComponentProps, DateQuickfilterComponent> | null;
    render(): React.DetailedReactHTMLElement<{
        style: {
            borderTop: string | undefined;
            borderBottom: string;
            padding: number;
        };
    }, HTMLElement> | null;
}
interface TextQuickfilterComponentProps {
    label: string;
    schema: any;
    /** See QuickfiltersDataSource */
    quickfiltersDataSource: any;
    expr: any;
    index: number;
    /** Current value of quickfilter (state of filter selected) */
    value?: any;
    /** Called when value changes */
    onValueChange?: any;
    /** true to display multiple values */
    multi?: boolean;
    /** Filters to add to restrict quick filter data to */
    filters?: JsonQLFilter[];
}
declare class TextQuickfilterComponent extends React.Component<TextQuickfilterComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "inline-block";
            paddingRight: number;
        };
    }, HTMLElement>;
}
interface DateQuickfilterComponentProps {
    label?: string;
    schema: any;
    expr: any;
    /** Current value of quickfilter (state of filter selected) */
    value?: any;
    onValueChange: any;
}
declare class DateQuickfilterComponent extends React.Component<DateQuickfilterComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "inline-block";
            paddingRight: number;
        };
    }, HTMLElement>;
}
export {};

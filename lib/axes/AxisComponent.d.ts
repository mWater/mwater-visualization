import React from "react";
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent";
import AxisColorEditorComponent from "./AxisColorEditorComponent";
import CategoryMapComponent from "./CategoryMapComponent";
interface AxisComponentProps {
    /** schema to use */
    schema: any;
    dataSource: any;
    /** Table to use */
    table: string;
    /** Optional types to limit to */
    types?: any;
    aggrNeed: any;
    /** See Axis Design.md */
    value?: any;
    /** Called when changes */
    onChange: any;
    /** Makes this a required value */
    required?: boolean;
    /** Shows the color map */
    showColorMap?: boolean;
    /** Is the draw order reorderable */
    reorderable?: boolean;
    /** Should a color map be automatically created from a default palette */
    autosetColors?: boolean;
    /** True to allow excluding of values via checkboxes */
    allowExcludedValues?: boolean;
    defaultColor?: string;
    /** Show format control for numeric values */
    showFormat?: boolean;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters?: any;
}
export default class AxisComponent extends AsyncLoadComponent<AxisComponentProps> {
    static initClass(): void;
    constructor(props: any);
    isLoadNeeded(newProps: any, oldProps: any): boolean;
    load(props: any, prevProps: any, callback: any): any;
    handleExprChange: (expr: any) => any;
    handleFormatChange: (ev: any) => any;
    handleXformTypeChange: (type: any) => any;
    handleXformChange: (xform: any) => any;
    cleanAxis(axis: any): any;
    renderXform(axis: any): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<{
        value: any;
        options: ({
            value: null;
            label: string;
        } | {
            value: string;
            label: string;
        })[];
        onChange: (type: any) => any;
    }, React.Component<{
        value: any;
        options: ({
            value: null;
            label: string;
        } | {
            value: string;
            label: string;
        })[];
        onChange: (type: any) => any;
    }, any, any>> | undefined;
    renderColorMap(axis: any): (React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<any, AxisColorEditorComponent>)[] | null;
    renderExcludedValues(axis: any): (React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<any, CategoryMapComponent>)[] | null;
    renderFormat(axis: any): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

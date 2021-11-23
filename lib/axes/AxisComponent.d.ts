import PropTypes from "prop-types";
import React from "react";
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent";
import { DataSource, LiteralType, Schema } from "mwater-expressions";
import * as ui from "../UIComponents";
import AxisColorEditorComponent from "./AxisColorEditorComponent";
import CategoryMapComponent from "./CategoryMapComponent";
import { JsonQLFilter } from "../JsonQLFilter";
import { Axis } from "./Axis";
export interface AxisComponentProps {
    schema: Schema;
    dataSource: DataSource;
    /** Table to use */
    table: string;
    /** Optional types to limit to */
    types?: LiteralType[];
    aggrNeed: "none" | "optional" | "required";
    value?: Axis;
    onChange: (axis: Axis | null) => void;
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
    defaultColor?: string | null;
    /** Show format control for numeric values */
    showFormat?: boolean;
    /** Filters to apply */
    filters?: JsonQLFilter[];
}
export default class AxisComponent extends AsyncLoadComponent<AxisComponentProps, {
    categories: any;
    loading: boolean;
}> {
    static defaultProps: {
        reorderable: boolean;
        allowExcludedValues: boolean;
        autosetColors: boolean;
    };
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    constructor(props: any);
    isLoadNeeded(newProps: any, oldProps: any): boolean;
    load(props: any, prevProps: any, callback: any): any;
    handleExprChange: (expr: any) => void;
    handleFormatChange: (ev: any) => void;
    handleXformTypeChange: (type: any) => void;
    handleXformChange: (xform: any) => void;
    cleanAxis(axis: any): Axis | null;
    renderXform(axis: any): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<ui.ButtonToggleComponentProps, ui.ButtonToggleComponent> | null;
    renderColorMap(axis: any): (React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<any, AxisColorEditorComponent>)[] | null;
    renderExcludedValues(axis: any): (React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<any, CategoryMapComponent>)[] | null;
    renderFormat(axis: any): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}

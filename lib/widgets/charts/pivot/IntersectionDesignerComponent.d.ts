import React from "react";
import * as ui from "react-library/lib/bootstrap";
import { DataSource, Expr, Schema } from "mwater-expressions";
import { PivotChartIntersection } from "./PivotChartDesign";
import { JsonQLFilter } from "../../../JsonQLFilter";
export interface IntersectionDesignerComponentProps {
    intersection: PivotChartIntersection;
    table: string;
    schema: Schema;
    dataSource: DataSource;
    onChange: (intersection: PivotChartIntersection) => void;
    filters?: JsonQLFilter[];
}
export default class IntersectionDesignerComponent extends React.Component<IntersectionDesignerComponentProps> {
    constructor(props: IntersectionDesignerComponentProps);
    update(...args: any[]): any;
    handleBackgroundColorAxisChange: (backgroundColorAxis: any) => any;
    handleBackgroundColorChange: (backgroundColor: any) => any;
    handleBackgroundColorConditionsChange: (backgroundColorConditions: any) => any;
    handleBackgroundColorOpacityChange: (newValue: any) => any;
    handleFilterChange: (filter: any) => any;
    renderValueAxis(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup>;
    renderNullValue(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup> | undefined;
    renderFilter(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup>;
    renderStyling(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup>;
    renderBackgroundColorConditions(): React.CElement<BackgroundColorConditionsComponentProps, BackgroundColorConditionsComponent>;
    renderBackgroundColorAxis(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup>;
    renderBackgroundColor(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup> | undefined;
    renderBackgroundColorOpacityControl(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup> | undefined;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
interface BackgroundColorConditionsComponentProps {
    colorConditions?: {
        condition?: Expr;
        color?: string;
    }[];
    table: string;
    schema: Schema;
    dataSource: DataSource;
    onChange: (colorConditions?: {
        condition?: Expr;
        color?: string;
    }[]) => void;
}
/** Displays background color conditions */
declare class BackgroundColorConditionsComponent extends React.Component<BackgroundColorConditionsComponentProps> {
    handleAdd: () => void;
    render(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup>;
}
export {};

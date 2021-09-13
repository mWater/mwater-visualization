import React from "react";
import * as ui from "react-library/lib/bootstrap";
interface IntersectionDesignerComponentProps {
    intersection: any;
    table: string;
    schema: any;
    dataSource: any;
    onChange: any;
    filters?: any;
}
export default class IntersectionDesignerComponent extends React.Component<IntersectionDesignerComponentProps> {
    constructor(...args: any[]);
    update(): any;
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
    colorConditions?: any;
    table: string;
    schema: any;
    dataSource: any;
    onChange: any;
}
declare class BackgroundColorConditionsComponent extends React.Component<BackgroundColorConditionsComponentProps> {
    handleAdd: () => any;
    handleChange: (index: any, colorCondition: any) => any;
    handleRemove: (index: any) => any;
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

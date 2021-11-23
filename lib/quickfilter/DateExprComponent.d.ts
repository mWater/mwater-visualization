import React from "react";
import moment from "moment";
export interface DateExprComponentProps {
    /** Current value of quickfilter (state of filter selected) */
    value?: any;
    /** Called when value changes */
    onChange?: any;
    datetime?: boolean;
}
interface DateExprComponentState {
    custom: any;
    dropdownOpen: any;
}
export default class DateExprComponent extends React.Component<DateExprComponentProps, DateExprComponentState> {
    constructor(props: any);
    toMoment(value: any): moment.Moment | null;
    fromMoment(value: any): any;
    toLiteral(value: any): {
        type: string;
        valueType: string;
        value: any;
    };
    handleClickOut: () => void;
    handleStartChange: (value: any) => any;
    handleEndChange: (value: any) => void;
    handlePreset: (preset: any) => void;
    renderClear: () => React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            right: number;
            top: number;
            color: "#AAA";
        };
        onClick: () => any;
    }, HTMLElement>;
    renderSummary(): string | React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderPresets(): React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            top: string;
            left: number;
            zIndex: number;
            padding: number;
            border: string;
            backgroundColor: "white";
            borderRadius: number;
        };
    }, HTMLElement>;
    renderDropdown(): React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            top: string;
            left: number;
            zIndex: number;
            padding: number;
            border: string;
            backgroundColor: "white";
            borderRadius: number;
        };
    }, HTMLElement>;
    renderCustomDropdown(): React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            top: string;
            left: number;
            zIndex: number;
            padding: number;
            border: string;
            backgroundColor: "white";
            borderRadius: number;
        };
    }, HTMLElement>;
    render(): React.CElement<{
        onClickOut: () => void;
    }, React.Component<{
        onClickOut: () => void;
    }, any, any>>;
}
export {};

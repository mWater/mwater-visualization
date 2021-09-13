import React from "react";
import moment from "moment";
interface DateRangeComponentProps {
    /** Array of [start date, end date] in iso 8601 format */
    value: [string | null, string | null] | null;
    /** Array of [start date, end date] in iso 8601 format */
    onChange: (value: [string | null, string | null]) => void;
    /** true if for datetime, not date   */
    datetime?: boolean;
}
interface DateRangeComponentState {
    custom: any;
    dropdownOpen: any;
}
export default class DateRangeComponent extends React.Component<DateRangeComponentProps, DateRangeComponentState> {
    constructor(props: any);
    toMoment(value: any): moment.Moment | null;
    fromMoment(value: any): any;
    handleClickOut: () => void;
    handleStartChange: (value: any) => void;
    handleEndChange: (value: any) => void;
    handlePreset: (preset: any) => void;
    getPresets(): {
        label: string;
        value: moment.Moment[];
    }[];
    renderClear: () => React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            right: number;
            top: number;
            color: "#AAA";
        };
        onClick: () => void;
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
    render(): React.CElement<{
        onClickOut: () => void;
    }, React.Component<{
        onClickOut: () => void;
    }, any, any>>;
}
export {};

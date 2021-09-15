import PropTypes from "prop-types";
import React from "react";
import AxisBuilder from "../../../axes/AxisBuilder";
import { Schema } from "mwater-expressions";
import { CalendarChartDesign } from "./CalendarChart";
import { WidgetScope } from "../../..";
interface CalendarChartViewComponentProps {
    design: CalendarChartDesign;
    /** Data that the chart has requested. In format [{ date: <YYYY-MM-DD>, value: <number value> }, { date: ... }...] */
    data: {
        date: string;
        value: number;
    }[];
    schema: Schema;
    width: number;
    height: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: WidgetScope | null;
    /** called with scope of widget **/
    onScopeChange: (scope: WidgetScope | null) => void;
    monthsStrokeColor?: string;
    monthsStrokeWidth?: number;
    /** the day cell stroke color */
    cellStrokeColor?: string;
    highlightCellFillColor?: string;
}
export default class CalendarChartViewComponent extends React.Component<CalendarChartViewComponentProps> {
    static defaultProps: {
        monthsStrokeColor: string;
        monthsStrokeWidth: number;
        highlightCellFillColor: string;
    };
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    axisBuilder: AxisBuilder;
    reloading: boolean;
    chart_container: any;
    title: any;
    constructor(props: CalendarChartViewComponentProps);
    shouldComponentUpdate(prevProps: any): boolean;
    getCellSize(): number;
    getYears(): number[];
    componentDidMount(): void;
    componentDidUpdate(prevProps: any): void;
    handleCellClick(cell: any, data: any): void;
    redraw(): void;
    render(): React.ReactElement<{
        style: {
            width: number;
            height: number;
            shapeRendering: string;
            lineHeight: number;
        };
    }, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
}
export {};

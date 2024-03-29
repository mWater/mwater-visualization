import React from "react";
import * as ui from "../../../UIComponents";
import { DataSource, Schema } from "mwater-expressions";
import { CalendarChartDesign } from "./CalendarChart";
export interface CalendarChartDesignerComponentProps {
    design: CalendarChartDesign;
    schema: Schema;
    dataSource: DataSource;
    onDesignChange: (design: CalendarChartDesign) => void;
    filters?: any;
}
export default class CalendarChartDesignerComponent extends React.Component<CalendarChartDesignerComponentProps> {
    updateDesign(changes: any): void;
    handleTitleTextChange: (ev: any) => void;
    handleTableChange: (table: any) => void;
    handleFilterChange: (filter: any) => void;
    handleDateAxisChange: (dateAxis: any) => void;
    handleValueAxisChange: (valueAxis: any) => void;
    handleCellColorChange: (cellColor: any) => void;
    renderTable(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderTitle(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderFilter(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    renderDateAxis(): React.CElement<ui.SectionComponentProps, ui.SectionComponent> | undefined;
    renderValueAxis(): React.CElement<ui.SectionComponentProps, ui.SectionComponent> | undefined;
    renderCellColor(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}

import React from "react";
interface CalendarChartDesignerComponentProps {
    design: any;
    schema: any;
    dataSource: any;
    onDesignChange: any;
    filters?: any;
}
export default class CalendarChartDesignerComponent extends React.Component<CalendarChartDesignerComponentProps> {
    updateDesign(changes: any): any;
    handleTitleTextChange: (ev: any) => any;
    handleTableChange: (table: any) => any;
    handleFilterChange: (filter: any) => any;
    handleDateAxisChange: (dateAxis: any) => any;
    handleValueAxisChange: (valueAxis: any) => any;
    renderTable(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderTitle(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderFilter(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    renderDateAxis(): React.CElement<{
        label: string;
    }, React.Component<{
        label: string;
    }, any, any>> | undefined;
    renderValueAxis(): React.CElement<{
        label: string;
    }, React.Component<{
        label: string;
    }, any, any>> | undefined;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

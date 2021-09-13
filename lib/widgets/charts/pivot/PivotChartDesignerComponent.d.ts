import React from "react";
import * as ui from "react-library/lib/bootstrap";
interface PivotChartDesignerComponentProps {
    design: any;
    schema: any;
    dataSource: any;
    onDesignChange: any;
    filters?: any;
}
interface PivotChartDesignerComponentState {
    isNew: any;
}
export default class PivotChartDesignerComponent extends React.Component<PivotChartDesignerComponentProps, PivotChartDesignerComponentState> {
    constructor(props: any);
    updateDesign(changes: any): any;
    handleTableChange: (table: any) => any;
    handleColumnChange: (axis: any) => any;
    handleRowChange: (axis: any) => any;
    handleFilterChange: (filter: any) => any;
    handleIntersectionValueAxisChange: (valueAxis: any) => any;
    renderTable(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderFilter(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    renderStriping(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup> | null;
    renderSetup(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

import React from "react";
import * as ui from "react-library/lib/bootstrap";
import { DataSource, Schema } from "mwater-expressions";
import { PivotChartSegment } from "./PivotChartDesign";
export interface SegmentDesignerComponentProps {
    segment: PivotChartSegment;
    table: string;
    schema: Schema;
    dataSource: DataSource;
    /** "row" or "column" */
    segmentType: "row" | "column";
    onChange: any;
    filters?: any;
}
interface SegmentDesignerComponentState {
    mode: any;
}
export default class SegmentDesignerComponent extends React.Component<SegmentDesignerComponentProps, SegmentDesignerComponentState> {
    labelElem: HTMLInputElement | null;
    constructor(props: any);
    componentDidMount(): void | undefined;
    update(changes: any): any;
    handleMode: (mode: any) => void;
    handleValueAxisChange: (valueAxis: any) => any;
    handleValueAxisOnlyValuesPresentChange: (valueAxisOnlyValuesPresent: boolean) => any;
    handleLabelChange: (ev: any) => any;
    handleFilterChange: (filter: any) => any;
    handleOrderExprChange: (orderExpr: any) => any;
    handleOrderDirChange: (orderDir: any) => any;
    renderMode(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup>;
    renderLabel(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup>;
    renderValueAxis(): JSX.Element;
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
    renderBorders(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup>;
    renderOrderExpr(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

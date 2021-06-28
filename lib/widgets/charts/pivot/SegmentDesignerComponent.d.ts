import React from "react";
import ui from "react-library/lib/bootstrap";
interface SegmentDesignerComponentProps {
    segment: any;
    table: string;
    schema: any;
    dataSource: any;
    /** "row" or "column" */
    segmentType: string;
    onChange: any;
    filters?: any;
}
interface SegmentDesignerComponentState {
    mode: any;
}
export default class SegmentDesignerComponent extends React.Component<SegmentDesignerComponentProps, SegmentDesignerComponentState> {
    constructor(props: any);
    componentDidMount(): any;
    update(changes: any): any;
    handleSingleMode: () => void;
    handleMultipleMode: () => void;
    handleValueAxisChange: (valueAxis: any) => any;
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
        hasWarning?: boolean | undefined;
        hasError?: boolean | undefined;
    }, ui.FormGroup>;
    renderLabel(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarning?: boolean | undefined;
        hasError?: boolean | undefined;
    }, ui.FormGroup>;
    renderValueAxis(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarning?: boolean | undefined;
        hasError?: boolean | undefined;
    }, ui.FormGroup>;
    renderFilter(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarning?: boolean | undefined;
        hasError?: boolean | undefined;
    }, ui.FormGroup>;
    renderStyling(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarning?: boolean | undefined;
        hasError?: boolean | undefined;
    }, ui.FormGroup>;
    renderBorders(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarning?: boolean | undefined;
        hasError?: boolean | undefined;
    }, ui.FormGroup>;
    renderOrderExpr(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarning?: boolean | undefined;
        hasError?: boolean | undefined;
    }, ui.FormGroup>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

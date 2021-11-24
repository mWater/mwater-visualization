import PropTypes from "prop-types";
import React from "react";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
import { DataSource, Schema } from "mwater-expressions";
import { JsonQLFilter, WidgetScope } from "../../..";
import { PivotChartDesign } from "./PivotChartDesign";
export interface PivotChartViewComponentProps {
    schema: Schema;
    dataSource: DataSource;
    design: PivotChartDesign;
    onDesignChange?: (design: PivotChartDesign) => void;
    data: any;
    width: number;
    height?: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: WidgetScope;
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange?: (scope: WidgetScope | null) => void;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters?: JsonQLFilter[];
}
interface PivotChartViewComponentState {
    editSegment: any;
    editIntersectionId: any;
    editIntersection: any;
}
export default class PivotChartViewComponent extends React.Component<PivotChartViewComponentProps, PivotChartViewComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    constructor(props: any);
    handleHeaderChange: (header: any) => void;
    handleFooterChange: (footer: any) => void;
    handleEditSection: (sectionId: any) => void;
    handleSaveEditSegment: () => void;
    handleCancelEditSegment: () => void;
    handleSaveEditIntersection: () => void;
    handleCancelEditIntersection: () => void;
    handleRemoveSegment: (segmentId: any) => void;
    handleInsertBeforeSegment: (segmentId: any) => void;
    handleInsertAfterSegment: (segmentId: any) => void;
    handleAddChildSegment: (segmentId: any) => void;
    handleSummarizeSegment: (segmentId: any) => void;
    renderHeader(): React.DetailedReactHTMLElement<{
        style: {
            paddingLeft: number;
            paddingRight: number;
        };
    }, HTMLElement>;
    renderFooter(): React.DetailedReactHTMLElement<{
        style: {
            paddingLeft: number;
            paddingRight: number;
        };
    }, HTMLElement>;
    renderEditSegmentModal(): React.CElement<import("react-library/lib/ActionCancelModalComponent").ActionCancelModalComponentProps, ActionCancelModalComponent> | undefined;
    renderEditIntersectionModal(): React.CElement<import("react-library/lib/ActionCancelModalComponent").ActionCancelModalComponentProps, ActionCancelModalComponent> | undefined;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: number;
            height: number | undefined;
        };
    }, HTMLElement>;
}
export {};

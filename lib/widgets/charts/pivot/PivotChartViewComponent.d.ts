import PropTypes from "prop-types";
import React from "react";
interface PivotChartViewComponentProps {
    schema: any;
    dataSource: any;
    design: any;
    data: any;
    onDesignChange?: any;
    width: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: any;
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange?: any;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters?: any;
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
    handleHeaderChange: (header: any) => any;
    handleFooterChange: (footer: any) => any;
    handleEditSection: (sectionId: any) => void;
    handleSaveEditSegment: () => void;
    handleCancelEditSegment: () => void;
    handleSaveEditIntersection: () => void;
    handleCancelEditIntersection: () => void;
    handleRemoveSegment: (segmentId: any) => any;
    handleInsertBeforeSegment: (segmentId: any) => any;
    handleInsertAfterSegment: (segmentId: any) => any;
    handleAddChildSegment: (segmentId: any) => any;
    handleSummarizeSegment: (segmentId: any) => any;
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
    renderEditSegmentModal(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | undefined;
    renderEditIntersectionModal(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | undefined;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: number;
            height: any;
        };
    }, HTMLElement>;
}
export {};

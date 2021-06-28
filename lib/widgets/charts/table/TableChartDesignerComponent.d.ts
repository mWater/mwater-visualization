import React from "react";
interface TableChartDesignerComponentProps {
    design: any;
    schema: any;
    dataSource: any;
    onDesignChange: any;
}
export default class TableChartDesignerComponent extends React.Component<TableChartDesignerComponentProps> {
    updateDesign(changes: any): any;
    handleTitleTextChange: (ev: any) => any;
    handleTableChange: (table: any) => any;
    handleFilterChange: (filter: any) => any;
    handleOrderingsChange: (orderings: any) => any;
    handleLimitChange: (limit: any) => any;
    handleColumnChange: (index: any, column: any) => any;
    handleRemoveColumn: (index: any) => any;
    handleAddColumn: () => any;
    renderTable(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderTitle(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderColumn: (column: any, index: any, connectDragSource: any, connectDragPreview: any, connectDropTarget: any) => any;
    handleReorder: (map: any) => any;
    renderColumns(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
    renderOrderings(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    renderFilter(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    renderLimit(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

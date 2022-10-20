import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import { TableChartDesign } from "./TableChart";
export interface TableChartDesignerComponentProps {
    design: TableChartDesign;
    schema: Schema;
    dataSource: DataSource;
    onDesignChange: (design: TableChartDesign) => void;
}
export default class TableChartDesignerComponent extends React.Component<TableChartDesignerComponentProps> {
    updateDesign(changes: Partial<TableChartDesign>): void;
    handleTitleTextChange: (ev: any) => void;
    handleTableChange: (table: any) => void;
    handleFilterChange: (filter: any) => void;
    handleOrderingsChange: (orderings: any) => void;
    handleLimitChange: (limit: any) => void;
    handleColumnChange: (index: any, column: any) => void;
    handleRemoveColumn: (index: any) => void;
    handleAddColumn: () => void;
    renderTable(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderTitle(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderColumn: (column: any, index: any, connectDragSource: any, connectDragPreview: any, connectDropTarget: any) => any;
    handleReorder: (map: any) => void;
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
export interface TableChartColumnDesignerComponentProps {
    design: TableChartDesign;
    schema: Schema;
    dataSource: DataSource;
    index: number;
    onChange: any;
    onRemove: any;
    connectDragSource: any;
}

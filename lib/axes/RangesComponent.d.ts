import React from "react";
import { AxisXform } from "./Axis";
import { Expr, Schema } from "mwater-expressions";
interface RangesComponentProps {
    schema: Schema;
    /** Expression for computing min/max */
    expr: Expr;
    xform: AxisXform;
    onChange: any;
}
export default class RangesComponent extends React.Component<RangesComponentProps> {
    handleRangeChange: (index: any, range: any) => any;
    handleAddRange: () => any;
    handleRemoveRange: (index: any) => any;
    renderRange: (range: any, index: any, connectDragSource: any, connectDragPreview: any, connectDropTarget: any) => React.CElement<RangeComponentProps, RangeComponent>;
    handleReorder: (ranges: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
interface RangeComponentProps {
    /** Range to edit */
    range: any;
    onChange: any;
    onRemove: any;
    /** reorderable connector */
    connectDragSource: any;
    /** reorderable connector */
    connectDragPreview: any;
    connectDropTarget: any;
}
declare class RangeComponent extends React.Component<RangeComponentProps> {
    handleMinOpenChange: (minOpen: any) => any;
    handleMaxOpenChange: (maxOpen: any) => any;
    render(): any;
}
export {};

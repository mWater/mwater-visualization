import React from "react";
import { Schema } from "mwater-expressions";
import { Axis, AxisCategory } from "./Axis";
interface CategoryMapComponentProps {
    schema: Schema;
    axis: Axis;
    onChange: (axis: Axis) => void;
    categories?: AxisCategory[];
    reorderable?: boolean;
    /** True to allow editing the color map */
    showColorMap?: boolean;
    /** True to allow excluding of values via checkboxes */
    allowExcludedValues?: boolean;
    initiallyExpanded?: boolean;
}
interface CategoryMapComponentState {
    collapsed: any;
}
export default class CategoryMapComponent extends React.Component<CategoryMapComponentProps, CategoryMapComponentState> {
    constructor(props: any);
    handleReorder: (map: any) => void;
    handleColorChange: (value: any, color: any) => void;
    handleExcludeChange: (value: any, ev: any) => void;
    lookupColor(value: any): string | null;
    handleNullLabelChange: (e: any) => void;
    handleCategoryLabelChange: (category: any, e: any) => void;
    handleToggle: () => void;
    renderLabel(category: any): React.DetailedReactHTMLElement<{
        className: string;
        onClick: any;
        style: {
            cursor: "pointer";
        };
    }, HTMLElement>;
    renderCategory: (category: any, index?: any, connectDragSource?: any, connectDragPreview?: any, connectDropTarget?: any) => React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderReorderable(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderNonReorderable(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderToggle(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

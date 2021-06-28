import React from "react";
interface CategoryMapComponentProps {
    schema: any;
    axis: any;
    onChange: any;
    categories?: any;
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
    handleReorder: (map: any) => any;
    handleColorChange: (value: any, color: any) => any;
    handleExcludeChange: (value: any, ev: any) => any;
    lookupColor(value: any): any;
    handleNullLabelChange: (e: any) => any;
    handleCategoryLabelChange: (category: any, e: any) => any;
    handleToggle: () => void;
    renderLabel(category: any): React.DetailedReactHTMLElement<{
        onClick: any;
        style: {
            cursor: "pointer";
        };
    }, HTMLElement>;
    renderCategory: (category: any, index: any, connectDragSource: any, connectDragPreview: any, connectDropTarget: any) => React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderReorderable(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderNonReorderable(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderToggle(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

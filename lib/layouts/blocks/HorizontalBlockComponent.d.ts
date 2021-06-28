import React from "react";
interface HorizontalBlockComponentProps {
    block: any;
    collapseColumns?: boolean;
    renderBlock: any;
    /** Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right */
    onBlockDrop?: any;
    /** Called with (block) when block is removed */
    onBlockRemove?: any;
    onBlockUpdate?: any;
}
interface HorizontalBlockComponentState {
    dragInitialX: any;
    leftSize: any;
    rightSize: any;
    dragXOffset: any;
    dragIndex: any;
}
export default class HorizontalBlockComponent extends React.Component<HorizontalBlockComponentProps, HorizontalBlockComponentState> {
    constructor(props: any);
    componentWillUnmount(): void;
    handleMouseDown: (index: any, ev: any) => void;
    handleMouseMove: (ev: any) => void;
    handleMouseUp: (ev: any) => void;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
export {};

import React from "react";
import { LayoutBlock } from "./blockUtils";
export interface HorizontalBlockComponentProps {
    block: LayoutBlock;
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
    blockRefs: {
        [blockId: string]: HTMLElement | null;
    };
    constructor(props: any);
    componentWillUnmount(): void;
    handleMouseDown: (index: any, ev: any) => void;
    handleMouseMove: (ev: any) => void;
    handleMouseUp: (ev: any) => void;
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}
export {};

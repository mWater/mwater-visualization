import React from "react";
export interface DecoratedBlockComponentProps {
    /** Style to add to outer div */
    style?: any;
    /** Called when block is removed */
    onBlockRemove: any;
    /** the move handle connector */
    connectMoveHandle?: any;
    /** the drag preview connector */
    connectDragPreview?: any;
    /** Connects resize handle for dragging. Null to not render */
    connectResizeHandle?: any;
    /** Set to allow changing aspect ratio */
    aspectRatio?: number;
    onAspectRatioChange?: any;
    isDragging: boolean;
}
interface DecoratedBlockComponentState {
    initialClientY: any;
    initialAspectDragY: any;
    aspectDragY: any;
}
export default class DecoratedBlockComponent extends React.Component<DecoratedBlockComponentProps, DecoratedBlockComponentState> {
    constructor(props: any);
    componentWillUnmount(): void;
    handleAspectMouseDown: (ev: any) => void;
    handleMouseMove: (ev: any) => void;
    handleMouseUp: (ev: any) => void;
    renderAspectDrag(): React.ReactElement<{
        style: {
            position: string;
            borderTop: string;
            top: any;
            left: number;
            right: number;
        };
        key: string;
    }, string | React.JSXElementConstructor<any>> | null;
    render(): React.DetailedReactHTMLElement<{
        className: string;
        style: any;
    }, HTMLElement>;
}
export {};

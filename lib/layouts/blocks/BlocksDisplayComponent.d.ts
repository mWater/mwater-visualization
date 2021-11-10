import React from "react";
import AutoSizeComponent from "react-library/lib/AutoSizeComponent";
import HorizontalBlockComponent from "./HorizontalBlockComponent";
import { LayoutBlock } from "./blockUtils";
interface BlocksDisplayComponentProps {
    items: LayoutBlock;
    onItemsChange?: (items: LayoutBlock) => void;
    /** Stylesheet to use. null for default */
    style?: string;
    /** layout options to use */
    layoutOptions?: any;
    /** Renders a widget. Passed (options) */
    renderWidget: any;
    /** True to prevent maps */
    disableMaps?: boolean;
    /** Including onClipboardChange adds a clipboard palette item that can be used to copy and paste widgets */
    clipboard?: any;
    onClipboardChange?: any;
    cantPasteMessage?: string;
}
declare class BlocksDisplayComponent extends React.Component<BlocksDisplayComponentProps> {
    handleBlockDrop: (sourceBlock: any, targetBlock: any, side: "top" | "left" | "right" | "bottom") => void;
    handleBlockRemove: (block: any) => void;
    handleBlockUpdate: (block: any) => void;
    renderBlock: (block: any, collapseColumns?: boolean) => React.CElement<RootBlockComponentProps, RootBlockComponent> | React.CElement<any, HorizontalBlockComponent> | React.DetailedReactHTMLElement<{
        key: any;
        className: string;
    }, HTMLElement>;
    createBlockItem(block: any): () => {
        block: {};
    };
    renderPalette(): React.DetailedReactHTMLElement<{
        key: string;
        style: {
            width: number;
            height: string;
            position: "absolute";
            top: number;
            left: number;
        };
    }, HTMLElement>;
    render(): React.CElement<import("react-library/lib/AutoSizeComponent").AutoSizeComponentProps, AutoSizeComponent> | React.DetailedReactHTMLElement<{
        style: {
            width: string;
            height: string;
            overflow: "hidden";
            position: "relative";
        };
    }, HTMLElement>;
}
export default BlocksDisplayComponent;
interface RootBlockComponentProps {
    block: any;
    collapseColumns?: boolean;
    renderBlock: any;
    /** Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right */
    onBlockDrop?: any;
    onBlockRemove?: any;
}
declare class RootBlockComponent extends React.Component<RootBlockComponentProps> {
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<{
        block: any;
        onBlockDrop: any;
        style: {
            height: string;
        };
        onlyBottom: boolean;
    }, React.Component<{
        block: any;
        onBlockDrop: any;
        style: {
            height: string;
        };
        onlyBottom: boolean;
    }, any, any>>;
}

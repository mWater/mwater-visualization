/** Layout that does blocks that are stacked vertically or horizontally
 * alternately. That is, first is vertical stack, which can contain horizontal
 * stack, etc. */
export interface LayoutBlock {
    /** id of block */
    id: string;
    type: "root" | "vertical" | "horizontal" | "widget" | "spacer";
    /** if a widget */
    widgetType?: string;
    /** w/h if not autoHeight */
    aspectRatio?: number;
    /** widget design */
    design?: any;
    /** weights for proportioning horizontal blocks. Default is 1 */
    weights?: number[];
    /** other blocks if not a widget */
    blocks?: LayoutBlock[];
}
export declare function dropBlock(rootBlock: LayoutBlock, sourceBlock: LayoutBlock, targetBlock: LayoutBlock, side: "top" | "left" | "right" | "bottom"): LayoutBlock;
export declare function updateBlock(rootBlock: LayoutBlock, block: LayoutBlock): LayoutBlock;
export declare function removeBlock(rootBlock: LayoutBlock, block: LayoutBlock): LayoutBlock | null;
export declare function cleanBlock(rootBlock: LayoutBlock): LayoutBlock;

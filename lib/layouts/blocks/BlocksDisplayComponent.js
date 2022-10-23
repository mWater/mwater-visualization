"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const uuid_1 = __importDefault(require("uuid"));
const DraggableBlockComponent_1 = __importDefault(require("./DraggableBlockComponent"));
const DecoratedBlockComponent_1 = __importDefault(require("../DecoratedBlockComponent"));
const PaletteItemComponent_1 = __importDefault(require("./PaletteItemComponent"));
const ClipboardPaletteItemComponent_1 = __importDefault(require("./ClipboardPaletteItemComponent"));
const blockUtils = __importStar(require("./blockUtils"));
const AutoSizeComponent_1 = __importDefault(require("react-library/lib/AutoSizeComponent"));
const HorizontalBlockComponent_1 = __importDefault(require("./HorizontalBlockComponent"));
const layoutOptions_1 = require("../../dashboards/layoutOptions");
/*
Renders the complete layout of the blocks and also optionally a palette to the left
that can be used to drag new items into the layout. Palette is only displayed if onItemsChange is not null
*/
class BlocksDisplayComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleBlockDrop = (sourceBlock, targetBlock, side) => {
            // Remove source from items
            let items = blockUtils.removeBlock(this.props.items, sourceBlock);
            // Remove source from target also
            targetBlock = blockUtils.removeBlock(targetBlock, sourceBlock);
            items = blockUtils.dropBlock(items, sourceBlock, targetBlock, side);
            items = blockUtils.cleanBlock(items);
            return this.props.onItemsChange(items);
        };
        this.handleBlockRemove = (block) => {
            let items = blockUtils.removeBlock(this.props.items, block);
            items = blockUtils.cleanBlock(items);
            return this.props.onItemsChange(items);
        };
        this.handleBlockUpdate = (block) => {
            let items = blockUtils.updateBlock(this.props.items, block);
            items = blockUtils.cleanBlock(items);
            return this.props.onItemsChange(items);
        };
        this.renderBlock = (block, collapseColumns = false) => {
            let elem = null;
            switch (block.type) {
                case "root":
                    return R(RootBlockComponent, {
                        key: block.id,
                        block,
                        collapseColumns,
                        renderBlock: this.renderBlock,
                        onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : undefined,
                        onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : undefined
                    });
                    break;
                case "vertical":
                    return R(VerticalBlockComponent, {
                        key: block.id,
                        block,
                        collapseColumns,
                        renderBlock: this.renderBlock,
                        onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : undefined,
                        onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : undefined
                    });
                    break;
                case "horizontal":
                    return R(HorizontalBlockComponent_1.default, {
                        key: block.id,
                        block,
                        collapseColumns,
                        renderBlock: this.renderBlock,
                        onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : undefined,
                        onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : undefined,
                        onBlockUpdate: this.props.onItemsChange != null ? this.handleBlockUpdate : undefined
                    });
                    break;
                case "spacer":
                    elem = R(AutoSizeComponent_1.default, { injectWidth: true, key: block.id }, (size) => {
                        return R("div", {
                            id: block.id,
                            style: {
                                width: size.width,
                                height: block.aspectRatio != null ? size.width / block.aspectRatio : undefined
                            }
                        });
                    });
                    if (this.props.onItemsChange) {
                        elem = R(DraggableBlockComponent_1.default, {
                            key: block.id,
                            block,
                            onBlockDrop: this.handleBlockDrop
                        }, R(DecoratedBlockComponent_1.default, {
                            key: block.id,
                            aspectRatio: block.aspectRatio,
                            onAspectRatioChange: block.aspectRatio != null
                                ? (aspectRatio) => this.props.onItemsChange(blockUtils.updateBlock(this.props.items, lodash_1.default.extend({}, block, { aspectRatio })))
                                : undefined,
                            onBlockRemove: this.props.onItemsChange != null ? this.handleBlockDrop.bind(null, block) : undefined
                        }, elem));
                    }
                    break;
                case "widget":
                    elem = R(AutoSizeComponent_1.default, { injectWidth: true, key: block.id }, (size) => {
                        return this.props.renderWidget({
                            id: block.id,
                            type: block.widgetType,
                            design: block.design,
                            onDesignChange: this.props.onItemsChange
                                ? (design) => this.props.onItemsChange(blockUtils.updateBlock(this.props.items, lodash_1.default.extend({}, block, { design })))
                                : undefined,
                            width: size.width,
                            height: block.aspectRatio != null ? size.width / block.aspectRatio : undefined
                        });
                    });
                    if (this.props.onItemsChange) {
                        elem = R(DraggableBlockComponent_1.default, {
                            key: block.id,
                            block,
                            onBlockDrop: this.handleBlockDrop
                        }, R(DecoratedBlockComponent_1.default, {
                            key: block.id,
                            aspectRatio: block.aspectRatio,
                            onAspectRatioChange: block.aspectRatio != null
                                ? (aspectRatio) => this.props.onItemsChange(blockUtils.updateBlock(this.props.items, lodash_1.default.extend({}, block, { aspectRatio })))
                                : undefined,
                            onBlockRemove: this.props.onItemsChange != null ? this.handleBlockDrop.bind(null, block) : undefined
                        }, elem));
                    }
                    break;
                default:
                    throw new Error(`Unknown block type ${block.type}`);
            }
            // Wrap block in padding
            return R("div", { key: block.id, className: `mwater-visualization-block mwater-visualization-block-${block.type}` }, elem);
        };
    }
    createBlockItem(block) {
        // Add unique id
        return () => ({
            block: lodash_1.default.extend({}, block, { id: (0, uuid_1.default)() })
        });
    }
    renderPalette() {
        return R("div", { key: "palette", style: { width: 141, height: "100%", position: "absolute", top: 0, left: 0 } }, R("div", { className: "mwater-visualization-palette", style: { height: "100%" } }, R(PaletteItemComponent_1.default, {
            createItem: this.createBlockItem({ type: "widget", widgetType: "Text", design: { style: "title" } }),
            title: R("i", { className: "fa fa-font" }),
            subtitle: "Title"
        }), R(PaletteItemComponent_1.default, {
            createItem: this.createBlockItem({ type: "widget", widgetType: "Text", design: {} }),
            title: R("i", { className: "fa fa-align-left" }),
            subtitle: "Text"
        }), R(PaletteItemComponent_1.default, {
            createItem: this.createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "Image", design: {} }),
            title: R("i", { className: "fa fa-picture-o" }),
            subtitle: "Image"
        }), R(PaletteItemComponent_1.default, {
            createItem: this.createBlockItem({
                type: "widget",
                aspectRatio: 1.4,
                widgetType: "LayeredChart",
                design: {}
            }),
            title: R("i", { className: "fa fa-bar-chart" }),
            subtitle: "Chart"
        }), !this.props.disableMaps
            ? R(PaletteItemComponent_1.default, {
                createItem: this.createBlockItem({
                    type: "widget",
                    aspectRatio: 2,
                    widgetType: "Map",
                    design: {
                        baseLayer: "bing_road",
                        layerViews: [],
                        filters: {},
                        bounds: { w: -40, n: 25, e: 40, s: -25 }
                    }
                }),
                title: R("i", { className: "fa fa-map-o" }),
                subtitle: "Map"
            })
            : undefined, R(PaletteItemComponent_1.default, {
            createItem: this.createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "TableChart", design: {} }),
            title: R("i", { className: "fa fa-table" }),
            subtitle: "Table"
        }), R(PaletteItemComponent_1.default, {
            createItem: this.createBlockItem({ type: "widget", widgetType: "PivotChart", design: {} }),
            title: R("img", {
                width: 24,
                height: 24,
                src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAb0lEQVRIx91VQQrAIAwzo/7/ydllG0MQS21EzMW2ICFtoyBZlLDn/LOgySPAG1xFDDmBtZI6efoMvODozkyL2IlTCOisfS2KrqG0RXus6fkEVBIw08khE62aQY0ogMdEswqwYouwvQ8s+4M576m4Ae/tET/u1taEAAAAAElFTkSuQmCC"
            }),
            subtitle: "Pivot"
        }), R(PaletteItemComponent_1.default, {
            createItem: this.createBlockItem({
                type: "widget",
                aspectRatio: 1.4,
                widgetType: "CalendarChart",
                design: {}
            }),
            title: R("i", { className: "fa fa-calendar" }),
            subtitle: "Calendar"
        }), R(PaletteItemComponent_1.default, {
            createItem: this.createBlockItem({
                type: "widget",
                aspectRatio: 1.4,
                widgetType: "ImageMosaicChart",
                design: {}
            }),
            title: R("i", { className: "fa fa-th" }),
            subtitle: "Mosaic"
        }), R(PaletteItemComponent_1.default, {
            createItem: this.createBlockItem({ type: "spacer", aspectRatio: 2 }),
            title: R("i", { className: "fa fa-square-o" }),
            subtitle: "Spacer"
        }), R(PaletteItemComponent_1.default, {
            createItem: this.createBlockItem({
                type: "widget",
                aspectRatio: 16.0 / 9.0,
                widgetType: "IFrame",
                design: {}
            }),
            title: R("i", { className: "fa fa-youtube-play" }),
            subtitle: "Video"
        }), R(PaletteItemComponent_1.default, {
            createItem: this.createBlockItem({
                type: "widget",
                widgetType: "TOC",
                design: { numbering: false, borderWeight: 2, header: "Contents" }
            }),
            title: R("i", { className: "fa fa-list-ol" }),
            subtitle: "TOC"
        }), this.props.onClipboardChange
            ? R(ClipboardPaletteItemComponent_1.default, {
                clipboard: this.props.clipboard,
                onClipboardChange: this.props.onClipboardChange,
                cantPasteMessage: this.props.cantPasteMessage
            })
            : undefined));
    }
    render() {
        let innerParentStyle;
        const layoutOptions = this.props.layoutOptions || (0, layoutOptions_1.getDefaultLayoutOptions)();
        if (this.props.onItemsChange) {
            innerParentStyle = {};
            innerParentStyle.maxWidth = layoutOptions.maximumWidth || undefined;
            return R("div", { style: { width: "100%", height: "100%", overflow: "hidden", position: "relative" } }, this.renderPalette(), R("div", {
                style: { position: "absolute", left: 141, top: 0, bottom: 0, right: 0, overflow: "auto" },
                className: `mwater-visualization-block-parent-outer mwater-visualization-block-parent-outer-${this.props.style || "default"} mwater-visualization-block-editing`
            }, R("div", {
                key: "inner",
                className: `mwater-visualization-block-parent-inner mwater-visualization-block-parent-inner-${this.props.style || "default"}`,
                style: innerParentStyle
            }, this.renderBlock(this.props.items))));
        }
        else {
            return R(AutoSizeComponent_1.default, { injectWidth: true, injectHeight: true }, (size) => {
                const outerParentStyle = { width: "100%", height: "100%", overflowX: "auto" };
                innerParentStyle = {};
                // Remove padding if small
                if (size.width < 600) {
                    innerParentStyle.padding = "0px";
                }
                // Scroll/scale
                innerParentStyle.maxWidth = layoutOptions.maximumWidth || undefined;
                if (layoutOptions.belowMinimumWidth === "scroll") {
                    innerParentStyle.minWidth = layoutOptions.minimumWidth || undefined;
                }
                else {
                    if (layoutOptions.minimumWidth != null && size.width < layoutOptions.minimumWidth) {
                        const scale = size.width / layoutOptions.minimumWidth;
                        outerParentStyle.transform = `scale(${scale})`;
                        outerParentStyle.width = size.width / scale;
                        outerParentStyle.height = size.height / scale;
                        outerParentStyle.transformOrigin = "top left";
                    }
                }
                return R("div", {
                    style: outerParentStyle,
                    className: `mwater-visualization-block-parent-outer mwater-visualization-block-parent-outer-${this.props.style || "default"} mwater-visualization-block-viewing`
                }, R("div", {
                    key: "inner",
                    className: `mwater-visualization-block-parent-inner mwater-visualization-block-parent-inner-${this.props.style || "default"}`,
                    style: innerParentStyle
                }, this.renderBlock(this.props.items, layoutOptions.collapseColumnsWidth != null && size.width <= layoutOptions.collapseColumnsWidth)));
            });
        }
    }
}
exports.default = BlocksDisplayComponent;
class RootBlockComponent extends react_1.default.Component {
    render() {
        const elem = R("div", { key: "root" }, lodash_1.default.map(this.props.block.blocks, (block) => {
            return this.props.renderBlock(block, this.props.collapseColumns);
        }));
        // If draggable
        if (this.props.onBlockDrop != null) {
            return R(DraggableBlockComponent_1.default, {
                block: this.props.block,
                onBlockDrop: this.props.onBlockDrop,
                style: { height: "100%" },
                onlyBottom: true
            }, elem);
        }
        else {
            return elem;
        }
    }
}
class VerticalBlockComponent extends react_1.default.Component {
    render() {
        return R("div", null, lodash_1.default.map(this.props.block.blocks, (block) => {
            return this.props.renderBlock(block, this.props.collapseColumns);
        }));
    }
}

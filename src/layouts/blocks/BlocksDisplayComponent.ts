// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import PropTypes from "prop-types"
import _ from "lodash"
import React, { CSSProperties } from "react"
const R = React.createElement
import uuid from "uuid"
import DraggableBlockComponent from "./DraggableBlockComponent"
import DecoratedBlockComponent from "../DecoratedBlockComponent"
import PaletteItemComponent from "./PaletteItemComponent"
import ClipboardPaletteItemComponent from "./ClipboardPaletteItemComponent"
import * as blockUtils from "./blockUtils"
import AutoSizeComponent from "react-library/lib/AutoSizeComponent"
import HorizontalBlockComponent from "./HorizontalBlockComponent"
import { getDefaultLayoutOptions } from "../../dashboards/layoutOptions"
import { LayoutBlock } from "./blockUtils"

export interface BlocksDisplayComponentProps {
  items: LayoutBlock
  onItemsChange?: (items: LayoutBlock) => void
  /** Stylesheet to use. null for default */
  style?: string
  /** layout options to use */
  layoutOptions?: any
  /** Renders a widget. Passed (options) */
  renderWidget: any
  /** True to prevent maps */
  disableMaps?: boolean
  /** Including onClipboardChange adds a clipboard palette item that can be used to copy and paste widgets */
  clipboard?: any
  onClipboardChange?: any
  cantPasteMessage?: string
}

/*
Renders the complete layout of the blocks and also optionally a palette to the left
that can be used to drag new items into the layout. Palette is only displayed if onItemsChange is not null
*/
class BlocksDisplayComponent extends React.Component<BlocksDisplayComponentProps> {
  handleBlockDrop = (sourceBlock: any, targetBlock: any, side: "top" | "left" | "right" | "bottom") => {
    // Remove source from items
    let items = blockUtils.removeBlock(this.props.items, sourceBlock)!

    // Remove source from target also
    targetBlock = blockUtils.removeBlock(targetBlock, sourceBlock)

    items = blockUtils.dropBlock(items, sourceBlock, targetBlock, side)
    items = blockUtils.cleanBlock(items)
    return this.props.onItemsChange!(items)
  }

  handleBlockRemove = (block: any) => {
    let items = blockUtils.removeBlock(this.props.items, block)!
    items = blockUtils.cleanBlock(items)
    return this.props.onItemsChange!(items)
  }

  handleBlockUpdate = (block: any) => {
    let items = blockUtils.updateBlock(this.props.items, block)!
    items = blockUtils.cleanBlock(items)
    return this.props.onItemsChange!(items)
  }

  renderBlock = (block: any, collapseColumns = false) => {
    let elem = null

    switch (block.type) {
      case "root":
        return R(RootBlockComponent, {
          key: block.id,
          block,
          collapseColumns,
          renderBlock: this.renderBlock,
          onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : undefined,
          onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : undefined
        })
        break

      case "vertical":
        return R(VerticalBlockComponent, {
          key: block.id,
          block,
          collapseColumns,
          renderBlock: this.renderBlock,
          onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : undefined,
          onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : undefined
        })
        break

      case "horizontal":
        return R(HorizontalBlockComponent, {
          key: block.id,
          block,
          collapseColumns,
          renderBlock: this.renderBlock,
          onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : undefined,
          onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : undefined,
          onBlockUpdate: this.props.onItemsChange != null ? this.handleBlockUpdate : undefined
        })
        break

      case "spacer":
        elem = R(AutoSizeComponent, { injectWidth: true, key: block.id } as any, (size: any) => {
          return R("div", {
            id: block.id,
            style: {
              width: size.width,
              height: block.aspectRatio != null ? size.width / block.aspectRatio : undefined
            }
          })
        })

        if (this.props.onItemsChange) {
          elem = R(
            DraggableBlockComponent,
            {
              key: block.id,
              block,
              onBlockDrop: this.handleBlockDrop
            },
            R(
              DecoratedBlockComponent,
              {
                key: block.id,
                aspectRatio: block.aspectRatio,
                onAspectRatioChange:
                  block.aspectRatio != null
                    ? (aspectRatio: any) =>
                        this.props.onItemsChange!(
                          blockUtils.updateBlock(this.props.items, _.extend({}, block, { aspectRatio }))
                        )
                    : undefined,
                onBlockRemove: this.props.onItemsChange != null ? this.handleBlockDrop.bind(null, block) : undefined
              },
              elem
            )
          )
        }
        break

      case "widget":
        elem = R(AutoSizeComponent, { injectWidth: true, key: block.id } as any, (size: any) => {
          return this.props.renderWidget({
            id: block.id,
            type: block.widgetType,
            design: block.design,
            onDesignChange: this.props.onItemsChange
              ? (design: any) =>
                  this.props.onItemsChange!(blockUtils.updateBlock(this.props.items, _.extend({}, block, { design })))
              : undefined,
            width: size.width,
            height: block.aspectRatio != null ? size.width / block.aspectRatio : undefined
          })
        })

        if (this.props.onItemsChange) {
          elem = R(
            DraggableBlockComponent,
            {
              key: block.id,
              block,
              onBlockDrop: this.handleBlockDrop
            },
            R(
              DecoratedBlockComponent,
              {
                key: block.id,
                aspectRatio: block.aspectRatio,
                onAspectRatioChange:
                  block.aspectRatio != null
                    ? (aspectRatio: any) =>
                        this.props.onItemsChange!(
                          blockUtils.updateBlock(this.props.items, _.extend({}, block, { aspectRatio }))
                        )
                    : undefined,
                onBlockRemove: this.props.onItemsChange != null ? this.handleBlockDrop.bind(null, block) : undefined
              },
              elem
            )
          )
        }
        break
      default:
        throw new Error(`Unknown block type ${block.type}`)
    }

    // Wrap block in padding
    return R(
      "div",
      { key: block.id, className: `mwater-visualization-block mwater-visualization-block-${block.type}` },
      elem
    )
  }

  createBlockItem(block: any) {
    // Add unique id
    return () => ({
      block: _.extend({}, block, { id: uuid() })
    })
  }

  renderPalette() {
    return R(
      "div",
      { key: "palette", style: { width: 141, height: "100%", position: "absolute", top: 0, left: 0 } },
      R(
        "div",
        { className: "mwater-visualization-palette", style: { height: "100%" } },
        R(PaletteItemComponent, {
          createItem: this.createBlockItem({ type: "widget", widgetType: "Text", design: { style: "title" } }),
          title: R("i", { className: "fa fa-font" }),
          subtitle: "Title"
        }),
        R(PaletteItemComponent, {
          createItem: this.createBlockItem({ type: "widget", widgetType: "Text", design: {} }),
          title: R("i", { className: "fa fa-align-left" }),
          subtitle: "Text"
        }),
        R(PaletteItemComponent, {
          createItem: this.createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "Image", design: {} }),
          title: R("i", { className: "fa fa-picture-o" }),
          subtitle: "Image"
        }),
        R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "LayeredChart",
            design: {}
          }),
          title: R("i", { className: "fa fa-bar-chart" }),
          subtitle: "Chart"
        }),
        !this.props.disableMaps
          ? R(PaletteItemComponent, {
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
          : undefined,
        R(PaletteItemComponent, {
          createItem: this.createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "TableChart", design: {} }),
          title: R("i", { className: "fa fa-table" }),
          subtitle: "Table"
        }),
        R(PaletteItemComponent, {
          createItem: this.createBlockItem({ type: "widget", widgetType: "PivotChart", design: {} }),
          title: R("img", {
            width: 24,
            height: 24,
            src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAb0lEQVRIx91VQQrAIAwzo/7/ydllG0MQS21EzMW2ICFtoyBZlLDn/LOgySPAG1xFDDmBtZI6efoMvODozkyL2IlTCOisfS2KrqG0RXus6fkEVBIw08khE62aQY0ogMdEswqwYouwvQ8s+4M576m4Ae/tET/u1taEAAAAAElFTkSuQmCC"
          }),
          subtitle: "Pivot"
        }),
        R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "CalendarChart",
            design: {}
          }),
          title: R("i", { className: "fa fa-calendar" }),
          subtitle: "Calendar"
        }),
        R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "ImageMosaicChart",
            design: {}
          }),
          title: R("i", { className: "fa fa-th" }),
          subtitle: "Mosaic"
        }),
        R(PaletteItemComponent, {
          createItem: this.createBlockItem({ type: "spacer", aspectRatio: 2 }),
          title: R("i", { className: "fa fa-square-o" }),
          subtitle: "Spacer"
        }),
        R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            aspectRatio: 16.0 / 9.0,
            widgetType: "IFrame",
            design: {}
          }),
          title: R("i", { className: "fa fa-youtube-play" }),
          subtitle: "Video"
        }),
        R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            widgetType: "TOC",
            design: { numbering: false, borderWeight: 2, header: "Contents" }
          }),
          title: R("i", { className: "fa fa-list-ol" }),
          subtitle: "TOC"
        }),
        this.props.onClipboardChange
          ? R(ClipboardPaletteItemComponent, {
              clipboard: this.props.clipboard,
              onClipboardChange: this.props.onClipboardChange,
              cantPasteMessage: this.props.cantPasteMessage
            })
          : undefined
      )
    )
  }

  render() {
    let innerParentStyle: CSSProperties
    const layoutOptions = this.props.layoutOptions || getDefaultLayoutOptions()
    if (this.props.onItemsChange) {
      innerParentStyle = {}
      innerParentStyle.maxWidth = layoutOptions.maximumWidth || undefined

      return R(
        "div",
        { style: { width: "100%", height: "100%", overflow: "hidden", position: "relative" } },
        this.renderPalette(),
        R(
          "div",
          {
            style: { position: "absolute", left: 141, top: 0, bottom: 0, right: 0, overflow: "auto" },
            className: `mwater-visualization-block-parent-outer mwater-visualization-block-parent-outer-${
              this.props.style || "default"
            } mwater-visualization-block-editing`
          },
          R(
            "div",
            {
              key: "inner",
              className: `mwater-visualization-block-parent-inner mwater-visualization-block-parent-inner-${
                this.props.style || "default"
              }`,
              style: innerParentStyle
            },
            this.renderBlock(this.props.items)
          )
        )
      )
    } else {
      return R(AutoSizeComponent, { injectWidth: true, injectHeight: true } as any, (size: any) => {
        const outerParentStyle: CSSProperties = { width: "100%", height: "100%", overflowX: "auto" }
        innerParentStyle = {}

        // Remove padding if small
        if (size.width < 600) {
          innerParentStyle.padding = "0px"
        }

        // Scroll/scale
        innerParentStyle.maxWidth = layoutOptions.maximumWidth || undefined

        if (layoutOptions.belowMinimumWidth === "scroll") {
          innerParentStyle.minWidth = layoutOptions.minimumWidth || undefined
        } else {
          if (layoutOptions.minimumWidth != null && size.width < layoutOptions.minimumWidth) {
            const scale = size.width / layoutOptions.minimumWidth
            outerParentStyle.transform = `scale(${scale})`
            outerParentStyle.width = size.width / scale
            outerParentStyle.height = size.height / scale
            outerParentStyle.transformOrigin = "top left"
          }
        }

        return R(
          "div",
          {
            style: outerParentStyle,
            className: `mwater-visualization-block-parent-outer mwater-visualization-block-parent-outer-${
              this.props.style || "default"
            } mwater-visualization-block-viewing`
          },
          R(
            "div",
            {
              key: "inner",
              className: `mwater-visualization-block-parent-inner mwater-visualization-block-parent-inner-${
                this.props.style || "default"
              }`,
              style: innerParentStyle
            },
            this.renderBlock(
              this.props.items,
              layoutOptions.collapseColumnsWidth != null && size.width <= layoutOptions.collapseColumnsWidth
            )
          )
        )
      })
    }
  }
}
export default BlocksDisplayComponent

interface RootBlockComponentProps {
  block: any
  collapseColumns?: boolean
  renderBlock: any
  /** Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right */
  onBlockDrop?: any
  onBlockRemove?: any
}

class RootBlockComponent extends React.Component<RootBlockComponentProps> {
  render() {
    const elem = R(
      "div",
      { key: "root" },
      _.map(this.props.block.blocks, (block) => {
        return this.props.renderBlock(block, this.props.collapseColumns)
      })
    )

    // If draggable
    if (this.props.onBlockDrop != null) {
      return R(
        DraggableBlockComponent,
        {
          block: this.props.block,
          onBlockDrop: this.props.onBlockDrop,
          style: { height: "100%" },
          onlyBottom: true
        },
        elem
      )
    } else {
      return elem
    }
  }
}
interface VerticalBlockComponentProps {
  block: any
  collapseColumns?: boolean
  renderBlock: any
  /** Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right */
  onBlockDrop?: any
  onBlockRemove?: any
}

class VerticalBlockComponent extends React.Component<VerticalBlockComponentProps> {
  render() {
    return R(
      "div",
      null,
      _.map(this.props.block.blocks, (block) => {
        return this.props.renderBlock(block, this.props.collapseColumns)
      })
    )
  }
}

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ImageWidgetComponent
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"
import classNames from "classnames"
import ui from "react-library/lib/bootstrap"
import uuid from "uuid"
import Dropzone from "react-dropzone"
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent"
import AutoSizeComponent from "react-library/lib/AutoSizeComponent"
import DropdownWidgetComponent from "./DropdownWidgetComponent"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import TabbedComponent from "react-library/lib/TabbedComponent"
import { ExprComponent } from "mwater-expressions-ui"
import TableSelectComponent from "../TableSelectComponent"
import ImageUploaderComponent from "./ImageUploaderComponent"
import ImagelistCarouselComponent from "./ImagelistCarouselComponent"

export default ImageWidgetComponent = (function () {
  ImageWidgetComponent = class ImageWidgetComponent extends AsyncLoadComponent {
    static initClass() {
      this.propTypes = {
        design: PropTypes.object.isRequired,
        onDesignChange: PropTypes.func, // Called with new design. null/undefined for readonly
        filters: PropTypes.array,

        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired, // Data source to use for widget
        widgetDataSource: PropTypes.object.isRequired,

        width: PropTypes.number,
        height: PropTypes.number,

        singleRowTable: PropTypes.string
      }
      // Table that is filtered to have one row
    }

    // Override to determine if a load is needed. Not called on mounting
    isLoadNeeded(newProps, oldProps) {
      return (
        newProps.design.expr &&
        (!_.isEqual(newProps.design.expr, oldProps.design.expr) || !_.isEqual(newProps.filters, oldProps.filters))
      )
    }

    // Call callback with state changes
    load(props, prevProps, callback) {
      // Get data
      return props.widgetDataSource.getData(props.design, props.filters, (error, data) => {
        return callback({ error, data })
      })
    }

    handleStartEditing = () => {
      return this.editor.edit()
    }

    // Render a link to start editing
    renderEditLink() {
      return R(
        "div",
        { className: "mwater-visualization-widget-placeholder", onClick: this.handleStartEditing },
        R("i", { className: "icon fa fa-image" })
      )
    }

    renderEditor() {
      return R(ImageWidgetDesignComponent, {
        ref: (c) => {
          return (this.editor = c)
        },
        key: "editor",
        design: this.props.design,
        onDesignChange: this.props.onDesignChange,
        schema: this.props.schema,
        dataSource: this.props.dataSource
      })
    }

    renderExpression() {
      if (this.state.loading) {
        return R("span", null, "Loading")
      } else if (this.state.data) {
        // Make into array if not
        if (!_.isArray(this.state.data)) {
          return R(AutoSizeComponent, { injectHeight: true }, (size) => {
            return R(ImagelistCarouselComponent, {
              widgetDataSource: this.props.widgetDataSource,
              imagelist: [this.state.data],
              height: size.height
            })
          })
        } else {
          return R(AutoSizeComponent, { injectHeight: true }, (size) => {
            return R(ImagelistCarouselComponent, {
              widgetDataSource: this.props.widgetDataSource,
              imagelist: this.state.data,
              height: size.height
            })
          })
        }
      }
    }

    renderContent() {
      if (this.props.design.imageUrl || this.props.design.uid) {
        // Determine approximate height
        let imageHeight = null

        if (this.props.height <= 160) {
          imageHeight = 160
        } else if (this.props.height <= 320) {
          imageHeight = 320
        } else if (this.props.height <= 640) {
          imageHeight = 640
        } else if (this.props.height <= 1280) {
          imageHeight = 1280
        }

        const source =
          this.props.design.imageUrl || this.props.widgetDataSource.getImageUrl(this.props.design.uid, imageHeight)
        return R(RotatedImageComponent, {
          imgUrl: source,
          url: this.props.design.url,
          rotation: this.props.design.rotation
        })
      } else {
        return this.renderExpression()
      }
    }

    render() {
      const dropdownItems = []
      if (this.props.onDesignChange != null) {
        dropdownItems.push({ label: "Edit", icon: "pencil", onClick: this.handleStartEditing })
      }

      const captionPosition = this.props.design.captionPosition || "bottom"

      return R(
        DropdownWidgetComponent,
        {
          width: this.props.width,
          height: this.props.height,
          dropdownItems
        },
        this.renderEditor(),
        !this.props.design.imageUrl && !this.props.design.expr && !this.props.design.uid && this.props.onDesignChange
          ? this.renderEditLink()
          : R(
              "div",
              {
                className: "mwater-visualization-image-widget",
                style: { position: "relative", width: this.props.width, height: this.props.height }
              },
              captionPosition === "top" ? R("div", { className: "caption" }, this.props.design.caption) : undefined,
              R("div", { className: "image" }, this.renderContent()),
              captionPosition === "bottom" ? R("div", { className: "caption" }, this.props.design.caption) : undefined
            )
      )
    }
  }
  ImageWidgetComponent.initClass()
  return ImageWidgetComponent
})()

class ImageWidgetDesignComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      design: PropTypes.object.isRequired,
      onDesignChange: PropTypes.func, // Called with new design. null/undefined for readonly
      schema: PropTypes.object.isRequired,
      dataSource: PropTypes.object.isRequired
    }
    // Data source to use for widget
  }

  constructor(props) {
    super(props)

    this.state = {
      // Widget data
      data: null,
      error: null,
      editing: false,
      imageUrl: null,
      expr: null,
      table: null,
      uid: null,
      files: null,
      uploading: false,
      caption: null,
      currentTab: "url",
      rotation: null,
      captionPosition: null,
      url: null
    }
  }

  edit = () => {
    this.setCurrentTab()
    const state = {
      editing: true,
      imageUrl: this.props.design.imageUrl,
      uid: this.props.design.uid,
      expr: this.props.design.expr,
      table: this.props.design.expr?.table,
      caption: this.props.design.caption,
      rotation: this.props.design.rotation,
      captionPosition: this.props.design.captionPosition,
      url: this.props.design.url
    }

    return this.setState(state)
  }

  setCurrentTab() {
    let tab = "upload"

    if (this.props.design.url) {
      tab = "url"
    }
    if (this.props.design.expr) {
      tab = "expression"
    }

    return this.setState({ currentTab: tab })
  }

  handleImageUrlChange = (e) => {
    return this.setState({ imageUrl: e.target.value, uid: null, expr: null })
  }

  handleUrlChange = (e) => {
    return this.setState({ url: e.target.value })
  }

  renderUploadEditor() {
    return R(
      "div",
      null,
      R(ImageUploaderComponent, {
        dataSource: this.props.dataSource,
        onUpload: this.handleFileUpload,
        uid: this.props.design.uid
      }),
      this.renderRotation()
    )
  }

  handleFileUpload = (uid) => {
    return this.setState({ imageUrl: null, uid, expr: null })
  }

  handleExpressionChange = (expr) => {
    return this.setState({ imageUrl: null, uid: null, expr, url: null })
  }

  handleTableChange = (table) => {
    return this.setState({ table })
  }
  handleCaptionChange = (ev) => {
    return this.setState({ caption: ev.target.value })
  }
  handleRotationChange = (rotation) => {
    return this.setState({ rotation })
  }
  handleCaptionPositionChange = (captionPosition) => {
    return this.setState({ captionPosition })
  }

  handleSave = () => {
    this.setState({ editing: false })
    const updates = {
      imageUrl: this.state.imageUrl,
      url: this.state.url,
      uid: this.state.uid,
      expr: this.state.expr,
      caption: this.state.caption,
      rotation: this.state.rotation,
      captionPosition: this.state.captionPosition
    }

    return this.props.onDesignChange(_.extend({}, this.props.design, updates))
  }

  handleCancel = () => {
    this.setCurrentTab()
    return this.setState({
      editing: false,
      imageUrl: null,
      url: null,
      uid: null,
      expr: null,
      table: null,
      files: null,
      uploading: false,
      captionPosition: null
    })
  }

  renderExpressionEditor() {
    return R(
      "div",
      { className: "form-group" },
      R("label", { className: "text-muted" }, R("i", { className: "fa fa-database" }), " ", "Data Source"),
      ": ",
      R(TableSelectComponent, { schema: this.props.schema, value: this.state.table, onChange: this.handleTableChange }),
      R("br"),

      this.state.table
        ? R(
            "div",
            { className: "form-group" },
            R("label", { className: "text-muted" }, "Field"),
            ": ",
            R(ExprComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.state.table,
              types: ["image", "imagelist"],
              value: this.state.expr,
              aggrStatuses: ["individual", "literal"],
              onChange: this.handleExpressionChange
            })
          )
        : undefined
    )
  }

  renderRotation() {
    return R(
      "div",
      { style: { paddingTop: 10 } },
      "Rotation: ",
      R(
        ui.Radio,
        { value: this.state.rotation || null, radioValue: null, onChange: this.handleRotationChange, inline: true },
        "0 degrees"
      ),
      R(
        ui.Radio,
        { value: this.state.rotation || null, radioValue: 90, onChange: this.handleRotationChange, inline: true },
        "90 degrees"
      ),
      R(
        ui.Radio,
        { value: this.state.rotation || null, radioValue: 180, onChange: this.handleRotationChange, inline: true },
        "180 degrees"
      ),
      R(
        ui.Radio,
        { value: this.state.rotation || null, radioValue: 270, onChange: this.handleRotationChange, inline: true },
        "270 degrees"
      )
    )
  }

  renderImageUrlEditor() {
    return R(
      "div",
      { className: "form-group" },
      R("label", null, "URL of image"),
      R("input", {
        type: "text",
        className: "form-control",
        value: this.state.imageUrl || "",
        onChange: this.handleImageUrlChange
      }),
      R("p", { className: "help-block" }, "e.g. http://somesite.com/image.jpg"),
      this.renderRotation()
    )
  }

  renderUrlEditor() {
    return R(
      "div",
      { className: "form-group" },
      R("label", null, "URL to open"),
      R("input", {
        type: "text",
        className: "form-control",
        value: this.state.url || "",
        onChange: this.handleUrlChange
      }),
      R("p", { className: "help-block" }, "e.g. http://somesite.com/"),
      R("p", { className: "help-block" }, "When clicked on image, this link will open in a new tab")
    )
  }

  render() {
    if (!this.state.editing) {
      return null
    }

    const content = R(
      "div",
      null,
      R(
        "div",
        { className: "form-group" },
        R("label", null, "Caption"),
        R("input", {
          type: "text",
          className: "form-control",
          value: this.state.caption || "",
          onChange: this.handleCaptionChange,
          placeholder: "Optional caption to display below image"
        })
      ),

      this.state.caption
        ? R(
            "div",
            { className: "form-group" },
            R("label", null, "Caption position"),
            R(ui.Select, {
              options: [
                { value: "bottom", label: "Bottom" },
                { value: "top", label: "Top" }
              ],
              value: this.state.captionPosition,
              onChange: this.handleCaptionPositionChange
            })
          )
        : undefined,

      R(TabbedComponent, {
        tabs: [
          { id: "upload", label: "Upload", elem: this.renderUploadEditor() },
          { id: "expression", label: "From Data", elem: this.renderExpressionEditor() },
          { id: "url", label: "From URL", elem: this.renderImageUrlEditor() }
        ],
        initialTabId: this.state.currentTab
      }),
      // No target URL when using expressions
      this.state.imageUrl || this.state.uid ? this.renderUrlEditor() : undefined
    )

    const footer = R(
      "div",
      null,
      R("button", { key: "save", type: "button", className: "btn btn-primary", onClick: this.handleSave }, "Save"),
      R("button", { key: "cancel", type: "button", className: "btn btn-default", onClick: this.handleCancel }, "Cancel")
    )

    return R(
      ModalPopupComponent,
      {
        header: "Image",
        scrollDisabled: true,
        footer
      },
      content
    )
  }
}
ImageWidgetDesignComponent.initClass()

// Image which is rotated by x degrees (0, 90, 180, 270)
class RotatedImageComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      imgUrl: PropTypes.string.isRequired, // Url of the image
      rotation: PropTypes.number,
      onClick: PropTypes.func,
      caption: PropTypes.string,
      url: PropTypes.string
    }
    // Url to be opened when the image is clicked
  }

  render() {
    return R(AutoSizeComponent, { injectWidth: true, injectHeight: true }, (size) => {
      const imageStyle = {}
      const containerStyle = {}

      // These css classes are defined in mwater-forms
      const classes = classNames({
        rotated: this.props.rotation,
        "rotate-90": this.props.rotation && this.props.rotation === 90,
        "rotate-180": this.props.rotation && this.props.rotation === 180,
        "rotate-270": this.props.rotation && this.props.rotation === 270
      })

      imageStyle.width = "100%"
      imageStyle.height = "100%"
      imageStyle.objectFit = "contain"

      // Set width if rotated left or right
      if (this.props.rotation === 90 || this.props.rotation === 270) {
        imageStyle.width = size.height
      }

      const img = R(
        "span",
        {
          className: "rotated-image-container",
          style: containerStyle
        },
        R("img", {
          src: this.props.imgUrl,
          style: imageStyle,
          className: classes,
          onClick: this.props.onClick,
          alt: this.props.caption || ""
        })
      )

      if (!this.props.url) {
        return img
      } else {
        return R("a", { href: this.props.url, target: "_blank" }, img)
      }
    })
  }
}
RotatedImageComponent.initClass()

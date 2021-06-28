// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MarkdownWidget
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"
import Widget from "./Widget"
import DropdownWidgetComponent from "./DropdownWidgetComponent"
import Markdown from "markdown-it"
import ModalWindowComponent from "react-library/lib/ModalWindowComponent"

export default MarkdownWidget = class MarkdownWidget extends Widget {
  // Creates a React element that is a view of the widget
  // options:
  //  schema: schema to use
  //  dataSource: data source to use
  //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  //  design: widget design
  //  scope: scope of the widget (when the widget self-selects a particular scope)
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  onScopeChange: called with scope of widget
  //  onDesignChange: called with new design. null/undefined for readonly
  //  width: width in pixels on screen
  //  height: height in pixels on screen
  createViewElement(options) {
    return React.createElement(MarkdownWidgetComponent, {
      design: options.design,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height
    })
  }

  // Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight() {
    return true
  }
}

class MarkdownWidgetComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      design: PropTypes.object.isRequired, // See Map Design.md
      onDesignChange: PropTypes.func, // Called with new design. null/undefined for readonly

      width: PropTypes.number,
      height: PropTypes.number
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      // Design that is being edited. Change is propagated on closing window
      editDesign: null
    }
  }

  handleStartEditing = () => {
    return this.setState({ editDesign: this.props.design })
  }

  handleEndEditing = () => {
    this.props.onDesignChange(this.state.editDesign)
    return this.setState({ editDesign: null })
  }

  handleEditDesignChange = (design) => {
    return this.setState({ editDesign: design })
  }

  renderEditor() {
    if (!this.state.editDesign) {
      return null
    }

    // Create editor
    const editor = React.createElement(MarkdownWidgetDesignerComponent, {
      design: this.state.editDesign,
      onDesignChange: this.handleEditDesignChange
    })

    // Create item (maxing out at half of width of screen)
    const width = Math.min(document.body.clientWidth / 2, this.props.width)
    const chart = this.renderContent(this.state.editDesign)

    const content = R(
      "div",
      { style: { height: "100%", width: "100%" } },
      R(
        "div",
        {
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            border: "solid 2px #EEE",
            borderRadius: 8,
            padding: 10,
            width: width + 20,
            height: this.props.height + 20
          }
        },
        chart
      ),
      R(
        "div",
        { style: { width: "100%", height: "100%", paddingLeft: width + 40 } },
        R(
          "div",
          {
            style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" }
          },
          editor
        )
      )
    )

    return React.createElement(
      ModalWindowComponent,
      {
        isOpen: true,
        onRequestClose: this.handleEndEditing
      },
      content
    )
  }

  renderContent(design) {
    return React.createElement(MarkdownWidgetViewComponent, {
      design,
      width: this.props.width,
      height: this.props.height
    })
  }

  render() {
    const dropdownItems = []
    if (this.props.onDesignChange != null) {
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: this.handleStartEditing })
    }

    // Wrap in a simple widget
    return R(
      "div",
      { onDoubleClick: this.handleStartEditing },
      this.props.onDesignChange != null ? this.renderEditor() : undefined,
      React.createElement(
        DropdownWidgetComponent,
        {
          width: this.props.width,
          height: this.props.height,
          dropdownItems
        },
        this.renderContent(this.props.design)
      )
    )
  }
}
MarkdownWidgetComponent.initClass()

class MarkdownWidgetViewComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      design: PropTypes.object.isRequired, // Design of chart

      width: PropTypes.number,
      height: PropTypes.number
    }
  }

  render() {
    return R("div", {
      style: {
        width: this.props.width,
        height: this.props.height
      },
      className: "mwater-visualization-markdown",
      dangerouslySetInnerHTML: { __html: new Markdown().render(this.props.design.markdown || "") }
    })
  }
}
MarkdownWidgetViewComponent.initClass()

class MarkdownWidgetDesignerComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      design: PropTypes.object.isRequired,
      onDesignChange: PropTypes.func.isRequired
    }
  }

  handleMarkdownChange = (ev) => {
    const design = _.extend({}, this.props.design, { markdown: ev.target.value })
    return this.props.onDesignChange(design)
  }

  render() {
    return R("textarea", {
      className: "form-control",
      style: { width: "100%", height: "100%" },
      value: this.props.design.markdown,
      onChange: this.handleMarkdownChange
    })
  }
}
MarkdownWidgetDesignerComponent.initClass()

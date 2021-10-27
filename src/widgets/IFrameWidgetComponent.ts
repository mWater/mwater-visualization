import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"
import * as ui from "react-library/lib/bootstrap"
import DropdownWidgetComponent from "./DropdownWidgetComponent"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"

interface IFrameWidgetComponentProps {
  design: any
  /** Called with new design. null/undefined for readonly */
  onDesignChange?: any
  width?: number
  height?: number
}

interface IFrameWidgetComponentState {
  editUrl: any
  editing: any
}

export default class IFrameWidgetComponent extends React.Component<
  IFrameWidgetComponentProps,
  IFrameWidgetComponentState
> {
  constructor(props: any) {
    super(props)
    this.state = {
      // True when editing chart
      editing: false,
      editUrl: null
    }
  }

  handleStartEditing = () => {
    return this.setState({ editing: true, editUrl: this.props.design.url })
  }

  handleEndEditing = () => {
    this.setState({ editing: false })
    return this.props.onDesignChange(_.extend({}, this.props.design, { url: this.state.editUrl }))
  }

  renderEditor() {
    if (!this.state.editing) {
      return null
    }

    const content = R(
      "div",
      { className: "mb-3" },
      R("label", null, "URL to embed"),
      R("input", {
        type: "text",
        className: "form-control",
        value: this.state.editUrl || "",
        onChange: (ev: any) => this.setState({ editUrl: ev.target.value })
      }),
      R("div", { className: "form-text text-muted" }, "e.g. https://www.youtube.com/embed/dQw4w9WgXcQ")
    )

    return R(
      ModalPopupComponent,
      {
        header: "Configure",
        showCloseX: true,
        onClose: this.handleEndEditing
      },
      content
    )
  }

  // Render a link to start editing
  renderEditLink() {
    return R(
      "div",
      { className: "mwater-visualization-widget-placeholder", onClick: this.handleStartEditing },
      R(ui.Icon, { id: "fa-youtube-play" })
    )
  }
  // R 'div', style: { position: "absolute", bottom: @props.height / 2, left: 0, right: 0, textAlign: "center" },
  //   R 'a', className: "btn btn-link", onClick: @handleStartEditing, "Click Here to Configure"

  render() {
    const dropdownItems = []
    if (this.props.onDesignChange != null) {
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: this.handleStartEditing })
    }

    return R(
      DropdownWidgetComponent,
      {
        width: this.props.width,
        height: this.props.height,
        dropdownItems
      },
      this.renderEditor(),
      (() => {
        if (this.props.design.url) {
          return R("iframe", {
            src: this.props.design.url,
            width: this.props.width,
            height: this.props.height,
            frameborder: 0,
            allowfullscreen: true
          })
        } else {
          if (this.props.onDesignChange != null) {
            return this.renderEditLink()
          }
        }
      })()
    )
  }
}

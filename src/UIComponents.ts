import _ from "lodash"
import React from "react"
import ReactDOM from "react-dom"
const R = React.createElement
import * as motion from "react-motion"
import { LinkComponent } from "mwater-expressions-ui"

export interface SectionComponentProps {
  icon?: string
  label?: any
}

// Miscellaneous ui components

// Section with a title and icon
export class SectionComponent extends React.Component<SectionComponentProps> {
  render() {
    return R(
      "div",
      { style: { marginBottom: 15 } },
      R(
        "label",
        { className: "text-muted" },
        this.props.icon && this.props.icon.match(/^fa-/)
          ? [R("i", { className: `fa ${this.props.icon}` }), " "]
          : undefined,
        this.props.icon && this.props.icon.match(/^glyphicon-/)
          ? [R("span", { className: `glyphicon ${this.props.icon}` }), " "]
          : undefined,
        this.props.label
      ),
      R("div", { style: { marginLeft: 10 } }, this.props.children)
    )
  }
}

/** List of options with a name and description each */
export class OptionListComponent extends React.Component<{
  items: {
    name: string
    desc?: string
    onClick: () => void
    onRemove?: () => void
  }[]
  hint?: string
}> {
  render() {
    return R(
      "div",
      null,
      R("div", { style: { color: "#AAA", fontStyle: "italic" }, key: "hint" }, this.props.hint),
      R(
        "div",
        { className: "mwater-visualization-big-options", key: "options" },
        _.map(this.props.items, (item, i) => {
          return R(OptionComponent, {
            name: item.name,
            desc: item.desc,
            onClick: item.onClick,
            onRemove: item.onRemove,
            key: i
          })
        })
      )
    )
  }
}

interface OptionComponentProps {
  name?: string
  desc?: string
  onClick: any
  onRemove?: any
}

// Single option
export class OptionComponent extends React.Component<OptionComponentProps> {
  handleClick = (ev: any) => {
    ev.stopPropagation()
    return this.props.onRemove()
  }

  render() {
    return R(
      "div",
      { className: "mwater-visualization-big-option", onClick: this.props.onClick },
      this.props.onRemove
        ? R(
            "button",
            { type: "button", className: "btn btn-link btn-sm float-end", onClick: this.handleClick },
            R("span", { className: "fas fa-times" })
          )
        : undefined,
      R("div", { style: { fontWeight: "bold" } }, this.props.name),
      R("div", { style: { color: "#888" } }, this.props.desc)
    )
  }
}
interface SwitchViewComponentProps {
  /** Map of view id to view element */
  views: any
  viewId: string
}

interface SwitchViewComponentState {
  measuring: any
}

// Switches views smoothly
export class SwitchViewComponent extends React.Component<SwitchViewComponentProps, SwitchViewComponentState> {
  constructor(props: any) {
    super(props)
    this.state = {
      measuring: false
    }
  }

  componentWillReceiveProps(nextProps: any) {
    // If view changes, measure all components
    if (nextProps.viewId !== this.props.viewId) {
      return this.setState({ measuring: true })
    }
  }

  // Save components
  refCallback = (id: any, comp: any) => {
    this.comps = this.comps || {}
    return (this.comps[id] = comp)
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    // If measuring, get the heights to interpolate
    if (this.state.measuring) {
      this.heights = {}

      // Get heights
      for (let id of _.keys(this.props.views)) {
        this.heights[id] = ReactDOM.findDOMNode(this.comps[id]).clientHeight
      }

      return this.setState({ measuring: false })
    }
  }

  render() {
    // Create the style object that has the opacity for each view
    let id
    const style = {}
    for (id in this.props.views) {
      const view = this.props.views[id]
      style[id] = motion.spring(id === this.props.viewId ? 1 : 0, [332, 34])
    } // Stiff, quick spring

    return R(motion.Motion, { style }, (style: any) => {
      // If measuring, display all positioned at top
      if (this.state.measuring) {
        return R(
          "div",
          { style: { position: "relative" } },
          _.map(_.keys(this.props.views), (v) => {
            return R(
              "div",
              {
                style: { position: "absolute", top: 0, opacity: style[v] },
                ref: this.refCallback.bind(null, v),
                key: v
              },
              this.props.views[v]
            )
          })
        )
      }

      // If transitioning
      if (style[this.props.viewId] !== 1) {
        // Calculate interpolated height
        let height = 0
        for (id in style) {
          const val = style[id]
          height += val * this.heights[id]
        }

        return R(
          "div",
          { style: { position: "relative", height } },
          _.map(_.keys(this.props.views), (v) => {
            return R(
              "div",
              { style: { position: "absolute", top: 0, left: 0, right: 0, opacity: style[v] }, key: v },
              this.props.views[v]
            )
          })
        )
      }

      // Just display (but wrapped to keep same component)
      return R("div", null, R("div", { key: this.props.viewId }, this.props.views[this.props.viewId]))
    })
  }
}

interface ToggleEditComponentProps {
  forceOpen?: boolean
  initiallyOpen?: boolean
  label: any
  editor: any
  onRemove?: any
}

interface ToggleEditComponentState {
  open: any
}

// Shows as editable link that can be clicked to open
// Editor can be node or can be function that takes onClose function as first parameter
export class ToggleEditComponent extends React.Component<ToggleEditComponentProps, ToggleEditComponentState> {
  constructor(props: any) {
    super(props)
    this.state = { open: props.initiallyOpen || false }
  }

  close = () => {
    // Save height of editor
    if (this.editorComp) {
      this.editorHeight = ReactDOM.findDOMNode(this.editorComp).clientHeight
    }

    return this.setState({ open: false })
  }

  open = () => {
    return this.setState({ open: true })
  }

  handleToggle = () => {
    return this.setState({ open: !this.state.open })
  }

  // Save editor comp
  editorRef = (editorComp: any) => {
    return (this.editorComp = editorComp)
  }

  render() {
    let { editor } = this.props
    if (_.isFunction(editor)) {
      editor = editor(this.close)
    }

    const link = R(LinkComponent, { onClick: this.open, onRemove: this.props.onRemove }, this.props.label)

    const isOpen = this.state.open || this.props.forceOpen

    return R(SwitchViewComponent, {
      views: { editor, link },
      viewId: isOpen ? "editor" : "link"
    })
  }
}

interface ButtonToggleComponentProps {
  value?: any
  /** List of layers */
  options: any
  onChange: any
}

// Switch between several values as a series of radio buttons
export class ButtonToggleComponent extends React.Component<ButtonToggleComponentProps> {
  render() {
    return R(
      "div",
      { className: "btn-group btn-group-sm" },
      _.map(this.props.options, (option, i) => {
        return R(
          "button",
          {
            type: "button",
            key: option.value,
            className: option.value === this.props.value ? "btn btn-default active" : "btn btn-default",
            onClick: this.props.onChange.bind(null, option.value)
          },
          option.label
        )
      })
    )
  }
}

import _ from "lodash"
import $ from "jquery"
import PropTypes from "prop-types"
import React from "react"
import ReactDOM from "react-dom"

export interface PopoverComponentProps {
  /** contents of popover */
  content: any
  /** See http://getbootstrap.com/javascript/#popovers */
  placement?: string
  visible: boolean
}

// Wraps a child with an optional popover
export default class PopoverComponent extends React.Component<PopoverComponentProps> {
  componentDidMount() {
    return this.updatePopover(this.props, null)
  }

  componentWillUnmount() {
    return this.updatePopover(null, this.props)
  }

  componentDidUpdate(prevProps: any) {
    if (
      !_.isEqual(prevProps.content, this.props.content) ||
      prevProps.visible !== this.props.visible ||
      prevProps.placement !== this.props.placement
    ) {
      return this.updatePopover(this.props, prevProps)
    }
  }

  updatePopover(props: any, oldProps: any) {
    // Destroy old popover
    if (oldProps && oldProps.visible) {
      $(ReactDOM.findDOMNode(this)).popover("destroy")
    }

    if (props && props.visible) {
      const div = document.createElement("div")
      return ReactDOM.render(this.props.content, div, () => {
        $(ReactDOM.findDOMNode(this)).popover({
          content() {
            return $(div)
          },
          html: true,
          trigger: "manual",
          placement: this.props.placement
        })
        return $(ReactDOM.findDOMNode(this)).popover("show")
      })
    }
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

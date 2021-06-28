// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let PopoverComponent
import _ from "lodash"
import $ from "jquery"
import PropTypes from "prop-types"
import React from "react"
import ReactDOM from "react-dom"

// Wraps a child with an optional popover
export default PopoverComponent = (function () {
  PopoverComponent = class PopoverComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        content: PropTypes.node.isRequired, // contents of popover
        placement: PropTypes.string, // See http://getbootstrap.com/javascript/#popovers
        visible: PropTypes.bool.isRequired
      }
    }

    componentDidMount() {
      return this.updatePopover(this.props, null)
    }

    componentWillUnmount() {
      return this.updatePopover(null, this.props)
    }

    componentDidUpdate(prevProps) {
      if (
        !_.isEqual(prevProps.content, this.props.content) ||
        prevProps.visible !== this.props.visible ||
        prevProps.placement !== this.props.placement
      ) {
        return this.updatePopover(this.props, prevProps)
      }
    }

    updatePopover(props, oldProps) {
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
  PopoverComponent.initClass()
  return PopoverComponent
})()

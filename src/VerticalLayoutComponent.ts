import $ from "jquery"
import React from "react"
import ReactDOM from "react-dom"
const R = React.createElement
import _ from "lodash"

export interface VerticalLayoutComponentProps {
  height: number
  relativeHeights: any
}

interface VerticalLayoutComponentState {
  availableHeight: any
}

// Lays out divs vertically, allowing fractional allocation combined with auto-sized ones
// Children must all have keys
// Children will be cloned with height: prop set in case of fractional ones
export default class VerticalLayoutComponent extends React.Component<
  VerticalLayoutComponentProps,
  VerticalLayoutComponentState
> {
  constructor(props: any) {
    super(props)
    this.state = { availableHeight: 0 }
    this.childRefs = {}
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps.height !== this.props.height || !_.isEqual(nextProps.relativeHeights, this.props.relativeHeights)) {
      return this.recalculateSize(nextProps)
    }
  }

  componentDidMount() {
    return this.recalculateSize(this.props)
  }

  recalculateSize(props: any) {
    // Calculate available height
    let availableHeight = props.height

    for (let child of props.children) {
      if (!child) {
        continue
      }
      if (props.relativeHeights[child.key]) {
        continue
      }

      const node = ReactDOM.findDOMNode(this.childRefs[child.key])
      availableHeight -= $(node).outerHeight()
    }

    return this.setState({ availableHeight })
  }

  // Get a subcomponent
  getComponent(key: any) {
    return this.childRefs[key]
  }

  render() {
    // Calculate scaling
    return R(
      "div",
      { style: { height: this.props.height } },
      React.Children.map(this.props.children, (child) => {
        if (!child) {
          return
        }

        // If variable height
        if (child.key && this.props.relativeHeights[child.key]) {
          // If available height is known, render variable
          if (this.state.availableHeight) {
            const height = this.state.availableHeight * this.props.relativeHeights[child.key]
            return R(
              "div",
              { style: { height, position: "relative" } },
              R(
                "div",
                {
                  style: { height },
                  ref: (c: any) => {
                    return (this.childRefs[child.key] = c)
                  }
                },
                React.cloneElement(child, { height })
              )
            )
          }
          // Otherwise don't show until available height is known
          return null
        }
        return R(
          "div",
          {
            ref: (c: any) => {
              return (this.childRefs[child.key] = c)
            }
          },
          child
        )
      })
    )
  }
}

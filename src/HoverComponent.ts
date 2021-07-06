import React from "react"
import ReactDOM from "react-dom"

export default class HoverComponent extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = { hovered: false }
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this.main).addEventListener("mouseover", this.onOver)
    return ReactDOM.findDOMNode(this.main).addEventListener("mouseout", this.onOut)
  }

  componentWillUnmount() {
    ReactDOM.findDOMNode(this.main).removeEventListener("mouseover", this.onOver)
    return ReactDOM.findDOMNode(this.main).removeEventListener("mouseout", this.onOut)
  }

  onOver = () => {
    return this.setState({ hovered: true })
  }

  onOut = () => {
    return this.setState({ hovered: false })
  }

  render() {
    return React.cloneElement(React.Children.only(this.props.children), {
      ref: (c: any) => {
        return (this.main = c)
      },
      hovered: this.state.hovered
    })
  }
}

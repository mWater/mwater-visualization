// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import React from "react"
import ReactDOM from "react-dom"
const R = React.createElement
import $ from "jquery"

// LargeListComponent = require './LargeListComponent'

import VerticalLayoutComponent from "./VerticalLayoutComponent"

class Parent extends React.Component {
  componentDidMount() {
    return console.log(this.refs)
  }

  render() {
    return R(
      "div",
      null,
      R("div", { ref: "simple" }, R("div", { ref: "complex" })),
      React.createElement(Child, {}, R("div", { ref: "simple2" }, R("div", { ref: "complex2" })))
    )
  }
}

class Child extends React.Component {
  render() {
    return R(
      "div",
      { style: { height: this.props.height, backgroundColor: this.props.backgroundColor } },
      this.props.children
    )
  }
}

$(function () {
  const sample = React.createElement(
    VerticalLayoutComponent,
    {
      height: 200,
      relativeHeights: { a: 0.6, b: 0.4 }
    },
    React.createElement(Child, { key: "a", backgroundColor: "red" }),
    React.createElement(Child, { key: "b", backgroundColor: "green" }),
    React.createElement(Child, { key: "c", backgroundColor: "blue", height: 50 })
  )
  // sample = React.createElement(LargeListComponent, {
  //   loadRows: (start, number, cb) =>
  //     # console.log start
  //     # console.log number
  //     setTimeout () =>
  //       cb(null, _.range(start, start + number))
  //     , 200

  //   renderRow: (row, index) -> R('div', style: { height: 25 }, key: index + "", "" + row)
  //   rowHeight: 25
  //   pageSize: 100
  //   height: 500
  //   rowCount: 10000
  //   bufferSize: 100
  //   })
  return ReactDOM.render(sample, document.body)
})

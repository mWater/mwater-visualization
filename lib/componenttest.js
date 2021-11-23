"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const R = react_1.default.createElement;
const jquery_1 = __importDefault(require("jquery"));
// LargeListComponent = require './LargeListComponent'
const VerticalLayoutComponent_1 = __importDefault(require("./VerticalLayoutComponent"));
class Parent extends react_1.default.Component {
    componentDidMount() {
        return console.log(this.refs);
    }
    render() {
        return R("div", null, R("div", { ref: "simple" }, R("div", { ref: "complex" })), react_1.default.createElement(Child, {}, R("div", { ref: "simple2" }, R("div", { ref: "complex2" }))));
    }
}
class Child extends react_1.default.Component {
    render() {
        return R("div", { style: { height: this.props.height, backgroundColor: this.props.backgroundColor } }, this.props.children);
    }
}
(0, jquery_1.default)(function () {
    const sample = react_1.default.createElement(VerticalLayoutComponent_1.default, {
        height: 200,
        relativeHeights: { a: 0.6, b: 0.4 }
    }, react_1.default.createElement(Child, { key: "a", backgroundColor: "red" }), react_1.default.createElement(Child, { key: "b", backgroundColor: "green" }), react_1.default.createElement(Child, { key: "c", backgroundColor: "blue", height: 50 }));
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
    return react_dom_1.default.render(sample, document.body);
});

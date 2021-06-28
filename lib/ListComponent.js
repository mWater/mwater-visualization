"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ListControl;
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
exports.default = ListControl = react_1.default.createClass({
    propTypes: {
        items: prop_types_1.default.array.isRequired,
        onSelect: prop_types_1.default.func.isRequired,
        selected: prop_types_1.default.string // Currently selected item
    },
    render() {
        return R("div", null, lodash_1.default.map(this.props.items, (item) => {
            return react_1.default.createElement(ListItem, {
                key: item.id,
                onSelect: this.props.onSelect.bind(null, item.id),
                selected: this.props.selected === item.id
            }, item.display);
        }));
    }
});
var ListItem = react_1.default.createClass({
    getInitialState() {
        return { hover: false };
    },
    mouseOver() {
        return this.setState({ hover: true });
    },
    mouseOut() {
        return this.setState({ hover: false });
    },
    render() {
        const style = {
            border: "solid 1px #DDD",
            marginBottom: -1,
            padding: 3,
            cursor: "pointer"
        };
        if (this.props.selected) {
            style.color = "#EEE";
            style.backgroundColor = this.state.hover ? "#286090" : "#337AB7";
        }
        else if (this.state.hover) {
            style.backgroundColor = "#EEE";
        }
        return R("div", { style, onMouseOver: this.mouseOver, onMouseOut: this.mouseOut, onClick: this.props.onSelect }, this.props.children);
    }
});

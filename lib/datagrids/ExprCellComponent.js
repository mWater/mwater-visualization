"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const moment_1 = __importDefault(require("moment"));
const mwater_expressions_1 = require("mwater-expressions");
const react_linkify_1 = __importDefault(require("react-linkify"));
const fixed_data_table_2_1 = require("fixed-data-table-2");
const valueFormatter_1 = require("../valueFormatter");
const valueFormatter_2 = require("../valueFormatter");
// Cell that displays an expression column cell
class ExprCellComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleClick = () => {
            return this.setState({ editing: true });
        };
    }
    renderImage(id) {
        const url = this.props.dataSource.getImageUrl(id);
        return R("a", { href: url, key: id, target: "_blank", style: { paddingLeft: 5, paddingRight: 5 } }, "Image");
    }
    render() {
        let node;
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        let { value } = this.props;
        if (value == null || !this.props.expr) {
            node = null;
        }
        else {
            // Parse if should be JSON
            if (["image", "imagelist", "geometry", "text[]"].includes(this.props.exprType) && lodash_1.default.isString(value)) {
                value = JSON.parse(value);
            }
            // Format if possible
            if (valueFormatter_1.canFormatType(this.props.exprType)) {
                node = valueFormatter_2.formatValue(this.props.exprType, value, this.props.format);
            }
            else {
                // Convert to node based on type
                switch (this.props.exprType) {
                    case "text":
                        node = R(react_linkify_1.default, { properties: { target: "_blank" } }, value);
                        break;
                    case "boolean":
                    case "enum":
                    case "enumset":
                    case "text[]":
                        node = exprUtils.stringifyExprLiteral(this.props.expr, value, this.props.locale);
                        break;
                    case "date":
                        node = moment_1.default(value, "YYYY-MM-DD").format("ll");
                        break;
                    case "datetime":
                        node = moment_1.default(value, moment_1.default.ISO_8601).format("lll");
                        break;
                    case "image":
                        node = this.renderImage(value.id);
                        break;
                    case "imagelist":
                        node = lodash_1.default.map(value, (v) => this.renderImage(v.id));
                        break;
                    default:
                        node = "" + value;
                }
            }
        }
        return R(fixed_data_table_2_1.Cell, {
            width: this.props.width,
            height: this.props.height,
            onClick: this.props.onClick,
            style: {
                whiteSpace: "nowrap",
                textAlign: ["number"].includes(this.props.exprType) ? "right" : "left",
                opacity: this.props.muted ? 0.4 : undefined
            }
        }, node);
    }
}
exports.default = ExprCellComponent;

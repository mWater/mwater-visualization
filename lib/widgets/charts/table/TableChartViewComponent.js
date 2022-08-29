"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const moment_1 = __importDefault(require("moment"));
const react_linkify_1 = __importDefault(require("react-linkify"));
const AxisBuilder_1 = __importDefault(require("../../../axes/AxisBuilder"));
const mwater_expressions_1 = require("mwater-expressions");
const valueFormatter_1 = require("../../../valueFormatter");
class TableChartViewComponent extends react_1.default.Component {
    shouldComponentUpdate(prevProps) {
        return !lodash_1.default.isEqual(prevProps, this.props);
    }
    render() {
        const style = {
            width: this.props.width,
            height: this.props.height
        };
        return R("div", { style, className: "overflow-auto-except-print" }, R("div", { style: { fontWeight: "bold", textAlign: "center" } }, this.props.design.titleText), R(TableContentsComponent, {
            columns: this.props.design.columns,
            table: this.props.design.table,
            data: this.props.data,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onRowClick: this.props.onRowClick
        }));
    }
}
exports.default = TableChartViewComponent;
class TableContentsComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleRowClick = (rowIndex) => {
            const row = this.props.data.main[rowIndex];
            if (row && row.id && this.props.onRowClick) {
                return this.props.onRowClick(this.props.table, row.id);
            }
        };
    }
    shouldComponentUpdate(prevProps) {
        if (prevProps.columns !== this.props.columns && !lodash_1.default.isEqual(prevProps.columns, this.props.columns)) {
            return true;
        }
        if (prevProps.data !== this.props.data && !lodash_1.default.isEqual(prevProps.data, this.props.data)) {
            return true;
        }
        if (prevProps.schema !== this.props.schema) {
            return true;
        }
        return false;
    }
    renderHeaderCell(index) {
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        const column = this.props.columns[index];
        const text = column.headerText || axisBuilder.summarizeAxis(column.textAxis, this.context.locale);
        return R("th", { key: index }, text);
    }
    renderHeader() {
        return R("thead", { key: "head" }, R("tr", { key: "head" }, lodash_1.default.map(this.props.columns, (column, i) => this.renderHeaderCell(i))));
    }
    renderImage(id) {
        const url = this.props.dataSource.getImageUrl(id);
        return R("a", { href: url, key: id, target: "_blank", style: { paddingLeft: 5, paddingRight: 5 } }, "Image");
    }
    renderCell(rowIndex, columnIndex) {
        var _a, _b;
        let node;
        const row = this.props.data.main[rowIndex];
        const column = this.props.columns[columnIndex];
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const exprType = exprUtils.getExprType((_a = column.textAxis) === null || _a === void 0 ? void 0 : _a.expr);
        // Get value
        let value = row[`c${columnIndex}`];
        if (value == null) {
            node = null;
        }
        else {
            // Parse if should be JSON
            if (["image", "imagelist", "geometry", "text[]"].includes(exprType || "") && lodash_1.default.isString(value)) {
                value = JSON.parse(value);
            }
            // Convert to node based on type
            switch (exprType) {
                case "text":
                    node = R(react_linkify_1.default, { properties: { target: "_blank" } }, value);
                    break;
                case "number":
                case "geometry":
                    node = valueFormatter_1.formatValue(exprType, value, column.format);
                    break;
                case "boolean":
                case "enum":
                case "enumset":
                case "text[]":
                    node = exprUtils.stringifyExprLiteral((_b = column.textAxis) === null || _b === void 0 ? void 0 : _b.expr, value, this.context.locale);
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
        return R("td", { key: columnIndex }, node);
    }
    renderRow(index) {
        return R("tr", { key: index, onClick: this.handleRowClick.bind(null, index) }, lodash_1.default.map(this.props.columns, (column, i) => this.renderCell(index, i)));
    }
    renderBody() {
        return R("tbody", { key: "body" }, lodash_1.default.map(this.props.data.main, (row, i) => this.renderRow(i)));
    }
    render() {
        return R("table", { className: "table table-sm table-hover", style: { fontSize: "10pt", marginBottom: 0 } }, this.renderHeader(), this.renderBody());
    }
}
TableContentsComponent.contextTypes = { locale: prop_types_1.default.string };

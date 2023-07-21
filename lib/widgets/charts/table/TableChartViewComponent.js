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
const color_1 = __importDefault(require("color"));
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
    constructor(props) {
        super(props);
        this.sortData = () => {
            if (!this.state.sort)
                return this.props.data.main;
            return lodash_1.default.sortByOrder(this.props.data.main, [`c${this.state.sort.column}`], [this.state.sort.direction]);
        };
        this.handleRowClick = (rowIndex) => {
            const row = this.state.data[rowIndex];
            if (row && row.id && this.props.onRowClick) {
                return this.props.onRowClick(this.props.table, row.id);
            }
        };
        this.handleSort = (colIndex) => {
            var _a, _b;
            const currentSort = ((_a = this.state.sort) === null || _a === void 0 ? void 0 : _a.column) === colIndex ? (_b = this.state.sort) === null || _b === void 0 ? void 0 : _b.direction : null;
            this.setState({
                sort: {
                    column: colIndex,
                    direction: currentSort === "asc" ? "desc" : "asc"
                }
            });
        };
        this.state = {
            sort: null,
            data: props.data.main
        };
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.setState({ data: this.sortData() });
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.columns !== this.props.columns && !lodash_1.default.isEqual(nextProps.columns, this.props.columns)) {
            return true;
        }
        if (nextProps.data !== this.props.data && !lodash_1.default.isEqual(nextProps.data, this.props.data)) {
            return true;
        }
        if (nextProps.schema !== this.props.schema) {
            return true;
        }
        if (nextProps.schema !== this.props.schema) {
            return true;
        }
        if (nextState.sort !== this.state.sort) {
            return true;
        }
        if (nextState.data !== this.state.data && !lodash_1.default.isEqual(nextState.data, this.state.data)) {
            return true;
        }
        return false;
    }
    renderHeaderCell(index) {
        var _a, _b, _c;
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        const column = this.props.columns[index];
        //(this.state.sort?.direction === 'asc' ? "":"")
        const text = (_a = column.headerText) !== null && _a !== void 0 ? _a : (column.textAxis ? axisBuilder.summarizeAxis(column.textAxis, this.context.locale) : "");
        return R("th", {
            key: index,
            style: { cursor: "pointer" },
            onClick: () => this.handleSort(index)
        }, text, ((_b = this.state.sort) === null || _b === void 0 ? void 0 : _b.column) === index
            ? R("span", {
                style: { marginLeft: 10 },
                className: `fa ${((_c = this.state.sort) === null || _c === void 0 ? void 0 : _c.direction) === "asc" ? "fa-sort-asc" : "fa-sort-desc"}`
            })
            : undefined);
    }
    renderHeader() {
        return R("thead", { key: "head" }, R("tr", { key: "head" }, lodash_1.default.map(this.props.columns, (column, i) => this.renderHeaderCell(i))));
    }
    renderFooterCell(index) {
        var _a;
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const column = this.props.columns[index];
        if (!column.textAxis)
            return null;
        const exprType = exprUtils.getExprType((_a = column.textAxis) === null || _a === void 0 ? void 0 : _a.expr);
        let node = null;
        if (exprType && exprType == "number") {
            node = `${lodash_1.default.capitalize(column.summaryType)}: ${(0, valueFormatter_1.formatValue)(exprType, this.props.data.summary[`c${index}`], column.format)}`;
        }
        return node;
    }
    renderFooter() {
        if (!this.props.data.summary) {
            return null;
        }
        return R("tfoot", { key: "foot" }, R("tr", { key: "foot" }, lodash_1.default.map(this.props.columns, (column, i) => R("th", { key: i }, this.renderFooterCell(i)))));
    }
    renderImage(id) {
        const url = this.props.dataSource.getImageUrl(id);
        return R("a", { href: url, key: id, target: "_blank", style: { paddingLeft: 5, paddingRight: 5 } }, "Image");
    }
    renderCell(rowIndex, columnIndex) {
        var _a, _b;
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        let node;
        const row = this.state.data[rowIndex];
        const column = this.props.columns[columnIndex];
        // Set background color
        let backgroundColor = "transparent";
        let textColor = "#212529";
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        if (!column.textAxis) {
            node = null;
        }
        else {
            const exprType = exprUtils.getExprType(column.textAxis.expr);
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
                if (column.backgroundColorAxis && row[`bc${columnIndex}`] != null) {
                    backgroundColor = (_a = axisBuilder.getValueColor(column.backgroundColorAxis, row[`bc${columnIndex}`])) !== null && _a !== void 0 ? _a : "#fff";
                }
                // Convert to node based on type
                switch (exprType) {
                    case "text":
                        node = R(react_linkify_1.default, { properties: { target: "_blank" } }, value);
                        break;
                    case "number":
                    case "geometry":
                        node = (0, valueFormatter_1.formatValue)(exprType, value, column.format);
                        break;
                    case "boolean":
                    case "enum":
                    case "enumset":
                    case "text[]":
                        node = exprUtils.stringifyExprLiteral((_b = column.textAxis) === null || _b === void 0 ? void 0 : _b.expr, value, this.context.locale);
                        break;
                    case "date":
                        node = (0, moment_1.default)(value, "YYYY-MM-DD").format("ll");
                        break;
                    case "datetime":
                        node = (0, moment_1.default)(value, moment_1.default.ISO_8601).format("lll");
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
        if (backgroundColor) {
            const c = (0, color_1.default)(backgroundColor);
            // Get lightness (taking into account alpha)
            const lightness = 1 - (1 - c.luminosity()) * c.alpha();
            textColor = lightness < 0.3 ? "rgb(204,204,204)" : "#212529";
        }
        return R("td", { key: columnIndex, style: { backgroundColor, color: textColor } }, node);
    }
    renderRow(index) {
        return R("tr", { key: index, onClick: this.handleRowClick.bind(null, index) }, lodash_1.default.map(this.props.columns, (column, i) => this.renderCell(index, i)));
    }
    renderBody() {
        return R("tbody", { key: "body" }, lodash_1.default.map(this.state.data, (row, i) => this.renderRow(i)));
    }
    render() {
        return R("table", { className: "mwater-visualization-table", style: { fontSize: "10pt", marginBottom: 0 } }, this.renderHeader(), this.renderBody(), this.renderFooter());
    }
}
TableContentsComponent.contextTypes = { locale: prop_types_1.default.string };

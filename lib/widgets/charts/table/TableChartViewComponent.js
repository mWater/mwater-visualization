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
    static initClass() {
        this.contextTypes = { locale: prop_types_1.default.string };
        // e.g. "en"
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
            if (["image", "imagelist", "geometry", "text[]"].includes(exprType) && lodash_1.default.isString(value)) {
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
        return R("table", { className: "table table-condensed table-hover", style: { fontSize: "10pt", marginBottom: 0 } }, this.renderHeader(), this.renderBody());
    }
}
TableContentsComponent.initClass();
//   renderHeaderCell: (index) ->
//     axisBuilder = new AxisBuilder(schema: @props.schema)
//     column = @props.design.columns[index]
//     text = column.headerText or axisBuilder.summarizeAxis(column.textAxis, @context.locale)
//     R 'th', {key: index},
//       text
//   renderHeader: ->
//     R 'thead', null,
//       R 'tr', { style: { position: "relative"}, ref: "tableHeader"},
//         _.map(@props.design.columns, (column, i) => @renderHeaderCell(i))
//   renderCell: (rowIndex, columnIndex) ->
//     row = @props.data.main[rowIndex]
//     column = @props.design.columns[columnIndex]
//     # Get value
//     value = row["c#{columnIndex}"]
//     # Convert to string
//     axisBuilder = new AxisBuilder(schema: @props.schema)
//     str = axisBuilder.formatValue(column.textAxis, value, @context.locale)
//     return R('td', key: columnIndex, str)
//   renderRow: (index) ->
//     R 'tr', key: index,
//       _.map(@props.design.columns, (column, i) => @renderCell(index, i))
//   componentDidUpdate: (prevProps, prevState) ->
//     @calculateHeadersWidth()
//   componentDidMount: ->
//     @calculateHeadersWidth()
//   calculateHeadersWidth: ->
//     tr = $(@refs.tableBody).find("tr").first()
//     headers = $(@refs.tableHeader).find("th")
//     body = $(@refs.tableBody)
//     bodyContainer = $(@refs.tableBodyContainer)
//     tr.find("td").each (i, el) =>
//       cellWIdth = $(el).width()
//       headers.eq(i).width(cellWIdth)
//       if headers.eq(i).width() != cellWIdth
//         @setColumnWidth(i, headers.eq(i).width())
//     height = @props.height - $(@refs.title).outerHeight() - $(@refs.tableHeader).outerHeight()
//     bodyContainer.height(height)
//   setColumnWidth: (column,width) ->
//     body = $(@refs.tableBody)
//     body.find('tr').each (i, el) ->
//       $(el).find('td').eq(column).width(width)
//   renderBody: ->
// #    height = @props.height - $(@refs.title).outerHeight()
// #    tbodyStyle =
//     R 'tbody', { ref: "tableBody"},
//       _.map(@props.data.main, (row, i) => @renderRow(i))
//   shouldComponentUpdate: (prevProps) ->
//     not _.isEqual(prevProps, @props)
//   render: ->
//     style = {
//       width: @props.width
//       height: @props.height
//     }
//     containerStyle =
//       overflow: "auto"
//       height: height
//     height = @props.height - $(@refs.title).outerHeight() - 25
//     return R 'div', style: style, className: "overflow-auto-except-print",
//       R 'div', {style: { fontWeight: "bold", textAlign: "center" }, ref: "title"}, @props.design.titleText
//       R 'table', className: "table table-condensed table-hover", style: { fontSize: "10pt", marginBottom: 0 },
//         @renderHeader()
//       R 'div', {ref: "tableBodyContainer", style: containerStyle},
//         R 'table', className: "table table-condensed table-hover", style: { fontSize: "10pt" },
//           @renderBody()

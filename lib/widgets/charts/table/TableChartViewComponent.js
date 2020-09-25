"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var $,
    AxisBuilder,
    ExprUtils,
    Linkify,
    PropTypes,
    R,
    React,
    TableChartViewComponent,
    TableContentsComponent,
    _,
    formatValue,
    moment,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

$ = require('jquery');
PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
moment = require('moment');
Linkify = require('react-linkify')["default"];
AxisBuilder = require('../../../axes/AxisBuilder');
ExprUtils = require('mwater-expressions').ExprUtils;
formatValue = require('../../../valueFormatter').formatValue;

module.exports = TableChartViewComponent = function () {
  var TableChartViewComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(TableChartViewComponent, _React$Component);

    var _super = _createSuper(TableChartViewComponent);

    function TableChartViewComponent() {
      (0, _classCallCheck2["default"])(this, TableChartViewComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(TableChartViewComponent, [{
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(prevProps) {
        return !_.isEqual(prevProps, this.props);
      }
    }, {
      key: "render",
      value: function render() {
        var style; // Render in a standard width container and then scale up to ensure that widget always looks consistent

        style = {
          width: this.props.standardWidth,
          height: this.props.height * (this.props.standardWidth / this.props.width),
          transform: "scale(".concat(this.props.width / this.props.standardWidth, ", ").concat(this.props.width / this.props.standardWidth, ")"),
          transformOrigin: "0 0"
        };
        return R('div', {
          style: style,
          className: "overflow-auto-except-print"
        }, R('div', {
          style: {
            fontWeight: "bold",
            textAlign: "center"
          }
        }, this.props.design.titleText), R(TableContentsComponent, {
          columns: this.props.design.columns,
          table: this.props.design.table,
          data: this.props.data,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onRowClick: this.props.onRowClick
        }));
      }
    }]);
    return TableChartViewComponent;
  }(React.Component);

  ;
  TableChartViewComponent.propTypes = {
    design: PropTypes.object.isRequired,
    // Design of chart
    data: PropTypes.object.isRequired,
    // Data that the table has requested
    schema: PropTypes.object.isRequired,
    // Schema to use
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number,
    scope: PropTypes.any,
    // scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: PropTypes.func,
    // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
    onRowClick: PropTypes.func // Called with (tableId, rowId) when item is clicked

  };
  return TableChartViewComponent;
}.call(void 0);

TableContentsComponent = function () {
  var TableContentsComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(TableContentsComponent, _React$Component2);

    var _super2 = _createSuper(TableContentsComponent);

    function TableContentsComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, TableContentsComponent);
      _this = _super2.apply(this, arguments);
      _this.handleRowClick = _this.handleRowClick.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(TableContentsComponent, [{
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(prevProps) {
        if (prevProps.columns !== this.props.columns && !_.isEqual(prevProps.columns, this.props.columns)) {
          return true;
        }

        if (prevProps.data !== this.props.data && !_.isEqual(prevProps.data, this.props.data)) {
          return true;
        }

        if (prevProps.schema !== this.props.schema) {
          return true;
        }

        return false;
      }
    }, {
      key: "handleRowClick",
      value: function handleRowClick(rowIndex) {
        var row;
        boundMethodCheck(this, TableContentsComponent);
        row = this.props.data.main[rowIndex];

        if (row && row.id && this.props.onRowClick) {
          return this.props.onRowClick(this.props.table, row.id);
        }
      }
    }, {
      key: "renderHeaderCell",
      value: function renderHeaderCell(index) {
        var axisBuilder, column, text;
        axisBuilder = new AxisBuilder({
          schema: this.props.schema
        });
        column = this.props.columns[index];
        text = column.headerText || axisBuilder.summarizeAxis(column.textAxis, this.context.locale);
        return R('th', {
          key: index
        }, text);
      }
    }, {
      key: "renderHeader",
      value: function renderHeader() {
        var _this2 = this;

        return R('thead', {
          key: "head"
        }, R('tr', {
          key: "head"
        }, _.map(this.props.columns, function (column, i) {
          return _this2.renderHeaderCell(i);
        })));
      }
    }, {
      key: "renderImage",
      value: function renderImage(id) {
        var url;
        url = this.props.dataSource.getImageUrl(id);
        return R('a', {
          href: url,
          key: id,
          target: "_blank",
          style: {
            paddingLeft: 5,
            paddingRight: 5
          }
        }, "Image");
      }
    }, {
      key: "renderCell",
      value: function renderCell(rowIndex, columnIndex) {
        var _this3 = this;

        var column, exprType, exprUtils, node, ref, ref1, row, value;
        row = this.props.data.main[rowIndex];
        column = this.props.columns[columnIndex];
        exprUtils = new ExprUtils(this.props.schema);
        exprType = exprUtils.getExprType((ref = column.textAxis) != null ? ref.expr : void 0); // Get value

        value = row["c".concat(columnIndex)];

        if (value == null) {
          node = null;
        } else {
          // Parse if should be JSON
          if ((exprType === 'image' || exprType === 'imagelist' || exprType === 'geometry' || exprType === 'text[]') && _.isString(value)) {
            value = JSON.parse(value);
          } // Convert to node based on type


          switch (exprType) {
            case "text":
              node = R(Linkify, {
                properties: {
                  target: '_blank'
                }
              }, value);
              break;

            case "number":
            case "geometry":
              node = formatValue(exprType, value, column.format);
              break;

            case "boolean":
            case "enum":
            case "enumset":
            case "text[]":
              node = exprUtils.stringifyExprLiteral((ref1 = column.textAxis) != null ? ref1.expr : void 0, value, this.context.locale);
              break;

            case "date":
              node = moment(value, "YYYY-MM-DD").format("ll");
              break;

            case "datetime":
              node = moment(value, moment.ISO_8601).format("lll");
              break;

            case "image":
              node = this.renderImage(value.id);
              break;

            case "imagelist":
              node = _.map(value, function (v) {
                return _this3.renderImage(v.id);
              });
              break;

            default:
              node = "" + value;
          }
        }

        return R('td', {
          key: columnIndex
        }, node);
      }
    }, {
      key: "renderRow",
      value: function renderRow(index) {
        var _this4 = this;

        return R('tr', {
          key: index,
          onClick: this.handleRowClick.bind(null, index)
        }, _.map(this.props.columns, function (column, i) {
          return _this4.renderCell(index, i);
        }));
      }
    }, {
      key: "renderBody",
      value: function renderBody() {
        var _this5 = this;

        return R('tbody', {
          key: "body"
        }, _.map(this.props.data.main, function (row, i) {
          return _this5.renderRow(i);
        }));
      }
    }, {
      key: "render",
      value: function render() {
        return R('table', {
          className: "table table-condensed table-hover",
          style: {
            fontSize: "10pt",
            marginBottom: 0
          }
        }, this.renderHeader(), this.renderBody());
      }
    }]);
    return TableContentsComponent;
  }(React.Component);

  ;
  TableContentsComponent.propTypes = {
    columns: PropTypes.array.isRequired,
    // Columns of chart
    data: PropTypes.object.isRequired,
    // Data that the table has requested
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // Data source to use
    table: PropTypes.string.isRequired,
    onRowClick: PropTypes.func // Called with (tableId, rowId) when item is clicked

  };
  TableContentsComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return TableContentsComponent;
}.call(void 0); //   renderHeaderCell: (index) ->
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
//     height = @props.height * (@props.standardWidth / @props.width) - $(@refs.title).outerHeight() - $(@refs.tableHeader).outerHeight()
//     bodyContainer.height(height)
//   setColumnWidth: (column,width) ->
//     body = $(@refs.tableBody)
//     body.find('tr').each (i, el) ->
//       $(el).find('td').eq(column).width(width)
//   renderBody: ->
// #    height = @props.height * (@props.standardWidth / @props.width) - $(@refs.title).outerHeight()
// #    tbodyStyle =
//     R 'tbody', { ref: "tableBody"},
//       _.map(@props.data.main, (row, i) => @renderRow(i))
//   shouldComponentUpdate: (prevProps) ->
//     not _.isEqual(prevProps, @props)
//   render: ->
//     # Render in a standard width container and then scale up to ensure that widget always looks consistent
//     style = {
//       width: @props.standardWidth
//       height: @props.height * (@props.standardWidth / @props.width)
//       transform: "scale(#{@props.width/@props.standardWidth}, #{@props.width/@props.standardWidth})"
//       transformOrigin: "0 0"
//       overflow: 'hidden'
//     }
//     containerStyle =
//       overflow: "auto"
//       height: height
//     height = @props.height * (@props.standardWidth / @props.width) - $(@refs.title).outerHeight() - 25
//     return R 'div', style: style, className: "overflow-auto-except-print",
//       R 'div', {style: { fontWeight: "bold", textAlign: "center" }, ref: "title"}, @props.design.titleText
//       R 'table', className: "table table-condensed table-hover", style: { fontSize: "10pt", marginBottom: 0 },
//         @renderHeader()
//       R 'div', {ref: "tableBodyContainer", style: containerStyle},
//         R 'table', className: "table table-condensed table-hover", style: { fontSize: "10pt" },
//           @renderBody()
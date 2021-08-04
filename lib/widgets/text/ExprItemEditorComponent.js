"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ExprComponent,
    ExprItemEditorComponent,
    ExprUtils,
    PropTypes,
    R,
    React,
    TableSelectComponent,
    _,
    getDefaultFormat,
    getFormatOptions,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ExprUtils = require("mwater-expressions").ExprUtils;
ExprComponent = require("mwater-expressions-ui").ExprComponent;
TableSelectComponent = require('../../TableSelectComponent');
getFormatOptions = require('../../valueFormatter').getFormatOptions;
getDefaultFormat = require('../../valueFormatter').getDefaultFormat; // Expression editor that allows changing an expression item

module.exports = ExprItemEditorComponent = function () {
  var ExprItemEditorComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(ExprItemEditorComponent, _React$Component);

    var _super = _createSuper(ExprItemEditorComponent);

    function ExprItemEditorComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, ExprItemEditorComponent);
      var ref;
      _this = _super.call(this, props);
      _this.handleTableChange = _this.handleTableChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleExprChange = _this.handleExprChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleIncludeLabelChange = _this.handleIncludeLabelChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleLabelTextChange = _this.handleLabelTextChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFormatChange = _this.handleFormatChange.bind((0, _assertThisInitialized2["default"])(_this)); // Keep table in state as it can be set before the expression

      _this.state = {
        table: ((ref = props.exprItem.expr) != null ? ref.table : void 0) || props.singleRowTable
      };
      return _this;
    }

    (0, _createClass2["default"])(ExprItemEditorComponent, [{
      key: "handleTableChange",
      value: function handleTableChange(table) {
        boundMethodCheck(this, ExprItemEditorComponent);
        return this.setState({
          table: table
        });
      }
    }, {
      key: "handleExprChange",
      value: function handleExprChange(expr) {
        var exprItem;
        boundMethodCheck(this, ExprItemEditorComponent);
        exprItem = _.extend({}, this.props.exprItem, {
          expr: expr
        });
        return this.props.onChange(exprItem);
      }
    }, {
      key: "handleIncludeLabelChange",
      value: function handleIncludeLabelChange(ev) {
        var exprItem;
        boundMethodCheck(this, ExprItemEditorComponent);
        exprItem = _.extend({}, this.props.exprItem, {
          includeLabel: ev.target.checked,
          labelText: ev.target.checked ? this.props.exprItem.labelText : void 0
        });
        return this.props.onChange(exprItem);
      }
    }, {
      key: "handleLabelTextChange",
      value: function handleLabelTextChange(ev) {
        var exprItem;
        boundMethodCheck(this, ExprItemEditorComponent);
        exprItem = _.extend({}, this.props.exprItem, {
          labelText: ev.target.value || null
        });
        return this.props.onChange(exprItem);
      }
    }, {
      key: "handleFormatChange",
      value: function handleFormatChange(ev) {
        var exprItem;
        boundMethodCheck(this, ExprItemEditorComponent);
        exprItem = _.extend({}, this.props.exprItem, {
          format: ev.target.value || null
        });
        return this.props.onChange(exprItem);
      }
    }, {
      key: "renderFormat",
      value: function renderFormat() {
        var exprType, exprUtils, formats;
        exprUtils = new ExprUtils(this.props.schema);
        exprType = exprUtils.getExprType(this.props.exprItem.expr);
        formats = getFormatOptions(exprType);

        if (!formats) {
          return null;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Format"), ": ", R('select', {
          value: this.props.exprItem.format != null ? this.props.exprItem.format : getDefaultFormat(exprType),
          className: "form-control",
          style: {
            width: "auto",
            display: "inline-block"
          },
          onChange: this.handleFormatChange
        }, _.map(formats, function (format) {
          return R('option', {
            key: format.value,
            value: format.value
          }, format.label);
        })));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            paddingBottom: 200
          }
        }, R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('i', {
          className: "fa fa-database"
        }), " ", "Data Source"), ": ", R(TableSelectComponent, {
          schema: this.props.schema,
          value: this.state.table,
          onChange: this.handleTableChange
        }), R('br')), this.state.table ? R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Field"), ": ", R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.state.table,
          types: ['text', 'number', 'enum', 'date', 'datetime', 'boolean', 'enumset', 'geometry'],
          value: this.props.exprItem.expr,
          aggrStatuses: ["individual", "literal", "aggregate"],
          onChange: this.handleExprChange
        })) : void 0, this.state.table && this.props.exprItem.expr ? R('div', {
          className: "form-group"
        }, R('label', {
          key: "includeLabel"
        }, R('input', {
          type: "checkbox",
          checked: this.props.exprItem.includeLabel,
          onChange: this.handleIncludeLabelChange
        }), " Include Label"), this.props.exprItem.includeLabel ? R('input', {
          key: "labelText",
          className: "form-control",
          type: "text",
          value: this.props.exprItem.labelText || "",
          onChange: this.handleLabelTextChange,
          placeholder: new ExprUtils(this.props.schema).summarizeExpr(this.props.exprItem.expr) + ": "
        }) : void 0) : void 0, this.renderFormat());
      }
    }]);
    return ExprItemEditorComponent;
  }(React.Component);

  ;
  ExprItemEditorComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    exprItem: PropTypes.object.isRequired,
    // Expression item to edit
    onChange: PropTypes.func.isRequired,
    // Called with expr item 
    singleRowTable: PropTypes.string // Table that is filtered to have one row

  };
  return ExprItemEditorComponent;
}.call(void 0);
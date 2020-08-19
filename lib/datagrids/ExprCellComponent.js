"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Cell,
    ExprCellComponent,
    ExprUtils,
    Linkify,
    PropTypes,
    R,
    React,
    _,
    canFormatType,
    formatValue,
    moment,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
moment = require('moment');
ExprUtils = require("mwater-expressions").ExprUtils;
Linkify = require('react-linkify')["default"];
Cell = require('fixed-data-table-2').Cell;
canFormatType = require('../valueFormatter').canFormatType;
formatValue = require('../valueFormatter').formatValue; // Cell that displays an expression column cell

module.exports = ExprCellComponent = function () {
  var ExprCellComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(ExprCellComponent, _React$Component);

    var _super = _createSuper(ExprCellComponent);

    function ExprCellComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, ExprCellComponent);
      _this = _super.apply(this, arguments);
      _this.handleClick = _this.handleClick.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(ExprCellComponent, [{
      key: "handleClick",
      value: function handleClick() {
        boundMethodCheck(this, ExprCellComponent);
        return this.setState({
          editing: true
        });
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
      key: "render",
      value: function render() {
        var _this2 = this;

        var exprUtils, node, ref, ref1, value;
        exprUtils = new ExprUtils(this.props.schema);
        value = this.props.value;

        if (value == null || !this.props.expr) {
          node = null;
        } else {
          // Parse if should be JSON
          if (((ref = this.props.exprType) === 'image' || ref === 'imagelist' || ref === 'geometry' || ref === 'text[]') && _.isString(value)) {
            value = JSON.parse(value);
          } // Format if possible


          if (canFormatType(this.props.exprType)) {
            node = formatValue(this.props.exprType, value, this.props.format);
          } else {
            // Convert to node based on type
            switch (this.props.exprType) {
              case "text":
                node = R(Linkify, null, value);
                break;

              case "boolean":
              case "enum":
              case "enumset":
              case "text[]":
                node = exprUtils.stringifyExprLiteral(this.props.expr, value, this.props.locale);
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
                  return _this2.renderImage(v.id);
                });
                break;

              default:
                node = "" + value;
            }
          }
        }

        return R(Cell, {
          width: this.props.width,
          height: this.props.height,
          onClick: this.props.onClick,
          style: {
            whiteSpace: "nowrap",
            textAlign: (ref1 = this.props.exprType) === 'number' ? "right" : "left",
            opacity: this.props.muted ? 0.4 : void 0
          }
        }, node);
      }
    }]);
    return ExprCellComponent;
  }(React.Component);

  ;
  ExprCellComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // dataSource to use
    locale: PropTypes.string,
    // Locale to use
    exprType: PropTypes.string,
    format: PropTypes.string,
    // Optional format
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    value: PropTypes.any,
    expr: PropTypes.object,
    muted: PropTypes.bool,
    // True to show muted
    onClick: PropTypes.func
  };
  return ExprCellComponent;
}.call(void 0);
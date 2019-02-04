"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var ActionCancelModalComponent, ExprComponent, ExprItemEditorComponent, ExprUpdateModalComponent, ExprUtils, PropTypes, R, React, TableSelectComponent;
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
ExprUtils = require("mwater-expressions").ExprUtils;
ExprComponent = require("mwater-expressions-ui").ExprComponent;
ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent");
TableSelectComponent = require('../../TableSelectComponent');
ExprItemEditorComponent = require('./ExprItemEditorComponent'); // Modal that displays an expression builder for updating an expression

module.exports = ExprUpdateModalComponent = function () {
  var ExprUpdateModalComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(ExprUpdateModalComponent, _React$Component);

    function ExprUpdateModalComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, ExprUpdateModalComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ExprUpdateModalComponent).call(this, props));
      _this.state = {
        open: false,
        exprItem: null,
        onUpdate: null
      };
      return _this;
    }

    (0, _createClass2.default)(ExprUpdateModalComponent, [{
      key: "open",
      value: function open(item, onUpdate) {
        return this.setState({
          open: true,
          exprItem: item,
          onUpdate: onUpdate
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        if (!this.state.open) {
          return null;
        }

        return R(ActionCancelModalComponent, {
          actionLabel: "Update",
          onAction: function onAction() {
            // Close first to avoid strange effects when mixed with pojoviews
            return _this2.setState({
              open: false
            }, function () {
              return _this2.state.onUpdate(_this2.state.exprItem);
            });
          },
          onCancel: function onCancel() {
            return _this2.setState({
              open: false
            });
          },
          title: "Update Field"
        }, R(ExprItemEditorComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          exprItem: this.state.exprItem,
          onChange: function onChange(exprItem) {
            return _this2.setState({
              exprItem: exprItem
            });
          },
          singleRowTable: this.props.singleRowTable
        }));
      }
    }]);
    return ExprUpdateModalComponent;
  }(React.Component);

  ;
  ExprUpdateModalComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    singleRowTable: PropTypes.string // Table that is filtered to have one row

  };
  return ExprUpdateModalComponent;
}.call(void 0);
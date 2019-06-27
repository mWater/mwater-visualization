"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var Cell,
    EditExprCellComponent,
    EnumEditComponent,
    ExprUtils,
    NumberEditComponent,
    PropTypes,
    R,
    React,
    TextEditComponent,
    _,
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
Cell = require('fixed-data-table').Cell; // Cell allows editing an expression column cell
// Store edited value here to prevent slow re-render of entire datagrid

module.exports = EditExprCellComponent = function () {
  var EditExprCellComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(EditExprCellComponent, _React$Component);

    function EditExprCellComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, EditExprCellComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(EditExprCellComponent).call(this, props));
      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        value: props.value
      };
      return _this;
    }

    (0, _createClass2["default"])(EditExprCellComponent, [{
      key: "getValue",
      value: function getValue() {
        return this.state.value;
      } // Check if edit value has changed

    }, {
      key: "hasChanged",
      value: function hasChanged() {
        return !_.isEqual(this.props.value, this.state.value);
      }
    }, {
      key: "handleChange",
      value: function handleChange(value) {
        boundMethodCheck(this, EditExprCellComponent);
        return this.setState({
          value: value
        });
      }
    }, {
      key: "render",
      value: function render() {
        var exprType, exprUtils;
        exprUtils = new ExprUtils(this.props.schema); // Get expression type

        exprType = exprUtils.getExprType(this.props.expr);

        switch (exprType) {
          case "text":
            return R(TextEditComponent, {
              value: this.state.value,
              onChange: this.handleChange,
              onSave: this.props.onSave,
              onCancel: this.props.onCancel
            });

          case "number":
            return R(NumberEditComponent, {
              value: this.state.value,
              onChange: this.handleChange,
              onSave: this.props.onSave,
              onCancel: this.props.onCancel
            });

          case "enum":
            return R(EnumEditComponent, {
              value: this.state.value,
              onChange: this.handleChange,
              enumValues: exprUtils.getExprEnumValues(this.props.expr),
              onSave: this.props.onSave,
              onCancel: this.props.onCancel,
              locale: this.props.locale
            });
        }

        throw new Error("Unsupported type ".concat(exprType, " for editing"));
      }
    }]);
    return EditExprCellComponent;
  }(React.Component);

  ;
  EditExprCellComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // dataSource to use
    locale: PropTypes.string,
    // Locale to use
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    value: PropTypes.any,
    expr: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    // Called when save is requested (e.g. enter in text box)
    onCancel: PropTypes.func.isRequired // Called when cancelled

  };
  return EditExprCellComponent;
}.call(void 0);

TextEditComponent = function () {
  // Simple text box
  var TextEditComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2["default"])(TextEditComponent, _React$Component2);

    function TextEditComponent() {
      (0, _classCallCheck2["default"])(this, TextEditComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TextEditComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(TextEditComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var ref; // Focus when created

        return (ref = this.input) != null ? ref.focus() : void 0;
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        return R('div', {
          style: {
            paddingTop: 3
          }
        }, R('input', {
          ref: function ref(c) {
            return _this2.input = c;
          },
          type: "text",
          className: "form-control",
          value: this.props.value || "",
          onChange: function onChange(ev) {
            return _this2.props.onChange(ev.target.value || null);
          },
          onKeyUp: function onKeyUp(ev) {
            if (ev.keyCode === 27) {
              _this2.props.onCancel();
            }

            if (ev.keyCode === 13) {
              return _this2.props.onSave();
            }
          }
        }));
      }
    }]);
    return TextEditComponent;
  }(React.Component);

  ;
  TextEditComponent.propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    // Called with new value
    onSave: PropTypes.func.isRequired,
    // Called when enter is pressed
    onCancel: PropTypes.func.isRequired // Called when cancelled

  };
  return TextEditComponent;
}.call(void 0);

NumberEditComponent = function () {
  // Simple number box
  var NumberEditComponent =
  /*#__PURE__*/
  function (_React$Component3) {
    (0, _inherits2["default"])(NumberEditComponent, _React$Component3);

    function NumberEditComponent() {
      var _this3;

      (0, _classCallCheck2["default"])(this, NumberEditComponent);
      _this3 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(NumberEditComponent).apply(this, arguments));
      _this3.handleChange = _this3.handleChange.bind((0, _assertThisInitialized2["default"])(_this3));
      return _this3;
    }

    (0, _createClass2["default"])(NumberEditComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var ref; // Focus when created

        return (ref = this.input) != null ? ref.focus() : void 0;
      }
    }, {
      key: "handleChange",
      value: function handleChange(ev) {
        boundMethodCheck(this, NumberEditComponent);

        if (ev.target.value) {
          return this.props.onChange(parseFloat(ev.target.value));
        } else {
          return this.props.onChange(null);
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this4 = this;

        return R('div', {
          style: {
            paddingTop: 3
          }
        }, R('input', {
          ref: function ref(c) {
            return _this4.input = c;
          },
          type: "number",
          step: "any",
          className: "form-control",
          value: this.props.value != null ? this.props.value : "",
          onChange: this.handleChange,
          onKeyUp: function onKeyUp(ev) {
            if (ev.keyCode === 27) {
              _this4.props.onCancel();
            }

            if (ev.keyCode === 13) {
              return _this4.props.onSave();
            }
          }
        }));
      }
    }]);
    return NumberEditComponent;
  }(React.Component);

  ;
  NumberEditComponent.propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    // Called with new value
    onSave: PropTypes.func.isRequired,
    // Called when enter is pressed
    onCancel: PropTypes.func.isRequired // Called when cancelled

  };
  return NumberEditComponent;
}.call(void 0);

EnumEditComponent = function () {
  // Simple enum box
  var EnumEditComponent =
  /*#__PURE__*/
  function (_React$Component4) {
    (0, _inherits2["default"])(EnumEditComponent, _React$Component4);

    function EnumEditComponent() {
      (0, _classCallCheck2["default"])(this, EnumEditComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(EnumEditComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(EnumEditComponent, [{
      key: "render",
      value: function render() {
        var _this5 = this;

        return R('div', {
          style: {
            paddingTop: 3
          }
        }, R('select', {
          value: this.props.value || "",
          onChange: function onChange(ev) {
            return _this5.props.onChange(ev.target.value || null);
          },
          className: "form-control"
        }, R('option', {
          key: "",
          value: ""
        }, ""), _.map(this.props.enumValues, function (ev) {
          return R('option', {
            key: ev.id,
            value: ev.id
          }, ExprUtils.localizeString(ev.name, _this5.props.locale));
        })));
      }
    }]);
    return EnumEditComponent;
  }(React.Component);

  ;
  EnumEditComponent.propTypes = {
    value: PropTypes.any,
    enumValues: PropTypes.array.isRequired,
    locale: PropTypes.string,
    // Locale to use
    onChange: PropTypes.func.isRequired,
    // Called with new value
    onSave: PropTypes.func.isRequired,
    // Called when enter is pressed
    onCancel: PropTypes.func.isRequired // Called when cancelled

  };
  return EnumEditComponent;
}.call(void 0);
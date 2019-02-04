"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AxisBuilder, BinsComponent, ExprUtils, LabeledInlineComponent, NumberInputComponent, PropTypes, R, React, update;
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
update = require('update-object');
ExprUtils = require('mwater-expressions').ExprUtils;
AxisBuilder = require('./AxisBuilder');
NumberInputComponent = require('react-library/lib/NumberInputComponent'); // Allows setting of bins (min, max and number). Computes defaults if not present

module.exports = BinsComponent = function () {
  var BinsComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(BinsComponent, _React$Component);

    function BinsComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, BinsComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(BinsComponent).call(this, props));
      _this.state = {
        guessing: false // True when guessing ranges

      };
      return _this;
    }

    (0, _createClass2.default)(BinsComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        var axisBuilder, exprUtils, minMaxQuery, ref; // Check if computing is needed

        if (this.props.xform.min == null || this.props.xform.max == null) {
          // Only do for individual (not aggregate) expressions
          exprUtils = new ExprUtils(this.props.schema);

          if (exprUtils.getExprAggrStatus(this.props.expr) !== "individual") {
            // Percent is a special case where 0-100
            if (((ref = this.props.expr) != null ? ref.op : void 0) === "percent where") {
              this.props.onChange(update(this.props.xform, {
                min: {
                  $set: 0
                },
                max: {
                  $set: 100
                },
                excludeLower: {
                  $set: true
                },
                excludeUpper: {
                  $set: true
                }
              }));
            }

            return;
          }

          axisBuilder = new AxisBuilder({
            schema: this.props.schema
          }); // Get min and max from a query

          minMaxQuery = axisBuilder.compileBinMinMax(this.props.expr, this.props.expr.table, null, this.props.xform.numBins);
          this.setState({
            guessing: true
          });
          return this.props.dataSource.performQuery(minMaxQuery, function (error, rows) {
            var max, min;

            if (_this2.unmounted) {
              return;
            }

            _this2.setState({
              guessing: false
            });

            if (error) {
              // Ignore
              return;
            }

            if (rows[0].min != null) {
              min = parseFloat(rows[0].min);
              max = parseFloat(rows[0].max);
            }

            return _this2.props.onChange(update(_this2.props.xform, {
              min: {
                $set: min
              },
              max: {
                $set: max
              }
            }));
          });
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        return this.unmounted = true;
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        return R('div', null, R('div', {
          key: "vals"
        }, R(LabeledInlineComponent, {
          key: "min",
          label: "Min:"
        }, R(NumberInputComponent, {
          small: true,
          value: this.props.xform.min,
          onChange: function onChange(v) {
            return _this3.props.onChange(update(_this3.props.xform, {
              min: {
                $set: v
              }
            }));
          }
        })), " ", R(LabeledInlineComponent, {
          key: "max",
          label: "Max:"
        }, R(NumberInputComponent, {
          small: true,
          value: this.props.xform.max,
          onChange: function onChange(v) {
            return _this3.props.onChange(update(_this3.props.xform, {
              max: {
                $set: v
              }
            }));
          }
        })), " ", R(LabeledInlineComponent, {
          key: "numBins",
          label: "# of Bins:"
        }, R(NumberInputComponent, {
          small: true,
          value: this.props.xform.numBins,
          decimal: false,
          onChange: function onChange(v) {
            return _this3.props.onChange(update(_this3.props.xform, {
              numBins: {
                $set: v
              }
            }));
          }
        })), this.state.guessing ? R('i', {
          className: "fa fa-spinner fa-spin"
        }) : this.props.xform.min == null || this.props.xform.max == null || !this.props.xform.numBins ? R('span', {
          className: "text-danger",
          style: {
            paddingLeft: 10
          }
        }, "Min and max are required") : void 0), this.props.xform.min != null && this.props.xform.max != null && this.props.xform.numBins ? R('div', {
          key: "excludes"
        }, R('label', {
          className: "checkbox-inline",
          key: "lower"
        }, R('input', {
          type: "checkbox",
          checked: !this.props.xform.excludeLower,
          onChange: function onChange(ev) {
            return _this3.props.onChange(update(_this3.props.xform, {
              excludeLower: {
                $set: !ev.target.checked
              }
            }));
          }
        }), "Include < ".concat(this.props.xform.min)), R('label', {
          className: "checkbox-inline",
          key: "upper"
        }, R('input', {
          type: "checkbox",
          checked: !this.props.xform.excludeUpper,
          onChange: function onChange(ev) {
            return _this3.props.onChange(update(_this3.props.xform, {
              excludeUpper: {
                $set: !ev.target.checked
              }
            }));
          }
        }), "Include > ".concat(this.props.xform.max))) : void 0);
      }
    }]);
    return BinsComponent;
  }(React.Component);

  ;
  BinsComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    expr: PropTypes.object.isRequired,
    // Expression for computing min/max
    xform: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  return BinsComponent;
}.call(void 0);

LabeledInlineComponent = function LabeledInlineComponent(props) {
  return R('div', {
    style: {
      display: "inline-block"
    }
  }, R('label', {
    className: "text-muted"
  }, props.label), props.children);
};
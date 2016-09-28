var AxisBuilder, BinsComponent, ExprUtils, H, LabeledInlineComponent, NumberInputComponent, R, React, update,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

update = require('update-object');

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('./AxisBuilder');

NumberInputComponent = require('react-library/lib/NumberInputComponent');

module.exports = BinsComponent = (function(superClass) {
  extend(BinsComponent, superClass);

  BinsComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    expr: React.PropTypes.object.isRequired,
    xform: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  function BinsComponent(props) {
    BinsComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      guessing: false
    };
  }

  BinsComponent.prototype.componentDidMount = function() {
    var axisBuilder, exprUtils, minMaxQuery, ref;
    if ((this.props.xform.min == null) || (this.props.xform.max == null)) {
      exprUtils = new ExprUtils(this.props.schema);
      if (exprUtils.getExprAggrStatus(this.props.expr) !== "individual") {
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
      });
      minMaxQuery = axisBuilder.compileBinMinMax(this.props.expr, this.props.expr.table, null, this.props.xform.numBins);
      this.setState({
        guessing: true
      });
      return this.props.dataSource.performQuery(minMaxQuery, (function(_this) {
        return function(error, rows) {
          var max, min;
          if (_this.unmounted) {
            return;
          }
          _this.setState({
            guessing: false
          });
          if (error) {
            return;
          }
          if (rows[0].min != null) {
            min = parseFloat(rows[0].min);
            max = parseFloat(rows[0].max);
          }
          return _this.props.onChange(update(_this.props.xform, {
            min: {
              $set: min
            },
            max: {
              $set: max
            }
          }));
        };
      })(this));
    }
  };

  BinsComponent.prototype.componentWillUnmount = function() {
    return this.unmounted = true;
  };

  BinsComponent.prototype.render = function() {
    return H.div(null, H.div({
      key: "vals"
    }, R(LabeledInlineComponent, {
      key: "min",
      label: "Min:"
    }, R(NumberInputComponent, {
      small: true,
      value: this.props.xform.min,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onChange(update(_this.props.xform, {
            min: {
              $set: v
            }
          }));
        };
      })(this)
    })), " ", R(LabeledInlineComponent, {
      key: "max",
      label: "Max:"
    }, R(NumberInputComponent, {
      small: true,
      value: this.props.xform.max,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onChange(update(_this.props.xform, {
            max: {
              $set: v
            }
          }));
        };
      })(this)
    })), " ", R(LabeledInlineComponent, {
      key: "numBins",
      label: "# of Bins:"
    }, R(NumberInputComponent, {
      small: true,
      value: this.props.xform.numBins,
      decimal: false,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onChange(update(_this.props.xform, {
            numBins: {
              $set: v
            }
          }));
        };
      })(this)
    })), this.state.guessing ? H.i({
      className: "fa fa-spinner fa-spin"
    }) : void 0), (this.props.xform.min != null) && (this.props.xform.max != null) && this.props.xform.numBins ? H.div({
      key: "excludes"
    }, H.label({
      className: "checkbox-inline",
      key: "lower"
    }, H.input({
      type: "checkbox",
      checked: !this.props.xform.excludeLower,
      onChange: (function(_this) {
        return function(ev) {
          return _this.props.onChange(update(_this.props.xform, {
            excludeLower: {
              $set: !ev.target.checked
            }
          }));
        };
      })(this)
    }), "Include < " + this.props.xform.min), H.label({
      className: "checkbox-inline",
      key: "upper"
    }, H.input({
      type: "checkbox",
      checked: !this.props.xform.excludeUpper,
      onChange: (function(_this) {
        return function(ev) {
          return _this.props.onChange(update(_this.props.xform, {
            excludeUpper: {
              $set: !ev.target.checked
            }
          }));
        };
      })(this)
    }), "Include > " + this.props.xform.max)) : void 0);
  };

  return BinsComponent;

})(React.Component);

LabeledInlineComponent = function(props) {
  return H.div({
    style: {
      display: "inline-block"
    }
  }, H.label({
    className: "text-muted"
  }, props.label), props.children);
};

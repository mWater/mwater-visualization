var BarChartViewComponent, ExpressionBuilder, H, React, titleFontSize, titleHeight,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ExpressionBuilder = require('./ExpressionBuilder');

titleFontSize = 14;

titleHeight = 20;

module.exports = BarChartViewComponent = (function(superClass) {
  extend(BarChartViewComponent, superClass);

  function BarChartViewComponent() {
    this.handleDataClick = bind(this.handleDataClick, this);
    this.updateSelected = bind(this.updateSelected, this);
    return BarChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  BarChartViewComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    scope: React.PropTypes.any,
    onScopeChange: React.PropTypes.func
  };

  BarChartViewComponent.prototype.componentDidMount = function() {
    return this.createChart(this.props);
  };

  BarChartViewComponent.prototype.prepareData = function(data) {
    return {
      main: _.map(data.main, (function(_this) {
        return function(row) {
          var copy, key, value;
          copy = {};
          for (key in row) {
            value = row[key];
            if (value == null) {
              copy[key] = "(none)";
            } else {
              copy[key] = value;
            }
          }
          return copy;
        };
      })(this))
    };
  };

  BarChartViewComponent.prototype.createChart = function(props) {
    var el;
    if (this.chart) {
      this.chart.destroy();
    }
    el = React.findDOMNode(this.refs.chart);
    this.chart = c3.generate({
      bindto: el,
      data: {
        type: "bar",
        json: this.prepareData(props.data).main,
        keys: {
          x: "x",
          value: ["y"]
        },
        names: {
          y: 'Value'
        },
        onclick: this.handleDataClick
      },
      legend: {
        hide: true
      },
      grid: {
        focus: {
          show: false
        }
      },
      axis: {
        x: {
          type: 'category'
        }
      },
      size: {
        width: props.width,
        height: props.height - titleHeight
      }
    });
    return this.updateSelected();
  };

  BarChartViewComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (this.props.height !== nextProps.height || this.props.width !== nextProps.width) {
      this.createChart(nextProps);
      return;
    }
    if (!_.isEqual(this.props.data, nextProps.data)) {
      if (this.props.data.main.length !== nextProps.data.main.length) {
        this.createChart(nextProps);
        return;
      }
      this.chart.load({
        json: this.prepareData(nextProps.data).main,
        keys: {
          x: "x",
          value: ["y"]
        },
        names: {
          y: 'Value'
        }
      });
      return this.setState({
        selected: null
      });
    }
  };

  BarChartViewComponent.prototype.updateSelected = function() {
    return d3.select(React.findDOMNode(this.refs.chart)).select(".c3-bars-y").selectAll(".c3-bar").style("opacity", (function(_this) {
      return function(d, i) {
        if (_this.props.scope) {
          if (_this.props.data.main[d.index].x === _this.props.scope) {
            return 1;
          } else {
            return 0.3;
          }
        } else {
          return 1;
        }
      };
    })(this));
  };

  BarChartViewComponent.prototype.handleDataClick = function(d) {
    var expressionBuilder, filter, scope, xExpr;
    scope = this.props.data.main[d.index].x;
    if (scope === this.props.scope) {
      this.props.onScopeChange(null, null);
      return;
    }
    expressionBuilder = new ExpressionBuilder(this.props.schema);
    xExpr = this.props.design.aesthetics.x.expr;
    filter = {
      type: "comparison",
      table: this.props.design.table,
      lhs: xExpr,
      op: "=",
      rhs: {
        type: "literal",
        valueType: expressionBuilder.getExprType(xExpr),
        value: scope
      }
    };
    return this.props.onScopeChange(scope, filter);
  };

  BarChartViewComponent.prototype.componentDidUpdate = function() {
    return this.updateSelected();
  };

  BarChartViewComponent.prototype.componentWillUnmount = function() {
    return this.chart.destroy();
  };

  BarChartViewComponent.prototype.render = function() {
    var titleStyle;
    titleStyle = {
      position: "absolute",
      top: 0,
      width: this.props.width,
      textAlign: "center",
      fontWeight: "bold"
    };
    return H.div(null, H.div({
      style: titleStyle
    }, this.props.design.annotations.title), H.div({
      style: {
        marginTop: titleHeight
      },
      ref: "chart"
    }));
  };

  return BarChartViewComponent;

})(React.Component);

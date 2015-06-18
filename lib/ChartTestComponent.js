var ChartTestComponent, H, React, design,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = ChartTestComponent = (function(superClass) {
  extend(ChartTestComponent, superClass);

  function ChartTestComponent() {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    ChartTestComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      design: design
    };
  }

  ChartTestComponent.prototype.handleDesignChange = function(design) {
    design = this.props.chart.cleanDesign(design);
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
  };

  ChartTestComponent.prototype.render = function() {
    var data;
    data = {
      main: [
        {
          x: "apple",
          y: 4
        }, {
          x: "banana",
          y: 20
        }
      ]
    };
    return H.div({
      className: "row"
    }, H.div({
      className: "col-xs-6"
    }, this.props.chart.createViewElement({
      design: this.state.design,
      data: data,
      width: "100%",
      height: 500
    })), H.div({
      className: "col-xs-6"
    }, this.props.chart.createDesignerElement({
      design: this.state.design,
      onChange: this.handleDesignChange
    })));
  };

  return ChartTestComponent;

})(React.Component);

design = {
  "aesthetics": {
    "x": {
      "expr": {
        "type": "scalar",
        "table": "a",
        "joins": [],
        "expr": {
          "type": "field",
          "table": "a",
          "column": "enum"
        }
      }
    },
    "y": {
      "expr": {
        "type": "scalar",
        "table": "a",
        "joins": [],
        "expr": {
          "type": "field",
          "table": "a",
          "column": "decimal"
        }
      },
      "aggr": "sum"
    }
  },
  "table": "a",
  "filter": {
    "type": "logical",
    "table": "a",
    "op": "and",
    "exprs": [
      {
        "type": "comparison",
        "table": "a",
        "lhs": {
          "type": "scalar",
          "table": "a",
          "joins": [],
          "expr": {
            "type": "field",
            "table": "a",
            "column": "integer"
          }
        },
        "op": "=",
        "rhs": {
          "type": "literal",
          "valueType": "integer",
          "value": 5
        }
      }
    ]
  }
};

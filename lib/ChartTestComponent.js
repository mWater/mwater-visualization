var BarChartComponent, BarChartDesignerComponent, ChartTestComponent, H, barChartData, data, negative_test_data,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

H = React.DOM;

BarChartDesignerComponent = require('./BarChartDesignerComponent');

module.exports = ChartTestComponent = (function(superClass) {
  extend(ChartTestComponent, superClass);

  function ChartTestComponent() {
    ChartTestComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      design: {}
    };
  }

  ChartTestComponent.prototype.render = function() {
    return H.div({
      className: "row"
    }, H.div({
      className: "col-xs-8"
    }, React.createElement(BarChartComponent, {
      width: "100%",
      height: 500
    })), H.div({
      className: "col-xs-4"
    }, React.createElement(BarChartDesignerComponent, {
      schema: this.props.schema,
      value: this.state.design,
      onChange: (function(_this) {
        return function(design) {
          return _this.setState({
            design: design
          });
        };
      })(this)
    })));
  };

  return ChartTestComponent;

})(React.Component);

barChartData = [
  {
    key: "Cumulative Return",
    values: [
      {
        "label": "A",
        "value": 29.765957771107
      }, {
        "label": "B",
        "value": 0
      }, {
        "label": "C",
        "value": 32.807804682612
      }, {
        "label": "D",
        "value": 196.45946739256
      }, {
        "label": "E",
        "value": 0.19434030906893
      }, {
        "label": "F",
        "value": 98.079782601442
      }, {
        "label": "G",
        "value": 13.925743130903
      }, {
        "label": "H",
        "value": 5.1387322875705
      }
    ]
  }
];

data = [
  {
    key: "Asadfsdfa",
    values: [
      {
        x: "apple",
        y: 10
      }, {
        x: "banana",
        y: 20
      }
    ]
  }, {
    key: "sdfsdf",
    values: [
      {
        x: "apple",
        y: 14
      }, {
        x: "banana",
        y: 25
      }
    ]
  }
];

negative_test_data = new d3.range(0, 3).map(function(d, i) {
  return {
    key: 'Stream' + i,
    values: new d3.range(0, 11).map(function(f, j) {
      var ref;
      return {
        y: 10 + Math.random() * 100 * ((ref = Math.floor(Math.random() * 100) % 2) != null ? ref : {
          1: -1
        }),
        x: "X: " + j
      };
    })
  };
});

console.log(_.cloneDeep(negative_test_data));

BarChartComponent = (function(superClass) {
  extend(BarChartComponent, superClass);

  function BarChartComponent() {
    return BarChartComponent.__super__.constructor.apply(this, arguments);
  }

  BarChartComponent.prototype.componentDidMount = function() {
    var el;
    el = React.findDOMNode(this.refs.chart);
    return nv.addGraph((function(_this) {
      return function() {
        var chart;
        chart = nv.models.multiBarChart().stacked(true).showControls(false).duration(250);
        d3.select(el).datum(data).call(chart);
        return ChartTestComponent;
      };
    })(this));
  };

  BarChartComponent.prototype.render = function() {
    return H.div({
      style: {
        width: this.props.width,
        height: this.props.height
      }
    }, H.svg({
      ref: "chart"
    }));
  };

  return BarChartComponent;

})(React.Component);

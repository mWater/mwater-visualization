var ChartWidgetViewComponent, H, QueryDataLoadingComponent, React,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

QueryDataLoadingComponent = require('./../QueryDataLoadingComponent');

module.exports = ChartWidgetViewComponent = (function(superClass) {
  extend(ChartWidgetViewComponent, superClass);

  function ChartWidgetViewComponent() {
    return ChartWidgetViewComponent.__super__.constructor.apply(this, arguments);
  }

  ChartWidgetViewComponent.propTypes = {
    chart: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    scope: React.PropTypes.any,
    filters: React.PropTypes.array,
    onScopeChange: React.PropTypes.func
  };

  ChartWidgetViewComponent.prototype.render = function() {
    var dataSource, design, elemFactory, queries, results;
    design = this.props.chart.cleanDesign(this.props.design);
    results = this.props.chart.validateDesign(design);
    if (!results) {
      elemFactory = (function(_this) {
        return function(data) {
          return _this.props.chart.createViewElement({
            design: design,
            data: data,
            scope: _this.props.scope,
            onScopeChange: _this.props.onScopeChange,
            width: _this.props.width,
            height: _this.props.height
          });
        };
      })(this);
      queries = this.props.chart.createQueries(design, this.props.filters);
    } else {
      elemFactory = null;
    }
    dataSource = (function(_this) {
      return function(queries, cb) {
        return _this.props.dataSource.performQueries(queries, cb);
      };
    })(this);
    return React.createElement(QueryDataLoadingComponent, {
      elemFactory: elemFactory,
      dataSource: dataSource,
      queries: queries
    });
  };

  return ChartWidgetViewComponent;

})(React.Component);

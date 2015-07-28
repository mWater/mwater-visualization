var ChartWidget, ChartWidgetComponent, H, QueryDataLoadingComponent, React, Widget,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

Widget = require('./Widget');

QueryDataLoadingComponent = require('./QueryDataLoadingComponent');

module.exports = ChartWidget = (function(superClass) {
  extend(ChartWidget, superClass);

  function ChartWidget(chart, design, dataSource) {
    this.chart = chart;
    this.design = design;
    this.dataSource = dataSource;
  }

  ChartWidget.prototype.createViewElement = function(options) {
    return React.createElement(ChartWidgetComponent, {
      chart: this.chart,
      dataSource: this.dataSource,
      design: this.design,
      width: options.width,
      height: options.height,
      selected: options.selected,
      onSelect: options.onSelect,
      onRemove: options.onRemove,
      scope: options.scope,
      filters: options.filters,
      onScopeChange: options.onScopeChange
    });
  };

  ChartWidget.prototype.createDesignerElement = function(options) {
    return this.chart.createDesignerElement({
      design: this.design,
      onDesignChange: options.onDesignChange
    });
  };

  return ChartWidget;

})(Widget);

ChartWidgetComponent = (function(superClass) {
  extend(ChartWidgetComponent, superClass);

  function ChartWidgetComponent() {
    this.handleRemoveScope = bind(this.handleRemoveScope, this);
    this.handleRemove = bind(this.handleRemove, this);
    this.handleClick = bind(this.handleClick, this);
    return ChartWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  ChartWidgetComponent.propTypes = {
    chart: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    selected: React.PropTypes.bool,
    onSelect: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    scope: React.PropTypes.any,
    filters: React.PropTypes.array,
    onScopeChange: React.PropTypes.func,
    connectMoveHandle: React.PropTypes.func,
    connectResizeHandle: React.PropTypes.func
  };

  ChartWidgetComponent.prototype.handleClick = function(ev) {
    ev.stopPropagation();
    return this.props.onSelect();
  };

  ChartWidgetComponent.prototype.handleRemove = function(ev) {
    ev.stopPropagation();
    return this.props.onRemove();
  };

  ChartWidgetComponent.prototype.handleRemoveScope = function(ev) {
    ev.stopPropagation();
    return this.props.onScopeChange(null);
  };

  ChartWidgetComponent.prototype.renderResizeHandle = function() {
    var resizeHandleStyle;
    resizeHandleStyle = {
      position: "absolute",
      right: 0,
      bottom: 0,
      backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAB3RJTUUH2AkPCjIF90dj7QAAAAlwSFlzAAAPYQAAD2EBqD+naQAAAARnQU1BAACxjwv8YQUAAABISURBVHjaY2QgABwcHMSBlAETEYpagPgIIxGKCg4cOPCVkZAiIObBajUWRZhW41CEajUuRShWE1AEsZoIRWCrQSbawDh42AwAdwQtJBOblO0AAAAASUVORK5CYII=')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right bottom",
      width: 20,
      height: 20,
      cursor: "nwse-resize"
    };
    if (this.props.connectResizeHandle) {
      return this.props.connectResizeHandle(H.div({
        style: resizeHandleStyle,
        className: "mwater-chart-widget-resize-handle"
      }));
    }
  };

  ChartWidgetComponent.prototype.renderRemoveButton = function() {
    var removeButtonStyle;
    removeButtonStyle = {
      position: "absolute",
      right: 5,
      top: 5,
      cursor: "pointer"
    };
    if (this.props.onRemove) {
      return H.div({
        style: removeButtonStyle,
        className: "mwater-chart-widget-remove-button",
        onClick: this.handleRemove
      }, H.span({
        className: "glyphicon glyphicon-remove"
      }));
    }
  };

  ChartWidgetComponent.prototype.renderChart = function(design, width, height) {
    var dataSource, elemFactory, queries, results;
    design = this.props.chart.cleanDesign(this.props.design);
    results = this.props.chart.validateDesign(design);
    if (!results) {
      elemFactory = (function(_this) {
        return function(data) {
          return _this.props.chart.createViewElement({
            design: design,
            data: data,
            width: width,
            height: height,
            scope: _this.props.scope,
            onScopeChange: _this.props.onScopeChange
          });
        };
      })(this);
      queries = this.props.chart.createQueries(this.props.design, this.props.filters);
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

  ChartWidgetComponent.prototype.render = function() {
    var contents, elem, style;
    style = {
      width: this.props.width,
      height: this.props.height,
      padding: 10
    };
    if (this.props.selected) {
      style.border = "dashed 2px #AAA";
    }
    contents = H.div({
      style: {
        position: "absolute",
        left: 10,
        top: 10
      }
    }, this.renderChart(this.props.design, this.props.width - 20, this.props.height - 20));
    elem = H.div({
      className: "mwater-chart-widget",
      style: style,
      onClick: this.handleClick
    }, contents, this.renderResizeHandle(), this.renderRemoveButton());
    if (this.props.connectMoveHandle) {
      elem = this.props.connectMoveHandle(elem);
    }
    return elem;
  };

  return ChartWidgetComponent;

})(React.Component);

var ChartWidget, ChartWidgetComponent, H, React, Widget,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

Widget = require('./Widget');

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

  function ChartWidgetComponent(props) {
    this.handleRemoveScope = bind(this.handleRemoveScope, this);
    this.handleRemove = bind(this.handleRemove, this);
    this.handleClick = bind(this.handleClick, this);
    ChartWidgetComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      data: null,
      dataQueries: null,
      dataError: null,
      loading: false
    };
  }

  ChartWidgetComponent.prototype.componentDidMount = function() {
    return this.updateData(this.props);
  };

  ChartWidgetComponent.prototype.componentWillReceiveProps = function(nextProps) {
    return this.updateData(nextProps);
  };

  ChartWidgetComponent.prototype.updateData = function(props) {
    var queries;
    if (props.chart.validateDesign(props.design)) {
      return;
    }
    queries = props.chart.createQueries(props.design, props.filters);
    if (_.isEqual(queries, this.state.dataQueries)) {
      return;
    }
    this.setState({
      loading: true,
      dataQueries: queries,
      dataError: null
    });
    return props.dataSource.performQueries(queries, (function(_this) {
      return function(err, data) {
        if (err) {
          return _this.setState({
            data: null,
            dataQueries: null,
            dataError: err,
            loading: false
          });
        } else {
          return _this.setState({
            data: data,
            dataQueries: queries,
            dataError: null,
            loading: false
          });
        }
      };
    })(this));
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
    return this.props.onScopeChange(null, null);
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

  ChartWidgetComponent.prototype.renderScoping = function() {
    var style;
    if (!this.props.scope) {
      return;
    }
    style = {
      position: "absolute",
      right: 10,
      top: 30,
      cursor: "pointer",
      borderRadius: 100,
      border: "solid 1px #DDD",
      padding: "1px 10px 1px 10px",
      color: "#666",
      backgroundColor: "#EEE"
    };
    return H.div({
      style: style,
      onClick: this.handleRemoveScope
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " Filtering ", H.span({
      className: "glyphicon glyphicon-remove"
    }));
  };

  ChartWidgetComponent.prototype.renderChart = function(design, width, height) {
    return this.props.chart.createViewElement({
      design: design,
      data: this.state.data,
      width: width,
      height: height,
      scope: this.props.scope,
      onScopeChange: this.props.onScopeChange
    });
  };

  ChartWidgetComponent.prototype.render = function() {
    var contents, design, elem, results, style;
    style = {
      width: this.props.width,
      height: this.props.height,
      padding: 10
    };
    if (this.props.selected) {
      style.border = "dashed 2px #AAA";
    }
    design = this.props.chart.cleanDesign(this.props.design);
    results = this.props.chart.validateDesign(design);
    if (results) {
      contents = H.div(null, "Invalid design: ", results);
    } else if (this.state.dataError) {
      contents = H.div(null, "Error loading data: ", this.state.dataError.toString());
    } else if (!this.state.data) {
      contents = H.div({
        style: {
          textAlign: "center"
        }
      }, "Loading...");
    } else {
      contents = H.div({
        style: {
          position: "absolute",
          left: 10,
          top: 10
        }
      }, this.renderChart(design, this.props.width - 20, this.props.height - 20));
    }
    if (this.state.loading) {
      style.opacity = 0.5;
      style.backgroundColor = "#E8E8E8";
    }
    elem = H.div({
      className: "mwater-chart-widget",
      style: style,
      onClick: this.handleClick
    }, contents, this.renderResizeHandle(), this.renderRemoveButton(), this.renderScoping());
    if (this.props.connectMoveHandle) {
      elem = this.props.connectMoveHandle(elem);
    }
    return elem;
  };

  return ChartWidgetComponent;

})(React.Component);

var ChartViewComponent, H, React, asyncLatest,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

asyncLatest = require('async-latest');

module.exports = ChartViewComponent = (function(superClass) {
  extend(ChartViewComponent, superClass);

  ChartViewComponent.propTypes = {
    chart: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    standardWidth: React.PropTypes.number,
    scope: React.PropTypes.shape({
      name: React.PropTypes.node.isRequired,
      filter: React.PropTypes.shape({
        table: React.PropTypes.string.isRequired,
        jsonql: React.PropTypes.object.isRequired
      }),
      data: React.PropTypes.any
    }),
    filters: React.PropTypes.array,
    onScopeChange: React.PropTypes.func,
    onSystemAction: React.PropTypes.func,
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      design: React.PropTypes.object.isRequired
    })).isRequired,
    onPopupsChange: React.PropTypes.func,
    namedStrings: React.PropTypes.object
  };

  function ChartViewComponent() {
    ChartViewComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      validDesign: null,
      data: null,
      dataLoading: false,
      dataError: null
    };
    this.loadData = asyncLatest(this.loadData, {
      serial: true
    });
    this.state = {};
  }

  ChartViewComponent.prototype.componentDidMount = function() {
    return this.updateData(this.props);
  };

  ChartViewComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (!_.isEqual(nextProps.design, this.props.design) || !_.isEqual(nextProps.filters, this.props.filters)) {
      return this.updateData(nextProps);
    }
  };

  ChartViewComponent.prototype.updateData = function(props) {
    var design, errors;
    design = props.chart.cleanDesign(props.design, props.schema);
    errors = props.chart.validateDesign(design, props.schema);
    if (errors) {
      return;
    }
    this.setState({
      dataLoading: true
    });
    return this.loadData(props, (function(_this) {
      return function(error, data) {
        return _this.setState({
          dataLoading: false,
          dataError: error,
          data: data,
          validDesign: design
        });
      };
    })(this));
  };

  ChartViewComponent.prototype.loadData = function(props, callback) {
    return props.widgetDataSource.getData(props.design, props.filters, callback);
  };

  ChartViewComponent.prototype.renderSpinner = function() {
    return H.div({
      style: {
        position: "absolute",
        bottom: "50%",
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 20
      }
    }, H.i({
      className: "fa fa-spinner fa-spin"
    }));
  };

  ChartViewComponent.prototype.render = function() {
    var style;
    style = {
      width: this.props.width,
      height: this.props.height
    };
    if (this.state.dataLoading) {
      style.opacity = 0.5;
    }
    if (!this.state.validDesign) {
      style.backgroundColor = "#E0E0E0";
      style.opacity = 0.35;
      if (!this.props.height && this.props.width) {
        style.height = this.props.width / 1.6;
      }
    }
    if (this.state.dataError) {
      return H.div({
        className: "alert alert-danger"
      }, "Error loading data: " + (this.state.dataError.message || this.state.dataError));
    }
    return H.div({
      style: style
    }, this.state.validDesign ? this.props.chart.createViewElement({
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      widgetDataSource: this.props.widgetDataSource,
      design: this.state.validDesign,
      onDesignChange: this.props.onDesignChange,
      data: this.state.data,
      scope: this.props.scope,
      onScopeChange: this.props.onScopeChange,
      width: this.props.width,
      height: this.props.height,
      standardWidth: this.props.standardWidth,
      onSystemAction: this.props.onSystemAction,
      namedStrings: this.props.namedStrings,
      popups: this.props.popups,
      onPopupsChange: this.props.onPopupsChange
    }) : void 0, this.state.dataLoading ? this.renderSpinner() : void 0);
  };

  return ChartViewComponent;

})(React.Component);

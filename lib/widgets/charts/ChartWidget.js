var ActionCancelModalComponent, ChartWidget, ChartWidgetComponent, ChartWidgetViewComponent, CsvBuilder, H, React, SimpleWidgetComponent, Widget, filesaver,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

Widget = require('./../Widget');

SimpleWidgetComponent = require('./../SimpleWidgetComponent');

CsvBuilder = require('./../../CsvBuilder');

filesaver = require('filesaver.js');

ActionCancelModalComponent = require('../../ActionCancelModalComponent');

ChartWidgetViewComponent = require('./ChartWidgetViewComponent');

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
      design: this.design,
      dataSource: this.dataSource,
      onRemove: options.onRemove,
      scope: options.scope,
      filters: options.filters,
      onScopeChange: options.onScopeChange,
      onDesignChange: options.onDesignChange
    });
  };

  return ChartWidget;

})(Widget);

ChartWidgetComponent = (function(superClass) {
  extend(ChartWidgetComponent, superClass);

  function ChartWidgetComponent() {
    this.handleStartEditing = bind(this.handleStartEditing, this);
    this.handleSaveCsvFile = bind(this.handleSaveCsvFile, this);
    return ChartWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  ChartWidgetComponent.propTypes = {
    chart: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    onRemove: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    scope: React.PropTypes.any,
    filters: React.PropTypes.array,
    onScopeChange: React.PropTypes.func,
    connectMoveHandle: React.PropTypes.func,
    connectResizeHandle: React.PropTypes.func
  };

  ChartWidgetComponent.prototype.handleSaveCsvFile = function() {
    var queries;
    queries = this.props.chart.createQueries(this.props.design, this.props.filters);
    return this.props.dataSource.performQueries(queries, (function(_this) {
      return function(err, data) {
        var blob, csv, table;
        if (err) {
          return alert("Failed to get data");
        }
        table = _this.props.chart.createDataTable(_this.props.design, data);
        csv = new CsvBuilder().build(table);
        blob = new Blob([csv], {
          type: "text/csv"
        });
        return filesaver(blob, "Exported Data.csv");
      };
    })(this));
  };

  ChartWidgetComponent.prototype.handleStartEditing = function() {
    return this.refs.simpleWidget.displayEditor();
  };

  ChartWidgetComponent.prototype.render = function() {
    var dropdownItems, editor;
    dropdownItems = this.props.chart.createDropdownItems(this.props.design, this.props.dataSource, this.props.filters);
    dropdownItems.push({
      label: "Export Data",
      icon: "save-file",
      onClick: this.handleSaveCsvFile
    });
    dropdownItems.push({
      label: "Remove",
      icon: "remove",
      onClick: this.props.onRemove
    });
    dropdownItems.unshift({
      label: "Edit",
      icon: "pencil",
      onClick: this.handleStartEditing
    });
    editor = this.props.chart.createDesignerElement({
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    });
    return H.div({
      onDoubleClick: this.handleStartEditing
    }, React.createElement(SimpleWidgetComponent, {
      ref: "simpleWidget",
      width: this.props.width,
      height: this.props.height,
      dropdownItems: dropdownItems,
      editor: editor,
      connectMoveHandle: this.props.connectMoveHandle,
      connectResizeHandle: this.props.connectResizeHandle
    }, React.createElement(ChartWidgetViewComponent, {
      chart: this.props.chart,
      design: this.props.design,
      dataSource: this.props.dataSource,
      scope: this.props.scope,
      filters: this.props.filters,
      onScopeChange: this.props.onScopeChange
    })));
  };

  return ChartWidgetComponent;

})(React.Component);

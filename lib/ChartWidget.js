var ChartWidget, ChartWidgetComponent, CsvBuilder, H, QueryDataLoadingComponent, React, SimpleWidgetComponent, Widget, filesaver,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

Widget = require('./Widget');

QueryDataLoadingComponent = require('./QueryDataLoadingComponent');

SimpleWidgetComponent = require('./SimpleWidgetComponent');

CsvBuilder = require('./CsvBuilder');

filesaver = require('filesaver.js');

module.exports = ChartWidget = (function(superClass) {
  extend(ChartWidget, superClass);

  function ChartWidget(chart, design, dataSource) {
    this.chart = chart;
    this.design = design;
    this.dataSource = dataSource;
  }

  ChartWidget.prototype.saveCsvFile = function(filters) {
    var queries;
    queries = this.chart.createQueries(this.design, filters);
    return this.dataSource.performQueries(queries, (function(_this) {
      return function(err, data) {
        var blob, csv, table;
        if (err) {
          return alert("Failed to get data");
        }
        table = _this.chart.createDataTable(_this.design, data);
        csv = new CsvBuilder().build(table);
        blob = new Blob([csv], {
          type: "text/csv"
        });
        return filesaver(blob, "Exported Data.csv");
      };
    })(this));
  };

  ChartWidget.prototype.createViewElement = function(options) {
    var dropdownItems;
    dropdownItems = this.chart.createDropdownItems(this.design, this.dataSource, options.filters);
    dropdownItems.push({
      label: "Export Data",
      icon: "save-file",
      onClick: (function(_this) {
        return function() {
          return _this.saveCsvFile();
        };
      })(this)
    });
    dropdownItems.push({
      label: "Remove",
      icon: "remove",
      onClick: options.onRemove
    });
    return React.createElement(SimpleWidgetComponent, {
      selected: options.selected,
      onSelect: options.onSelect,
      dropdownItems: dropdownItems
    }, React.createElement(ChartWidgetComponent, {
      chart: this.chart,
      dataSource: this.dataSource,
      design: this.design,
      scope: options.scope,
      filters: options.filters,
      onScopeChange: options.onScopeChange
    }));
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
    return ChartWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  ChartWidgetComponent.propTypes = {
    chart: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    scope: React.PropTypes.any,
    filters: React.PropTypes.array,
    onScopeChange: React.PropTypes.func
  };

  ChartWidgetComponent.prototype.render = function() {
    var dataSource, design, elemFactory, queries, results;
    design = this.props.chart.cleanDesign(this.props.design);
    results = this.props.chart.validateDesign(design);
    if (!results) {
      elemFactory = (function(_this) {
        return function(data) {
          return _this.props.chart.createViewElement({
            design: design,
            data: data,
            width: _this.props.width,
            height: _this.props.height,
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

  return ChartWidgetComponent;

})(React.Component);

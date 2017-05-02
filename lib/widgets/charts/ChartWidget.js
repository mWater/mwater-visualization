var ActionCancelModalComponent, ChartViewComponent, ChartWidget, ChartWidgetComponent, CsvBuilder, DropdownWidgetComponent, H, ModalWindowComponent, R, React, Widget, ui,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

R = React.createElement;

Widget = require('./../Widget');

DropdownWidgetComponent = require('./../DropdownWidgetComponent');

CsvBuilder = require('./../../CsvBuilder');

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

ChartViewComponent = require('./ChartViewComponent');

ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

ui = require('react-library/lib/bootstrap');

module.exports = ChartWidget = (function(superClass) {
  extend(ChartWidget, superClass);

  function ChartWidget(chart) {
    this.chart = chart;
  }

  ChartWidget.prototype.createViewElement = function(options) {
    return R(ChartWidgetComponent, {
      chart: this.chart,
      design: options.design,
      schema: options.schema,
      widgetDataSource: options.widgetDataSource,
      dataSource: options.dataSource,
      scope: options.scope,
      filters: options.filters,
      onScopeChange: options.onScopeChange,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height,
      standardWidth: options.standardWidth,
      onSystemAction: options.onSystemAction,
      namedStrings: options.namedStrings,
      popups: options.popups,
      onPopupsChange: options.onPopupsChange,
      getSystemActions: options.getSystemActions
    });
  };

  ChartWidget.prototype.getData = function(design, schema, dataSource, filters, callback) {
    design = this.chart.cleanDesign(design, schema);
    return this.chart.getData(design, schema, dataSource, filters, callback);
  };

  ChartWidget.prototype.getFilterableTables = function(design, schema) {
    design = this.chart.cleanDesign(design, schema);
    return this.chart.getFilterableTables(design, schema);
  };

  ChartWidget.prototype.isAutoHeight = function() {
    return this.chart.isAutoHeight();
  };

  return ChartWidget;

})(Widget);

ChartWidgetComponent = (function(superClass) {
  extend(ChartWidgetComponent, superClass);

  ChartWidgetComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    chart: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    dataSource: React.PropTypes.object.isRequired,
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
    getSystemActions: React.PropTypes.func,
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      design: React.PropTypes.object.isRequired
    })).isRequired,
    onPopupsChange: React.PropTypes.func,
    namedStrings: React.PropTypes.object,
    connectMoveHandle: React.PropTypes.func,
    connectResizeHandle: React.PropTypes.func
  };

  ChartWidgetComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  function ChartWidgetComponent(props) {
    this.handleEditDesignChange = bind(this.handleEditDesignChange, this);
    this.handleCancelEditing = bind(this.handleCancelEditing, this);
    this.handleEndEditing = bind(this.handleEndEditing, this);
    this.handleStartEditing = bind(this.handleStartEditing, this);
    this.handleSaveCsvFile = bind(this.handleSaveCsvFile, this);
    ChartWidgetComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editDesign: null
    };
  }

  ChartWidgetComponent.prototype.handleSaveCsvFile = function() {
    return this.props.widgetDataSource.getData(this.props.design, this.props.filters, (function(_this) {
      return function(err, data) {
        var blob, csv, filesaver, table;
        if (err) {
          return alert("Failed to get data");
        }
        table = _this.props.chart.createDataTable(_this.props.design, _this.props.schema, _this.props.dataSource, data, _this.context.locale);
        if (!table) {
          return;
        }
        csv = new CsvBuilder().build(table);
        csv = "\uFEFF" + csv;
        blob = new Blob([csv], {
          type: "text/csv"
        });
        filesaver = require('filesaver.js');
        return filesaver(blob, "Exported Data.csv");
      };
    })(this));
  };

  ChartWidgetComponent.prototype.handleStartEditing = function() {
    return this.setState({
      editDesign: this.props.design
    });
  };

  ChartWidgetComponent.prototype.handleEndEditing = function() {
    this.props.onDesignChange(this.state.editDesign);
    return this.setState({
      editDesign: null
    });
  };

  ChartWidgetComponent.prototype.handleCancelEditing = function() {
    return this.setState({
      editDesign: null
    });
  };

  ChartWidgetComponent.prototype.handleEditDesignChange = function(design) {
    return this.setState({
      editDesign: design
    });
  };

  ChartWidgetComponent.prototype.renderChart = function(design, onDesignChange, width, height, standardWidth) {
    return R(ChartViewComponent, {
      chart: this.props.chart,
      design: design,
      onDesignChange: onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      widgetDataSource: this.props.widgetDataSource,
      scope: this.props.scope,
      filters: this.props.filters,
      width: width,
      height: height,
      standardWidth: standardWidth,
      onScopeChange: this.props.onScopeChange,
      onSystemAction: this.props.onSystemAction,
      popups: this.props.popups,
      onPopupsChange: this.props.onPopupsChange,
      namedStrings: this.props.namedStrings,
      getSystemActions: this.props.getSystemActions
    });
  };

  ChartWidgetComponent.prototype.renderEditor = function() {
    var chart, chartHeight, chartWidth, content, editor;
    if (!this.state.editDesign) {
      return null;
    }
    editor = this.props.chart.createDesignerElement({
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.state.editDesign,
      onDesignChange: this.handleEditDesignChange,
      widgetDataSource: this.props.widgetDataSource,
      popups: this.props.popups,
      onPopupsChange: this.props.onPopupsChange,
      namedStrings: this.props.namedStrings,
      onSystemAction: this.props.onSystemAction,
      filters: this.props.filters,
      getSystemActions: this.props.getSystemActions
    });
    if (this.props.chart.hasDesignerPreview()) {
      chartWidth = Math.min(document.body.clientWidth / 2, this.props.width);
      chartHeight = this.props.height * (chartWidth / this.props.width);
      chart = this.renderChart(this.state.editDesign, ((function(_this) {
        return function(design) {
          return _this.setState({
            editDesign: design
          });
        };
      })(this)), chartWidth, chartHeight, chartWidth);
      content = H.div({
        style: {
          height: "100%",
          width: "100%"
        }
      }, H.div({
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          border: "solid 2px #EEE",
          borderRadius: 8,
          padding: 10,
          width: chartWidth + 20,
          height: chartHeight + 20,
          overflow: "hidden"
        }
      }, chart), H.div({
        style: {
          width: "100%",
          height: "100%",
          paddingLeft: chartWidth + 40
        }
      }, H.div({
        style: {
          width: "100%",
          height: "100%",
          overflowY: "auto",
          paddingLeft: 20,
          borderLeft: "solid 3px #AAA"
        }
      }, editor)));
      return R(ModalWindowComponent, {
        isOpen: true,
        onRequestClose: this.handleEndEditing
      }, content);
    } else {
      return R(ActionCancelModalComponent, {
        size: "large",
        onCancel: this.handleCancelEditing,
        onAction: this.handleEndEditing
      }, editor);
    }
  };

  ChartWidgetComponent.prototype.renderEditLink = function() {
    return H.div({
      className: "mwater-visualization-widget-placeholder",
      onClick: this.handleStartEditing
    }, R(ui.Icon, {
      id: this.props.chart.getPlaceholderIcon()
    }));
  };

  ChartWidgetComponent.prototype.render = function() {
    var design, dropdownItems, emptyDesign, validDesign;
    design = this.props.chart.cleanDesign(this.props.design, this.props.schema);
    validDesign = !this.props.chart.validateDesign(design, this.props.schema);
    emptyDesign = this.props.chart.isEmpty(design);
    dropdownItems = this.props.chart.createDropdownItems(design, this.props.schema, this.props.widgetDataSource, this.props.filters);
    if (validDesign) {
      dropdownItems.push({
        label: "Export Data",
        icon: "save-file",
        onClick: this.handleSaveCsvFile
      });
    }
    if (this.props.onDesignChange != null) {
      dropdownItems.unshift({
        label: this.props.chart.getEditLabel(),
        icon: "pencil",
        onClick: this.handleStartEditing
      });
    }
    return H.div({
      onDoubleClick: (this.props.onDesignChange != null ? this.handleStartEditing : void 0),
      style: {
        position: "relative",
        width: this.props.width
      }
    }, this.props.onDesignChange != null ? this.renderEditor() : void 0, React.createElement(DropdownWidgetComponent, {
      width: this.props.width,
      height: this.props.height,
      dropdownItems: dropdownItems
    }, this.renderChart(design, this.props.onDesignChange, this.props.width, this.props.height, this.props.standardWidth)), (emptyDesign || !validDesign) && (this.props.onDesignChange != null) ? this.renderEditLink() : void 0);
  };

  return ChartWidgetComponent;

})(React.Component);

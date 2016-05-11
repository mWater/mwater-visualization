var ActionCancelModalComponent, ChartViewComponent, ChartWidget, ChartWidgetComponent, CsvBuilder, H, ModalWindowComponent, React, SimpleWidgetComponent, Widget, filesaver,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

Widget = require('./../Widget');

SimpleWidgetComponent = require('./../SimpleWidgetComponent');

CsvBuilder = require('./../../CsvBuilder');

filesaver = require('filesaver.js');

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

ChartViewComponent = require('./ChartViewComponent');

ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

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
      onDuplicate: options.onDuplicate,
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

  ChartWidgetComponent.propTypes = {
    chart: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    dataSource: React.PropTypes.object.isRequired,
    onRemove: React.PropTypes.func,
    onDuplicate: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    standardWidth: React.PropTypes.number,
    scope: React.PropTypes.any,
    filters: React.PropTypes.array,
    onScopeChange: React.PropTypes.func,
    connectMoveHandle: React.PropTypes.func,
    connectResizeHandle: React.PropTypes.func
  };

  ChartWidgetComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  function ChartWidgetComponent(props) {
    this.handleEndEditing = bind(this.handleEndEditing, this);
    this.handleStartEditing = bind(this.handleStartEditing, this);
    this.handleSaveCsvFile = bind(this.handleSaveCsvFile, this);
    ChartWidgetComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editing: props.chart.isEmpty(this.props.design)
    };
  }

  ChartWidgetComponent.prototype.handleSaveCsvFile = function() {
    return this.props.chart.getData(this.props.design, this.props.filters, (function(_this) {
      return function(err, data) {
        var blob, csv, table;
        if (err) {
          return alert("Failed to get data");
        }
        table = _this.props.chart.createDataTable(_this.props.design, data, _this.context.locale);
        if (!table) {
          return;
        }
        csv = new CsvBuilder().build(table);
        blob = new Blob([csv], {
          type: "text/csv"
        });
        return filesaver(blob, "Exported Data.csv");
      };
    })(this));
  };

  ChartWidgetComponent.prototype.handleStartEditing = function() {
    return this.setState({
      editing: true
    });
  };

  ChartWidgetComponent.prototype.handleEndEditing = function() {
    this.setState({
      editing: false
    });
    if (this.props.chart.isEmpty(this.props.design)) {
      return this.props.onRemove();
    }
  };

  ChartWidgetComponent.prototype.renderChart = function(width, height) {
    return React.createElement(ChartViewComponent, {
      chart: this.props.chart,
      design: this.props.design,
      dataSource: this.props.dataSource,
      scope: this.props.scope,
      filters: this.props.filters,
      width: width,
      height: height,
      standardWidth: this.props.standardWidth,
      onScopeChange: this.props.onScopeChange
    });
  };

  ChartWidgetComponent.prototype.renderEditor = function() {
    var chart, content, editor, width;
    editor = this.props.chart.createDesignerElement({
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    });
    width = Math.min(document.body.clientWidth / 2, this.props.width);
    chart = this.renderChart(width, this.props.height * (width / this.props.width));
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
        width: width + 20,
        height: this.props.height + 20
      }
    }, chart), H.div({
      style: {
        width: "100%",
        height: "100%",
        paddingLeft: width + 40
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
    return React.createElement(ModalWindowComponent, {
      isOpen: this.state.editing,
      onRequestClose: this.handleEndEditing
    }, content);
  };

  ChartWidgetComponent.prototype.render = function() {
    var dropdownItems, validDesign;
    validDesign = !this.props.chart.validateDesign(this.props.chart.cleanDesign(this.props.design));
    dropdownItems = this.props.chart.createDropdownItems(this.props.design, this.props.dataSource, this.props.filters);
    if (validDesign) {
      dropdownItems.push({
        label: "Export Data",
        icon: "save-file",
        onClick: this.handleSaveCsvFile
      });
    }
    if (this.props.onRemove) {
      dropdownItems.push({
        label: "Remove",
        icon: "remove",
        onClick: this.props.onRemove
      });
    }
    if (this.props.onDuplicate && (this.props.onDesignChange != null)) {
      dropdownItems.push({
        label: "Duplicate",
        icon: "duplicate",
        onClick: this.props.onDuplicate
      });
    }
    if (this.props.onDesignChange != null) {
      dropdownItems.unshift({
        label: "Edit",
        icon: "pencil",
        onClick: this.handleStartEditing
      });
    }
    return H.div({
      onDoubleClick: (this.props.onDesignChange != null ? this.handleStartEditing : void 0)
    }, this.props.onDesignChange != null ? this.renderEditor() : void 0, React.createElement(SimpleWidgetComponent, {
      width: this.props.width,
      height: this.props.height,
      standardWidth: this.props.standardWidth,
      dropdownItems: dropdownItems,
      connectMoveHandle: this.props.connectMoveHandle,
      connectResizeHandle: this.props.connectResizeHandle
    }, this.renderChart()));
  };

  return ChartWidgetComponent;

})(React.Component);

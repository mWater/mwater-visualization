var AxisBuilder, AxisComponent, ExprUtils, FilterExprComponent, H, ImageMosaicChartDesignerComponent, R, React, TableSelectComponent, _, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ui = require('../../../UIComponents');

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../../../axes/AxisBuilder');

AxisComponent = require('../../../axes/AxisComponent');

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

TableSelectComponent = require('../../../TableSelectComponent');

module.exports = ImageMosaicChartDesignerComponent = (function(superClass) {
  extend(ImageMosaicChartDesignerComponent, superClass);

  function ImageMosaicChartDesignerComponent() {
    this.handleImageAxisChange = bind(this.handleImageAxisChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleTitleTextChange = bind(this.handleTitleTextChange, this);
    return ImageMosaicChartDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  ImageMosaicChartDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  ImageMosaicChartDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  ImageMosaicChartDesignerComponent.prototype.handleTitleTextChange = function(ev) {
    return this.updateDesign({
      titleText: ev.target.value
    });
  };

  ImageMosaicChartDesignerComponent.prototype.handleTableChange = function(table) {
    return this.updateDesign({
      table: table
    });
  };

  ImageMosaicChartDesignerComponent.prototype.handleFilterChange = function(filter) {
    return this.updateDesign({
      filter: filter
    });
  };

  ImageMosaicChartDesignerComponent.prototype.handleImageAxisChange = function(imageAxis) {
    return this.updateDesign({
      imageAxis: imageAxis
    });
  };

  ImageMosaicChartDesignerComponent.prototype.renderTable = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.i({
      className: "fa fa-database"
    }), " ", "Data Source"), ": ", React.createElement(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: this.handleTableChange
    }));
  };

  ImageMosaicChartDesignerComponent.prototype.renderTitle = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Title"), H.input({
      type: "text",
      className: "form-control input-sm",
      value: this.props.design.titleText,
      onChange: this.handleTitleTextChange,
      placeholder: "Untitled"
    }));
  };

  ImageMosaicChartDesignerComponent.prototype.renderFilter = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " ", "Filters"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  ImageMosaicChartDesignerComponent.prototype.renderImageAxis = function() {
    if (!this.props.design.table) {
      return;
    }
    return R(ui.SectionComponent, {
      label: "Image Axis"
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["image", "imagelist"],
      aggrNeed: "none",
      required: true,
      value: this.props.design.imageAxis,
      onChange: this.handleImageAxisChange
    }));
  };

  ImageMosaicChartDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.renderImageAxis(), this.renderFilter(), H.hr(), this.renderTitle());
  };

  return ImageMosaicChartDesignerComponent;

})(React.Component);

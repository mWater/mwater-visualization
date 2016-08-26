var AxisComponent, ColorAxisComponent, ColorComponent, EditPopupComponent, ExprUtils, FilterExprComponent, H, MarkersLayerDesignerComponent, R, React, ReactSelect, TableSelectComponent, ZoomLevelsComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisComponent = require('./../axes/AxisComponent');

ColorComponent = require('../ColorComponent');

TableSelectComponent = require('../TableSelectComponent');

ReactSelect = require('react-select');

EditPopupComponent = require('./EditPopupComponent');

ColorAxisComponent = require('../axes/ColorAxisComponent');

ZoomLevelsComponent = require('./ZoomLevelsComponent');

module.exports = MarkersLayerDesignerComponent = (function(superClass) {
  extend(MarkersLayerDesignerComponent, superClass);

  function MarkersLayerDesignerComponent() {
    this.handleNameChange = bind(this.handleNameChange, this);
    this.handleSymbolChange = bind(this.handleSymbolChange, this);
    this.handleColorChange = bind(this.handleColorChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleColorAxisChange = bind(this.handleColorAxisChange, this);
    this.handleGeometryAxisChange = bind(this.handleGeometryAxisChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    return MarkersLayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MarkersLayerDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MarkersLayerDesignerComponent.prototype.update = function(updates) {
    return this.props.onDesignChange(_.extend({}, this.props.design, updates));
  };

  MarkersLayerDesignerComponent.prototype.updateAxes = function(changes) {
    var axes;
    axes = _.extend({}, this.props.design.axes, changes);
    return this.update({
      axes: axes
    });
  };

  MarkersLayerDesignerComponent.prototype.handleTableChange = function(table) {
    return this.update({
      table: table
    });
  };

  MarkersLayerDesignerComponent.prototype.handleGeometryAxisChange = function(axis) {
    return this.updateAxes({
      geometry: axis
    });
  };

  MarkersLayerDesignerComponent.prototype.handleColorAxisChange = function(axis) {
    return this.updateAxes({
      color: axis
    });
  };

  MarkersLayerDesignerComponent.prototype.handleFilterChange = function(expr) {
    return this.update({
      filter: expr
    });
  };

  MarkersLayerDesignerComponent.prototype.handleColorChange = function(color) {
    return this.update({
      color: color
    });
  };

  MarkersLayerDesignerComponent.prototype.handleSymbolChange = function(symbol) {
    return this.update({
      symbol: symbol
    });
  };

  MarkersLayerDesignerComponent.prototype.handleNameChange = function(e) {
    return this.update({
      name: e.target.value
    });
  };

  MarkersLayerDesignerComponent.prototype.renderTable = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.i({
      className: "fa fa-database"
    }), " ", "Data Source"), H.div({
      style: {
        marginLeft: 10
      }
    }, R(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: this.handleTableChange
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderGeometryAxis = function() {
    var title;
    if (!this.props.design.table) {
      return;
    }
    title = H.span(null, H.span({
      className: "glyphicon glyphicon-map-marker"
    }), " Marker Position");
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, title), H.div({
      style: {
        marginLeft: 10
      }
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["geometry"],
      aggrNeed: "none",
      value: this.props.design.axes.geometry,
      onChange: this.handleGeometryAxisChange
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderColorAxis = function() {
    var title;
    if (!this.props.design.axes.geometry) {
      return;
    }
    title = H.span(null, H.span({
      className: "glyphicon glyphicon glyphicon-tint"
    }), " Color By");
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, title), H.div({
      style: {
        marginLeft: 10
      }
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["text", "enum", "boolean"],
      aggrNeed: "none",
      value: this.props.design.axes.color,
      showColorMap: true,
      onChange: this.handleColorAxisChange
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderColor = function() {
    if (!this.props.design.axes.geometry) {
      return;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon glyphicon-tint"
    }), "Color"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(ColorAxisComponent, {
      defaultColor: this.props.design.color,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      axis: this.props.design.axes.color,
      table: this.props.design.table,
      onColorChange: this.handleColorChange,
      onColorAxisChange: this.handleColorAxisChange,
      table: this.props.design.table,
      showColorMap: true,
      types: ["text", "enum", "boolean", 'date'],
      aggrNeed: "none"
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderSymbol = function() {
    var optionRenderer, options;
    if (!this.props.design.axes.geometry) {
      return;
    }
    options = [
      {
        value: "font-awesome/dot-circle-o",
        label: "Dot circle"
      }, {
        value: "font-awesome/bullseye",
        label: "Bullseye"
      }, {
        value: "font-awesome/star",
        label: "Star"
      }, {
        value: "font-awesome/square",
        label: "Square"
      }, {
        value: "font-awesome/home",
        label: "Home"
      }, {
        value: "font-awesome/plus",
        label: "Plus"
      }, {
        value: "font-awesome/plus-circle",
        label: "Plus Circle"
      }, {
        value: "font-awesome/plus-square",
        label: "Plus Square"
      }, {
        value: "font-awesome/asterisk",
        label: "Asterisk"
      }, {
        value: "font-awesome/mobile",
        label: "Mobile"
      }, {
        value: "font-awesome/check",
        label: "Check"
      }, {
        value: "font-awesome/university",
        label: "Institution"
      }, {
        value: "font-awesome/check-circle",
        label: "Check Circle"
      }, {
        value: "font-awesome/times",
        label: "Removed"
      }, {
        value: "font-awesome/ban",
        label: "Ban"
      }, {
        value: "font-awesome/crosshairs",
        label: "Crosshairs"
      }, {
        value: "font-awesome/flask",
        label: "Flask"
      }, {
        value: "font-awesome/flag",
        label: "Flag"
      }, {
        value: "font-awesome/info-circle",
        label: "Info Circle"
      }, {
        value: "font-awesome/exclamation-circle",
        label: "Exclamation Circle"
      }, {
        value: "font-awesome/exclamation-triangle",
        label: "Exclamation Triangle"
      }, {
        value: "font-awesome/bell",
        label: "Bell"
      }, {
        value: "font-awesome/bolt",
        label: "Bolt"
      }, {
        value: "font-awesome/building",
        label: "Building"
      }, {
        value: "font-awesome/bus",
        label: "Bus"
      }, {
        value: "font-awesome/certificate",
        label: "Certificate"
      }, {
        value: "font-awesome/comment",
        label: "Comment"
      }, {
        value: "font-awesome/male",
        label: "Male"
      }, {
        value: "font-awesome/female",
        label: "Female"
      }, {
        value: "font-awesome/user",
        label: "Person"
      }, {
        value: "font-awesome/users",
        label: "Group"
      }, {
        value: "font-awesome/wheelchair",
        label: "Wheelchair"
      }, {
        value: "font-awesome/h-square",
        label: "Hospital Symbol"
      }, {
        value: "font-awesome/thumbs-up",
        label: "Thumbs Up"
      }, {
        value: "font-awesome/thumbs-down",
        label: "Thumbs Down"
      }, {
        value: "font-awesome/ticket",
        label: "Ticket"
      }, {
        value: "font-awesome/tint",
        label: "Tint"
      }, {
        value: "font-awesome/times",
        label: "Times"
      }, {
        value: "font-awesome/times-circle",
        label: "Times Circle"
      }, {
        value: "font-awesome/tree",
        label: "Tree"
      }, {
        value: "font-awesome/wheelchair",
        label: "Wheelchair"
      }, {
        value: "font-awesome/file",
        label: "File"
      }, {
        value: "font-awesome/usd",
        label: "USD"
      }, {
        value: "font-awesome/caret-up",
        label: "Caret Up"
      }, {
        value: "font-awesome/chevron-circle-up",
        label: "Chevron Up"
      }, {
        value: "font-awesome/chevron-circle-down",
        label: "Chevron Down"
      }, {
        value: "font-awesome/medkit",
        label: "Medkit"
      }, {
        value: "font-awesome/cloud",
        label: "Cloud"
      }, {
        value: "font-awesome/beer",
        label: "Beer"
      }
    ];
    optionRenderer = function(option) {
      return H.span(null, H.i({
        className: "fa fa-" + (option.value.substr(13))
      }), " " + option.label);
    };
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "fa fa-star"
    }), " ", "Symbol"), R(ReactSelect, {
      placeholder: "Circle",
      value: this.props.design.symbol,
      options: options,
      optionRenderer: optionRenderer,
      valueRenderer: optionRenderer,
      onChange: this.handleSymbolChange
    }));
  };

  MarkersLayerDesignerComponent.prototype.renderFilter = function() {
    if (!this.props.design.axes.geometry) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " Filters"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderPopup = function() {
    if (!this.props.design.table) {
      return null;
    }
    return R(EditPopupComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table
    });
  };

  MarkersLayerDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.renderGeometryAxis(), this.renderColor(), this.renderSymbol(), this.renderFilter(), this.renderPopup(), this.props.design.table ? R(ZoomLevelsComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    }) : void 0);
  };

  return MarkersLayerDesignerComponent;

})(React.Component);

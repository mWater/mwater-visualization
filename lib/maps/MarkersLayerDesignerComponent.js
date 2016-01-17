var AxisComponent, ColorComponent, ExprUtils, FilterExprComponent, H, MarkersLayerDesignerComponent, MarkersLayerSublayerDesignerComponent, React, ReactSelect, TableSelectComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisComponent = require('./../axes/AxisComponent');

ColorComponent = require('../ColorComponent');

TableSelectComponent = require('../TableSelectComponent');

ReactSelect = require('react-select');

module.exports = MarkersLayerDesignerComponent = (function(superClass) {
  extend(MarkersLayerDesignerComponent, superClass);

  function MarkersLayerDesignerComponent() {
    this.renderSublayer = bind(this.renderSublayer, this);
    this.handleAddSublayer = bind(this.handleAddSublayer, this);
    this.handleRemoveSublayer = bind(this.handleRemoveSublayer, this);
    this.handleSublayerChange = bind(this.handleSublayerChange, this);
    return MarkersLayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MarkersLayerDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MarkersLayerDesignerComponent.prototype.updateDesign = function(updates) {
    return this.props.onDesignChange(_.extend({}, this.props.design, updates));
  };

  MarkersLayerDesignerComponent.prototype.handleSublayerChange = function(index, sublayer) {
    var sublayers;
    sublayers = this.props.design.sublayers.slice();
    sublayers[index] = sublayer;
    return this.updateDesign({
      sublayers: sublayers
    });
  };

  MarkersLayerDesignerComponent.prototype.handleRemoveSublayer = function(index) {
    var sublayers;
    sublayers = this.props.design.sublayers.slice();
    sublayers.splice(index, 1);
    return this.updateDesign({
      sublayers: sublayers
    });
  };

  MarkersLayerDesignerComponent.prototype.handleAddSublayer = function() {
    var sublayers;
    sublayers = this.props.design.sublayers.slice();
    sublayers.push({});
    return this.updateDesign({
      sublayers: sublayers
    });
  };

  MarkersLayerDesignerComponent.prototype.renderSublayer = function(index) {
    var style;
    style = {
      borderTop: "solid 1px #EEE",
      paddingTop: 10,
      paddingBottom: 10
    };
    return H.div({
      style: style,
      key: index
    }, React.createElement(MarkersLayerSublayerDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      sublayer: this.props.design.sublayers[index],
      onChange: this.handleSublayerChange.bind(null, index),
      onRemove: index > 0 ? this.handleRemoveSublayer.bind(null, index) : void 0
    }));
  };

  MarkersLayerDesignerComponent.prototype.renderSublayers = function() {
    return H.div(null, _.map(this.props.design.sublayers, (function(_this) {
      return function(layer, i) {
        return _this.renderSublayer(i);
      };
    })(this)), H.button({
      className: "btn btn-default",
      type: "button",
      onClick: this.handleAddSublayer
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Series"));
  };

  MarkersLayerDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderSublayers(), H.hr());
  };

  return MarkersLayerDesignerComponent;

})(React.Component);

MarkersLayerSublayerDesignerComponent = (function(superClass) {
  extend(MarkersLayerSublayerDesignerComponent, superClass);

  function MarkersLayerSublayerDesignerComponent() {
    this.handleSymbolChange = bind(this.handleSymbolChange, this);
    this.handleColorChange = bind(this.handleColorChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleGeometryAxisChange = bind(this.handleGeometryAxisChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    return MarkersLayerSublayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MarkersLayerSublayerDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    sublayer: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func
  };

  MarkersLayerSublayerDesignerComponent.prototype.update = function(updates) {
    return this.props.onChange(_.extend({}, this.props.sublayer, updates));
  };

  MarkersLayerSublayerDesignerComponent.prototype.updateAxes = function(changes) {
    var axes;
    axes = _.extend({}, this.props.sublayer.axes, changes);
    return this.update({
      axes: axes
    });
  };

  MarkersLayerSublayerDesignerComponent.prototype.handleTableChange = function(table) {
    return this.update({
      table: table
    });
  };

  MarkersLayerSublayerDesignerComponent.prototype.handleGeometryAxisChange = function(axis) {
    return this.updateAxes({
      geometry: axis
    });
  };

  MarkersLayerSublayerDesignerComponent.prototype.handleFilterChange = function(expr) {
    return this.update({
      filter: expr
    });
  };

  MarkersLayerSublayerDesignerComponent.prototype.handleColorChange = function(color) {
    return this.update({
      color: color
    });
  };

  MarkersLayerSublayerDesignerComponent.prototype.handleSymbolChange = function(symbol) {
    return this.update({
      symbol: symbol
    });
  };

  MarkersLayerSublayerDesignerComponent.prototype.renderRemove = function() {
    if (this.props.onRemove) {
      return H.button({
        className: "btn btn-xs btn-link pull-right",
        type: "button",
        onClick: this.props.onRemove
      }, H.span({
        className: "glyphicon glyphicon-remove"
      }));
    }
  };

  MarkersLayerSublayerDesignerComponent.prototype.renderTable = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-file"
    }), " ", "Data Source"), ": ", React.createElement(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.sublayer.table,
      onChange: this.handleTableChange
    }));
  };

  MarkersLayerSublayerDesignerComponent.prototype.renderGeometryAxis = function() {
    var title;
    if (!this.props.sublayer.table) {
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
    }, React.createElement(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.sublayer.table,
      types: ["geometry"],
      aggrNeed: "none",
      value: this.props.sublayer.axes.geometry,
      onChange: this.handleGeometryAxisChange
    })));
  };

  MarkersLayerSublayerDesignerComponent.prototype.renderColor = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Color"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(ColorComponent, {
      color: this.props.sublayer.color,
      onChange: this.handleColorChange
    })));
  };

  MarkersLayerSublayerDesignerComponent.prototype.renderSymbol = function() {
    var optionRenderer, options;
    options = [
      {
        value: "font-awesome/star",
        label: "Star"
      }, {
        value: "font-awesome/square",
        label: "Square"
      }, {
        value: "font-awesome/check",
        label: "Check"
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
        value: "font-awesome/info-circle",
        label: "Info Circle"
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
        value: "font-awesome/home",
        label: "Home"
      }, {
        value: "font-awesome/wheelchair",
        label: "Wheelchair"
      }, {
        value: "font-awesome/h-square",
        label: "Hospital Symbol"
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
    }), " ", "Symbol"), React.createElement(ReactSelect, {
      placeholder: "Circle",
      value: this.props.sublayer.symbol,
      options: options,
      optionRenderer: optionRenderer,
      valueRenderer: optionRenderer,
      onChange: this.handleSymbolChange
    }));
  };

  MarkersLayerSublayerDesignerComponent.prototype.renderFilter = function() {
    if (!this.props.sublayer.table) {
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
    }, React.createElement(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.sublayer.table,
      value: this.props.sublayer.filter
    })));
  };

  MarkersLayerSublayerDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderRemove(), this.renderTable(), this.renderGeometryAxis(), this.renderColor(), this.renderSymbol(), this.renderFilter());
  };

  return MarkersLayerSublayerDesignerComponent;

})(React.Component);

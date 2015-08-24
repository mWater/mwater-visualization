var AxisComponent, ColorComponent, ColorPicker, EditableLinkComponent, ExpressionBuilder, H, LogicalExprComponent, MarkersLayerDesignerComponent, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

LogicalExprComponent = require('../expressions/LogicalExprComponent');

ExpressionBuilder = require('../expressions/ExpressionBuilder');

EditableLinkComponent = require('../EditableLinkComponent');

AxisComponent = require('./../expressions/axes/AxisComponent');

ColorPicker = require('react-color');

module.exports = MarkersLayerDesignerComponent = (function(superClass) {
  extend(MarkersLayerDesignerComponent, superClass);

  function MarkersLayerDesignerComponent() {
    this.handleColorChange = bind(this.handleColorChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
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

  MarkersLayerDesignerComponent.prototype.renderTable = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-file"
    }), " ", "Data Source"), ": ", React.createElement(EditableLinkComponent, {
      dropdownItems: this.props.schema.getTables(),
      onDropdownItemClicked: this.handleTableChange,
      onRemove: this.props.design.table ? this.handleTableChange.bind(this, null) : void 0
    }, this.props.design.table ? this.props.schema.getTable(this.props.design.table).name : H.i(null, "Select...")));
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
    }, React.createElement(AxisComponent, {
      editorTitle: title,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["geometry"],
      aggrNeed: "none",
      value: this.props.design.axes.geometry,
      onChange: this.handleGeometryAxisChange
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderColor = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Color"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(ColorComponent, {
      color: this.props.design.color,
      onChange: this.handleColorChange
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderFilter = function() {
    if (!this.props.design.table) {
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
    }, React.createElement(LogicalExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  MarkersLayerDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.renderGeometryAxis(), this.renderColor(), this.renderFilter());
  };

  return MarkersLayerDesignerComponent;

})(React.Component);

ColorComponent = (function(superClass) {
  extend(ColorComponent, superClass);

  ColorComponent.propTypes = {
    color: React.PropTypes.string,
    onChange: React.PropTypes.func
  };

  function ColorComponent() {
    this.handleClose = bind(this.handleClose, this);
    this.handleClick = bind(this.handleClick, this);
    ColorComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      open: false
    };
  }

  ColorComponent.prototype.handleClick = function() {
    return this.setState({
      open: !this.state.open
    });
  };

  ColorComponent.prototype.handleClose = function(color) {
    this.setState({
      open: false
    });
    return this.props.onChange("#" + color.hex);
  };

  ColorComponent.prototype.render = function() {
    var popupPosition, style;
    style = {
      height: 30,
      width: 30,
      border: "solid 2px #888",
      borderRadius: 4,
      backgroundColor: this.props.color
    };
    popupPosition = {
      position: 'absolute',
      top: 0,
      left: 30
    };
    return H.div({
      style: {
        position: "relative"
      }
    }, H.div({
      style: style,
      onClick: this.handleClick
    }), React.createElement(ColorPicker, {
      display: this.state.open,
      positionCSS: popupPosition,
      onClose: this.handleClose
    }));
  };

  return ColorComponent;

})(React.Component);

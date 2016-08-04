var AxisComponent, BlocksLayoutManager, ColorComponent, DirectWidgetDataSource, EditPopupComponent, ExprUtils, FilterExprComponent, H, MarkersLayerDesignerComponent, ModalWindowComponent, R, React, ReactSelect, TableSelectComponent, WidgetFactory, _,
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
    }), " ", "Data Source"), ": ", R(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: this.handleTableChange
    }));
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
    }), this.props.design.axes.color ? " Default Color" : " Color"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(ColorComponent, {
      color: this.props.design.color,
      onChange: this.handleColorChange
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderSymbol = function() {
    var optionRenderer, options;
    if (!this.props.design.axes.geometry) {
      return;
    }
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

  MarkersLayerDesignerComponent.prototype.renderName = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "fa fa-tag"
    }), " ", "Name"), H.div({
      style: {
        marginLeft: 8
      }
    }, H.input({
      type: 'text',
      value: this.props.sublayer.name,
      onChange: this.handleNameChange,
      className: 'form-control'
    })));
  };

  MarkersLayerDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.renderGeometryAxis(), this.renderColor(), this.renderColorAxis(), this.renderSymbol(), this.renderFilter(), R(EditPopupComponent, {
      design: this.props.design,
      onChange: this.props.onChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource
    }));
  };

  return MarkersLayerDesignerComponent;

})(React.Component);

ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');

WidgetFactory = require('../widgets/WidgetFactory');

DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');

EditPopupComponent = (function(superClass) {
  extend(EditPopupComponent, superClass);

  function EditPopupComponent() {
    this.handleItemsChange = bind(this.handleItemsChange, this);
    EditPopupComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editing: false
    };
  }

  EditPopupComponent.prototype.handleItemsChange = function(items) {
    var design, popup;
    popup = this.props.design.popup || {};
    popup = _.extend({}, popup, {
      items: items
    });
    design = _.extend({}, this.props.design, {
      popup: popup
    });
    return this.props.onChange(design);
  };

  EditPopupComponent.prototype.render = function() {
    var ref;
    return H.div(null, H.a({
      className: "btn btn-link",
      onClick: ((function(_this) {
        return function() {
          return _this.setState({
            editing: true
          });
        };
      })(this))
    }, "Customize Popup"), this.state.editing ? R(ModalWindowComponent, {
      isOpen: true,
      onRequestClose: ((function(_this) {
        return function() {
          return _this.setState({
            editing: false
          });
        };
      })(this))
    }, new BlocksLayoutManager().renderLayout({
      items: (ref = this.props.design.popup) != null ? ref.items : void 0,
      onItemsChange: this.handleItemsChange,
      renderWidget: (function(_this) {
        return function(options) {
          var widget, widgetDataSource;
          widget = WidgetFactory.createWidget(options.type);
          widgetDataSource = new DirectWidgetDataSource({
            apiUrl: "https://api.mwater.co/v3/",
            widget: widget,
            design: options.design,
            schema: _this.props.schema,
            dataSource: _this.props.dataSource,
            client: null
          });
          return widget.createViewElement({
            schema: _this.props.schema,
            dataSource: _this.props.dataSource,
            widgetDataSource: widgetDataSource,
            design: options.design,
            scope: null,
            filters: [],
            onScopeChange: null,
            onDesignChange: options.onDesignChange,
            width: null,
            height: null,
            standardWidth: null
          });
        };
      })(this)
    })) : void 0);
  };

  return EditPopupComponent;

})(React.Component);

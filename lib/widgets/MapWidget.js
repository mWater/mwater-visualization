var H, MapDesignerComponent, MapViewComponent, MapWidget, MapWidgetComponent, React, SimpleWidgetComponent, Widget, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

_ = require('lodash');

Widget = require('./Widget');

SimpleWidgetComponent = require('./SimpleWidgetComponent');

MapDesignerComponent = require('../maps/MapDesignerComponent');

MapViewComponent = require('../maps/MapViewComponent');

module.exports = MapWidget = (function(superClass) {
  extend(MapWidget, superClass);

  function MapWidget(options) {
    this.schema = options.schema;
    this.design = options.design;
    this.dataSource = options.dataSource;
    this.layerFactory = options.layerFactory;
  }

  MapWidget.prototype.createViewElement = function(options) {
    return React.createElement(MapWidgetComponent, {
      schema: this.schema,
      dataSource: this.dataSource,
      layerFactory: this.layerFactory,
      design: this.design,
      onDesignChange: options.onDesignChange,
      onRemove: options.onRemove,
      filters: options.filters
    });
  };

  return MapWidget;

})(Widget);

MapWidgetComponent = (function(superClass) {
  extend(MapWidgetComponent, superClass);

  function MapWidgetComponent() {
    this.handleStartEditing = bind(this.handleStartEditing, this);
    return MapWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  MapWidgetComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    layerFactory: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    filters: React.PropTypes.array
  };

  MapWidgetComponent.prototype.handleStartEditing = function() {
    return this.refs.simpleWidget.displayEditor();
  };

  MapWidgetComponent.prototype.render = function() {
    var dropdownItems, editor;
    dropdownItems = [
      {
        label: "Edit",
        icon: "pencil",
        onClick: this.handleStartEditing
      }, {
        label: [
          H.span({
            className: "glyphicon glyphicon-remove"
          }), " Remove"
        ],
        onClick: this.props.onRemove
      }
    ];
    editor = React.createElement(MapDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      layerFactory: this.props.layerFactory,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    });
    return React.createElement(SimpleWidgetComponent, {
      ref: "simpleWidget",
      editor: editor,
      width: this.props.width,
      height: this.props.height,
      connectMoveHandle: this.props.connectMoveHandle,
      connectResizeHandle: this.props.connectResizeHandle,
      dropdownItems: dropdownItems
    }, React.createElement(MapViewComponent, {
      schema: this.props.schema,
      layerFactory: this.props.layerFactory,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      extraFilters: this.props.filters
    }));
  };

  return MapWidgetComponent;

})(React.Component);

var H, InnerMapWidgetComponent, MapDesignerComponent, MapViewComponent, MapWidget, MapWidgetComponent, ModalWindowComponent, React, SimpleWidgetComponent, Widget, _,
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

ModalWindowComponent = require('../ModalWindowComponent');

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

  function MapWidgetComponent(props) {
    this.handleStartEditing = bind(this.handleStartEditing, this);
    MapWidgetComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editing: false
    };
  }

  MapWidgetComponent.prototype.handleStartEditing = function() {
    return this.setState({
      editing: true
    });
  };

  MapWidgetComponent.prototype.renderEditor = function() {
    var chart, content, editor, width;
    editor = React.createElement(MapDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      layerFactory: this.props.layerFactory,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    });
    width = Math.min(document.body.clientWidth / 2, this.props.width);
    chart = this.renderContent(width, this.props.height);
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
      onRequestClose: ((function(_this) {
        return function() {
          return _this.setState({
            editing: false
          });
        };
      })(this))
    }, content);
  };

  MapWidgetComponent.prototype.renderContent = function(width, height) {
    return React.createElement(InnerMapWidgetComponent, {
      schema: this.props.schema,
      layerFactory: this.props.layerFactory,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      filters: this.props.filters,
      width: width,
      height: height
    });
  };

  MapWidgetComponent.prototype.render = function() {
    var dropdownItems;
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
    return H.div(null, this.renderEditor(), React.createElement(SimpleWidgetComponent, {
      width: this.props.width,
      height: this.props.height,
      connectMoveHandle: this.props.connectMoveHandle,
      connectResizeHandle: this.props.connectResizeHandle,
      dropdownItems: dropdownItems
    }, this.renderContent()));
  };

  return MapWidgetComponent;

})(React.Component);

InnerMapWidgetComponent = (function(superClass) {
  extend(InnerMapWidgetComponent, superClass);

  function InnerMapWidgetComponent() {
    return InnerMapWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  InnerMapWidgetComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    layerFactory: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    filters: React.PropTypes.array
  };

  InnerMapWidgetComponent.prototype.render = function() {
    return H.div({
      style: {
        width: this.props.width,
        height: this.props.height,
        padding: 10
      }
    }, React.createElement(MapViewComponent, {
      schema: this.props.schema,
      layerFactory: this.props.layerFactory,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      extraFilters: this.props.filters,
      width: this.props.width - 20,
      height: this.props.height - 20
    }));
  };

  return InnerMapWidgetComponent;

})(React.Component);

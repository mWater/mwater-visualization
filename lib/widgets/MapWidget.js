var DropdownWidgetComponent, LayerFactory, MapUtils, MapWidget, MapWidgetComponent, ModalWindowComponent, PropTypes, R, React, Widget, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

_ = require('lodash');

Widget = require('./Widget');

DropdownWidgetComponent = require('./DropdownWidgetComponent');

ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

LayerFactory = require('../maps/LayerFactory');

MapUtils = require('../maps/MapUtils');

module.exports = MapWidget = (function(superClass) {
  extend(MapWidget, superClass);

  function MapWidget() {
    return MapWidget.__super__.constructor.apply(this, arguments);
  }

  MapWidget.prototype.createViewElement = function(options) {
    return React.createElement(MapWidgetComponent, {
      schema: options.schema,
      dataSource: options.dataSource,
      widgetDataSource: options.widgetDataSource,
      design: options.design,
      onDesignChange: options.onDesignChange,
      scope: options.scope,
      filters: options.filters,
      onScopeChange: options.onScopeChange,
      width: options.width,
      height: options.height,
      standardWidth: options.standardWidth,
      onRowClick: options.onRowClick
    });
  };

  MapWidget.prototype.getFilterableTables = function(design, schema) {
    return MapUtils.getFilterableTables(design, schema);
  };

  return MapWidget;

})(Widget);

MapWidgetComponent = (function(superClass) {
  extend(MapWidgetComponent, superClass);

  MapWidgetComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    widgetDataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    scope: PropTypes.any,
    filters: PropTypes.array,
    onScopeChange: PropTypes.func,
    onRowClick: PropTypes.func
  };

  function MapWidgetComponent(props) {
    this.handleEditDesignChange = bind(this.handleEditDesignChange, this);
    this.handleEndEditing = bind(this.handleEndEditing, this);
    this.handleStartEditing = bind(this.handleStartEditing, this);
    MapWidgetComponent.__super__.constructor.call(this, props);
    this.state = {
      editDesign: null
    };
  }

  MapWidgetComponent.prototype.handleStartEditing = function() {
    return this.setState({
      editDesign: this.props.design
    });
  };

  MapWidgetComponent.prototype.handleEndEditing = function() {
    this.props.onDesignChange(this.state.editDesign);
    return this.setState({
      editDesign: null
    });
  };

  MapWidgetComponent.prototype.handleEditDesignChange = function(design) {
    return this.setState({
      editDesign: design
    });
  };

  MapWidgetComponent.prototype.renderEditor = function() {
    var MapDesignerComponent, chart, content, editor, height, width;
    if (!this.state.editDesign) {
      return null;
    }
    MapDesignerComponent = require('../maps/MapDesignerComponent');
    editor = React.createElement(MapDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.state.editDesign,
      onDesignChange: this.handleEditDesignChange,
      filters: this.props.filters
    });
    width = Math.min(document.body.clientWidth / 2, this.props.width);
    height = this.props.height * width / this.props.width;
    chart = this.renderContent(this.state.editDesign, this.handleEditDesignChange, width, height);
    content = R('div', {
      style: {
        height: "100%",
        width: "100%"
      }
    }, R('div', {
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        border: "solid 2px #EEE",
        borderRadius: 8,
        padding: 10,
        width: width + 20,
        height: height + 20
      }
    }, chart), R('div', {
      style: {
        width: "100%",
        height: "100%",
        paddingLeft: width + 40
      }
    }, R('div', {
      style: {
        width: "100%",
        height: "100%",
        overflowY: "auto",
        paddingLeft: 20,
        borderLeft: "solid 3px #AAA"
      }
    }, editor)));
    return React.createElement(ModalWindowComponent, {
      isOpen: true,
      onRequestClose: this.handleEndEditing
    }, content);
  };

  MapWidgetComponent.prototype.renderContent = function(design, onDesignChange, width, height) {
    var MapViewComponent;
    MapViewComponent = require('../maps/MapViewComponent');
    return R('div', {
      style: {
        width: width,
        height: height,
        padding: 10
      }
    }, React.createElement(MapViewComponent, {
      schema: this.props.schema,
      design: design,
      dataSource: this.props.dataSource,
      mapDataSource: this.props.widgetDataSource.getMapDataSource(design),
      onDesignChange: onDesignChange,
      scope: this.props.scope,
      onScopeChange: this.props.onScopeChange,
      extraFilters: this.props.filters,
      width: width - 20,
      height: height - 20,
      scrollWheelZoom: false,
      onRowClick: this.props.onRowClick
    }));
  };

  MapWidgetComponent.prototype.render = function() {
    var dropdownItems;
    dropdownItems = [];
    if (this.props.onDesignChange != null) {
      dropdownItems.push({
        label: "Edit",
        icon: "pencil",
        onClick: this.handleStartEditing
      });
    }
    return R('div', null, this.props.onDesignChange != null ? this.renderEditor() : void 0, React.createElement(DropdownWidgetComponent, {
      width: this.props.width,
      height: this.props.height,
      dropdownItems: dropdownItems
    }, this.renderContent(this.props.design, null, this.props.width, this.props.height)));
  };

  return MapWidgetComponent;

})(React.Component);

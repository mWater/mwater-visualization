var DropdownWidgetComponent, H, MapWidget, MapWidgetComponent, ModalWindowComponent, React, Widget, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

_ = require('lodash');

Widget = require('./Widget');

DropdownWidgetComponent = require('./DropdownWidgetComponent');

ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

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
      standardWidth: options.standardWidth
    });
  };

  return MapWidget;

})(Widget);

MapWidgetComponent = (function(superClass) {
  extend(MapWidgetComponent, superClass);

  MapWidgetComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    scope: React.PropTypes.any,
    filters: React.PropTypes.array,
    onScopeChange: React.PropTypes.func
  };

  function MapWidgetComponent(props) {
    this.handleEditDesignChange = bind(this.handleEditDesignChange, this);
    this.handleEndEditing = bind(this.handleEndEditing, this);
    this.handleStartEditing = bind(this.handleStartEditing, this);
    MapWidgetComponent.__super__.constructor.apply(this, arguments);
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
      onDesignChange: this.handleEditDesignChange
    });
    width = Math.min(document.body.clientWidth / 2, this.props.width);
    height = this.props.height * width / this.props.width;
    chart = this.renderContent(this.state.editDesign, this.handleEditDesignChange, width, height);
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
        height: height + 20
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
      isOpen: true,
      onRequestClose: this.handleEndEditing
    }, content);
  };

  MapWidgetComponent.prototype.renderContent = function(design, onDesignChange, width, height) {
    var MapViewComponent;
    MapViewComponent = require('../maps/MapViewComponent');
    return H.div({
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
      touchZoom: false,
      scrollWheelZoom: false
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
    return H.div(null, this.props.onDesignChange != null ? this.renderEditor() : void 0, React.createElement(DropdownWidgetComponent, {
      width: this.props.width,
      height: this.props.height,
      dropdownItems: dropdownItems
    }, this.renderContent(this.props.design, null, this.props.width, this.props.height)));
  };

  return MapWidgetComponent;

})(React.Component);

var AttributionComponent, BaseLayerDesignerComponent, ClickOutHandler, H, MapDesignerComponent, MapFiltersDesignerComponent, MapLayersDesignerComponent, R, React, TabbedComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

TabbedComponent = require('react-library/lib/TabbedComponent');

MapLayersDesignerComponent = require('./MapLayersDesignerComponent');

MapFiltersDesignerComponent = require('./MapFiltersDesignerComponent');

ClickOutHandler = require('react-onclickout');

module.exports = MapDesignerComponent = (function(superClass) {
  extend(MapDesignerComponent, superClass);

  function MapDesignerComponent() {
    this.handleAttributionChange = bind(this.handleAttributionChange, this);
    return MapDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MapDesignerComponent.prototype.handleAttributionChange = function(text) {
    var design;
    design = _.extend({}, this.props.design, {
      attribution: text
    });
    return this.props.onDesignChange(design);
  };

  MapDesignerComponent.prototype.render = function() {
    return H.div({
      style: {
        padding: 5
      }
    }, H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Layers"), R(MapLayersDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    })), H.br(), H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Filters"), R(MapFiltersDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    })), H.br(), H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Map Style"), R(BaseLayerDesignerComponent, {
      schema: this.props.schema,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    })), R(AttributionComponent, {
      text: this.props.design.attribution,
      onTextChange: this.handleAttributionChange
    }));
  };

  return MapDesignerComponent;

})(React.Component);

BaseLayerDesignerComponent = (function(superClass) {
  extend(BaseLayerDesignerComponent, superClass);

  function BaseLayerDesignerComponent() {
    this.handleBaseLayerChange = bind(this.handleBaseLayerChange, this);
    return BaseLayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  BaseLayerDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  BaseLayerDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  BaseLayerDesignerComponent.prototype.handleBaseLayerChange = function(baseLayer) {
    return this.updateDesign({
      baseLayer: baseLayer
    });
  };

  BaseLayerDesignerComponent.prototype.renderBaseLayer = function(id, name) {
    var className;
    className = "mwater-visualization-layer";
    if (id === this.props.design.baseLayer) {
      className += " checked";
    }
    return H.div({
      key: id,
      className: className,
      style: {
        display: "inline-block"
      },
      onClick: this.handleBaseLayerChange.bind(null, id)
    }, name);
  };

  BaseLayerDesignerComponent.prototype.render = function() {
    return H.div({
      style: {
        marginLeft: 10
      }
    }, this.renderBaseLayer("bing_road", "Roads"), this.renderBaseLayer("bing_aerial", "Satellite"), this.renderBaseLayer("cartodb_positron", "Light"), this.renderBaseLayer("cartodb_dark_matter", "Dark"));
  };

  return BaseLayerDesignerComponent;

})(React.Component);

AttributionComponent = (function(superClass) {
  extend(AttributionComponent, superClass);

  AttributionComponent.propTypes = {
    text: React.PropTypes.string,
    onTextChange: React.PropTypes.func.required
  };

  AttributionComponent.defaultProps = {
    text: null
  };

  function AttributionComponent() {
    this.handleTextClick = bind(this.handleTextClick, this);
    this.handleClickOut = bind(this.handleClickOut, this);
    this.handleTextChange = bind(this.handleTextChange, this);
    AttributionComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editing: false
    };
  }

  AttributionComponent.prototype.handleTextChange = function(e) {
    return this.props.onTextChange(e.target.value);
  };

  AttributionComponent.prototype.handleClickOut = function() {
    return this.setState({
      editing: false
    });
  };

  AttributionComponent.prototype.renderEditor = function() {
    return R(ClickOutHandler, {
      onClickOut: this.handleClickOut
    }, H.input({
      ref: "attributionInput",
      onChange: this.handleTextChange,
      value: this.props.text,
      className: 'form-control'
    }));
  };

  AttributionComponent.prototype.handleTextClick = function() {
    return this.setState({
      editing: true
    });
  };

  AttributionComponent.prototype.render = function() {
    var elem;
    elem = H.div(null, this.state.editing ? this.renderEditor() : this.props.text ? H.span({
      onClick: this.handleTextClick,
      style: {
        cursor: "pointer"
      }
    }, this.props.text) : H.a({
      onClick: this.handleTextClick,
      className: "btn btn-link btn-sm"
    }, "+ Add attribution"));
    if (this.props.text || this.state.editing) {
      elem = H.div({
        className: "form-group"
      }, H.label({
        className: "text-muted"
      }, "Attribution"), elem);
    }
    return elem;
  };

  return AttributionComponent;

})(React.Component);

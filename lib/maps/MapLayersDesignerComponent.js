var ActionCancelModalComponent, H, MapLayerViewDesignerComponent, MapLayersDesignerComponent, React, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

uuid = require('node-uuid');

ActionCancelModalComponent = require('../ActionCancelModalComponent');

module.exports = MapLayersDesignerComponent = (function(superClass) {
  extend(MapLayersDesignerComponent, superClass);

  function MapLayersDesignerComponent() {
    this.renderLayerView = bind(this.renderLayerView, this);
    this.handleAddLayerView = bind(this.handleAddLayerView, this);
    this.handleRemoveLayerView = bind(this.handleRemoveLayerView, this);
    this.handleBaseLayerChange = bind(this.handleBaseLayerChange, this);
    this.handleLayerViewChange = bind(this.handleLayerViewChange, this);
    return MapLayersDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapLayersDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    layerFactory: React.PropTypes.object.isRequired
  };

  MapLayersDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  MapLayersDesignerComponent.prototype.handleLayerViewChange = function(index, layerView) {
    var layerViews;
    layerViews = this.props.design.layerViews.slice();
    layerViews[index] = layerView;
    if (layerView.group && layerView.visible) {
      _.each(this.props.design.layerViews, (function(_this) {
        return function(lv, i) {
          if (lv.visible && i !== index && lv.group === layerView.group) {
            return layerViews[i] = _.extend({}, lv, {
              visible: false
            });
          }
        };
      })(this));
    }
    return this.updateDesign({
      layerViews: layerViews
    });
  };

  MapLayersDesignerComponent.prototype.handleBaseLayerChange = function(baseLayer) {
    return this.updateDesign({
      baseLayer: baseLayer
    });
  };

  MapLayersDesignerComponent.prototype.handleRemoveLayerView = function(index) {
    var layerViews;
    layerViews = this.props.design.layerViews.slice();
    layerViews.splice(index, 1);
    return this.updateDesign({
      layerViews: layerViews
    });
  };

  MapLayersDesignerComponent.prototype.handleAddLayerView = function(layer) {
    var layerView, layerViews;
    layerView = {
      id: uuid.v4(),
      name: layer.name,
      desc: "",
      type: layer.type,
      design: layer.design,
      visible: true,
      opacity: 1
    };
    layerViews = this.props.design.layerViews.slice();
    layerViews.push(layerView);
    return this.updateDesign({
      layerViews: layerViews
    });
  };

  MapLayersDesignerComponent.prototype.renderBaseLayer = function(id, name) {
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

  MapLayersDesignerComponent.prototype.renderBaseLayers = function() {
    return H.div({
      style: {
        margin: 5,
        marginBottom: 10
      },
      key: "baseLayers"
    }, this.renderBaseLayer("bing_road", "Roads"), this.renderBaseLayer("bing_aerial", "Satellite"));
  };

  MapLayersDesignerComponent.prototype.renderAddLayer = function() {
    return H.div({
      style: {
        margin: 5
      },
      key: "addLayer",
      className: "btn-group"
    }, H.button({
      type: "button",
      "data-toggle": "dropdown",
      className: "btn btn-default dropdown-toggle"
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Layer ", H.span({
      className: "caret"
    })), H.ul({
      className: "dropdown-menu"
    }, _.map(this.props.layerFactory.getNewLayers(), (function(_this) {
      return function(layer, i) {
        return H.li({
          key: "" + i
        }, H.a({
          onClick: _this.handleAddLayerView.bind(null, layer)
        }, layer.name));
      };
    })(this))));
  };

  MapLayersDesignerComponent.prototype.renderLayerView = function(layerView, index) {
    return H.li({
      className: "list-group-item",
      key: layerView.id
    }, React.createElement(MapLayerViewDesignerComponent, {
      layerView: layerView,
      onLayerViewChange: (function(_this) {
        return function(lv) {
          return _this.handleLayerViewChange(index, lv);
        };
      })(this),
      onRemove: (function(_this) {
        return function() {
          return _this.handleRemoveLayerView(index);
        };
      })(this),
      schema: this.props.schema,
      layerFactory: this.props.layerFactory
    }));
  };

  MapLayersDesignerComponent.prototype.render = function() {
    return H.div({
      style: {
        padding: 5
      }
    }, this.renderBaseLayers(), H.ul({
      className: "list-group"
    }, _.map(this.props.design.layerViews, this.renderLayerView)), this.renderAddLayer());
  };

  return MapLayersDesignerComponent;

})(React.Component);

MapLayerViewDesignerComponent = (function(superClass) {
  extend(MapLayerViewDesignerComponent, superClass);

  MapLayerViewDesignerComponent.propTypes = {
    layerView: React.PropTypes.object.isRequired,
    onLayerViewChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    layerFactory: React.PropTypes.object.isRequired
  };

  function MapLayerViewDesignerComponent() {
    this.handleRename = bind(this.handleRename, this);
    this.handleEditingChange = bind(this.handleEditingChange, this);
    this.handleStartEditing = bind(this.handleStartEditing, this);
    this.handleCancelEditing = bind(this.handleCancelEditing, this);
    this.handleSaveEditing = bind(this.handleSaveEditing, this);
    this.handleVisibleClick = bind(this.handleVisibleClick, this);
    MapLayerViewDesignerComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editingDesign: null
    };
  }

  MapLayerViewDesignerComponent.prototype.update = function(updates) {
    return this.props.onLayerViewChange(_.extend({}, this.props.layerView, updates));
  };

  MapLayerViewDesignerComponent.prototype.handleVisibleClick = function(index) {
    return this.update({
      visible: !this.props.layerView.visible
    });
  };

  MapLayerViewDesignerComponent.prototype.handleSaveEditing = function() {
    this.update({
      design: this.state.editingDesign
    });
    return this.setState({
      editingDesign: null
    });
  };

  MapLayerViewDesignerComponent.prototype.handleCancelEditing = function() {
    return this.setState({
      editingDesign: null
    });
  };

  MapLayerViewDesignerComponent.prototype.handleStartEditing = function() {
    return this.setState({
      editingDesign: this.props.layerView.design
    });
  };

  MapLayerViewDesignerComponent.prototype.handleEditingChange = function(design) {
    return this.setState({
      editingDesign: design
    });
  };

  MapLayerViewDesignerComponent.prototype.handleRename = function() {
    var name;
    name = prompt("Enter new name", this.props.layerView.name);
    if (name) {
      return this.update({
        name: name
      });
    }
  };

  MapLayerViewDesignerComponent.prototype.renderEditor = function() {
    var layer;
    if (this.state.editingDesign == null) {
      return;
    }
    layer = this.props.layerFactory.createLayer(this.props.layerView.type, this.state.editingDesign);
    return React.createElement(ActionCancelModalComponent, {
      title: "Edit Layer",
      onAction: this.handleSaveEditing,
      onCancel: this.handleCancelEditing
    }, layer.createDesignerElement({
      onDesignChange: this.handleEditingChange
    }));
  };

  MapLayerViewDesignerComponent.prototype.renderLayerGearMenu = function() {
    var layer;
    layer = this.props.layerFactory.createLayer(this.props.layerView.type, this.props.layerView.design);
    return H.div({
      className: "btn-group",
      style: {
        float: "right"
      },
      key: "gear"
    }, H.button({
      type: "button",
      className: "btn btn-link dropdown-toggle",
      "data-toggle": "dropdown"
    }, H.span({
      className: "glyphicon glyphicon-cog"
    })), H.ul({
      className: "dropdown-menu dropdown-menu-right"
    }, H.li({
      key: "rename"
    }, H.a({
      onClick: this.handleRename
    }, "Rename Layer")), layer.isEditable() ? H.li({
      key: "edit"
    }, H.a({
      onClick: this.handleStartEditing
    }, "Edit Layer")) : void 0, H.li({
      key: "remove"
    }, H.a({
      onClick: this.props.onRemove
    }, "Remove Layer"))));
  };

  MapLayerViewDesignerComponent.prototype.render = function() {
    var visibleClass;
    visibleClass = this.props.layerView.visible ? "mwater-visualization-layer checked" : "mwater-visualization-layer";
    return H.div(null, this.renderLayerGearMenu(), H.div({
      className: visibleClass,
      onClick: this.handleVisibleClick,
      key: "layerView"
    }, this.props.layerView.name), this.renderEditor());
  };

  return MapLayerViewDesignerComponent;

})(React.Component);

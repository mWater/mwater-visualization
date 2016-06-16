var H, MapLayerViewDesignerComponent, MapLayersDesignerComponent, React, ReorderableListComponent, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

uuid = require('node-uuid');

MapLayerViewDesignerComponent = require('./MapLayerViewDesignerComponent');

ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");

module.exports = MapLayersDesignerComponent = (function(superClass) {
  extend(MapLayersDesignerComponent, superClass);

  function MapLayersDesignerComponent() {
    this.renderLayerView = bind(this.renderLayerView, this);
    this.handleReorder = bind(this.handleReorder, this);
    this.handleAddLayerView = bind(this.handleAddLayerView, this);
    this.handleRemoveLayerView = bind(this.handleRemoveLayerView, this);
    this.handleLayerViewChange = bind(this.handleLayerViewChange, this);
    return MapLayersDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapLayersDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
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

  MapLayersDesignerComponent.prototype.handleRemoveLayerView = function(index) {
    var layerViews;
    layerViews = this.props.design.layerViews.slice();
    layerViews.splice(index, 1);
    return this.updateDesign({
      layerViews: layerViews
    });
  };

  MapLayersDesignerComponent.prototype.handleAddLayerView = function(newLayer) {
    var layer, layerView, layerViews;
    layerView = {
      id: uuid.v4(),
      name: newLayer.name,
      desc: "",
      type: newLayer.type,
      visible: true,
      opacity: 1
    };
    layer = this.props.layerFactory.createLayer(newLayer.type, newLayer.design);
    layerView.design = layer.cleanDesign(newLayer.design);
    layerViews = this.props.design.layerViews.slice();
    layerViews.push(layerView);
    return this.updateDesign({
      layerViews: layerViews
    });
  };

  MapLayersDesignerComponent.prototype.handleReorder = function(layerList) {
    return this.updateDesign({
      layerViews: layerList
    });
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
        }, layer.label || layer.name));
      };
    })(this))));
  };

  MapLayersDesignerComponent.prototype.renderLayerView = function(layerView, index, connectDragSource) {
    var style;
    style = {
      padding: "10px 15px",
      border: "1px solid #ddd",
      marginBottom: -1,
      backgroundColor: "#fff"
    };
    return H.div({
      style: style
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
      layerFactory: this.props.layerFactory,
      connectDragSource: connectDragSource
    }));
  };

  MapLayersDesignerComponent.prototype.render = function() {
    return H.div({
      style: {
        padding: 5
      }
    }, H.div({
      className: "list-group"
    }, React.createElement(ReorderableListComponent, {
      items: this.props.design.layerViews,
      onReorder: this.handleReorder,
      renderItem: this.renderLayerView,
      getItemId: (function(_this) {
        return function(layerView) {
          return layerView.id;
        };
      })(this)
    })), this.renderAddLayer());
  };

  return MapLayersDesignerComponent;

})(React.Component);

var AddLayerComponent, ExprCompiler, LayerFactory, MapLayerViewDesignerComponent, MapLayersDesignerComponent, PropTypes, R, React, ReorderableListComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

LayerFactory = require('./LayerFactory');

AddLayerComponent = require('./AddLayerComponent');

MapLayerViewDesignerComponent = require('./MapLayerViewDesignerComponent');

ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");

ExprCompiler = require('mwater-expressions').ExprCompiler;

module.exports = MapLayersDesignerComponent = (function(superClass) {
  extend(MapLayersDesignerComponent, superClass);

  function MapLayersDesignerComponent() {
    this.renderLayerView = bind(this.renderLayerView, this);
    this.handleReorder = bind(this.handleReorder, this);
    this.handleRemoveLayerView = bind(this.handleRemoveLayerView, this);
    this.handleLayerViewChange = bind(this.handleLayerViewChange, this);
    return MapLayersDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapLayersDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    allowEditingLayers: PropTypes.bool.isRequired,
    filters: PropTypes.array
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

  MapLayersDesignerComponent.prototype.handleReorder = function(layerList) {
    return this.updateDesign({
      layerViews: layerList
    });
  };

  MapLayersDesignerComponent.prototype.renderLayerView = function(layerView, index, connectDragSource, connectDragPreview, connectDropTarget) {
    var exprCompiler, filters, jsonql, style;
    style = {
      padding: "10px 15px",
      border: "1px solid #ddd",
      marginBottom: -1,
      backgroundColor: "#fff"
    };
    filters = _.clone(this.props.filters) || [];
    if (layerView.design.filter != null) {
      exprCompiler = new ExprCompiler(this.props.schema);
      jsonql = exprCompiler.compileExpr({
        expr: layerView.design.filter,
        tableAlias: "{alias}"
      });
      if (jsonql) {
        filters.push({
          table: layerView.design.filter.table,
          jsonql: jsonql
        });
      }
    }
    return R('div', {
      style: style
    }, React.createElement(MapLayerViewDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
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
      connectDragSource: connectDragSource,
      connectDragPreview: connectDragPreview,
      connectDropTarget: connectDropTarget,
      allowEditingLayer: this.props.allowEditingLayers,
      filters: _.compact(filters)
    }));
  };

  MapLayersDesignerComponent.prototype.render = function() {
    return R('div', {
      className: "form-group"
    }, this.props.design.layerViews.length > 0 ? R('div', {
      style: {
        padding: 5
      },
      key: "layers"
    }, R('div', {
      className: "list-group",
      key: "layers",
      style: {
        marginBottom: 10
      }
    }, React.createElement(ReorderableListComponent, {
      items: this.props.design.layerViews,
      onReorder: this.handleReorder,
      renderItem: this.renderLayerView,
      getItemId: (function(_this) {
        return function(layerView) {
          return layerView.id;
        };
      })(this)
    }))) : void 0, this.props.allowEditingLayers ? R(AddLayerComponent, {
      key: "addlayer",
      layerNumber: this.props.design.layerViews.length,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    }) : void 0);
  };

  return MapLayersDesignerComponent;

})(React.Component);

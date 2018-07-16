var ExprCompiler, ExprUtils, H, LayerFactory, LeafletMapComponent, LegendComponent, MapUtils, MapViewComponent, ModalPopupComponent, PropTypes, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

LeafletMapComponent = require('./LeafletMapComponent');

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

LayerFactory = require('./LayerFactory');

ModalPopupComponent = require('react-library/lib/ModalPopupComponent');

MapUtils = require('./MapUtils');

LegendComponent = require('./LegendComponent');

module.exports = MapViewComponent = (function(superClass) {
  extend(MapViewComponent, superClass);

  MapViewComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    mapDataSource: PropTypes.shape({
      getLayerDataSource: PropTypes.func.isRequired,
      getBounds: PropTypes.func.isRequired
    }).isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    onRowClick: PropTypes.func,
    extraFilters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      jsonql: PropTypes.object.isRequired
    })),
    scope: PropTypes.shape({
      name: PropTypes.string.isRequired,
      filter: PropTypes.shape({
        table: PropTypes.string.isRequired,
        jsonql: PropTypes.object.isRequired
      }),
      data: PropTypes.shape({
        layerViewId: PropTypes.string.isRequired,
        data: PropTypes.any
      }).isRequired
    }),
    onScopeChange: PropTypes.func,
    dragging: PropTypes.bool,
    touchZoom: PropTypes.bool,
    scrollWheelZoom: PropTypes.bool,
    zoomLocked: PropTypes.bool
  };

  function MapViewComponent(props) {
    this.handleGridClick = bind(this.handleGridClick, this);
    this.handleBoundsChange = bind(this.handleBoundsChange, this);
    MapViewComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      popupContents: null
    };
  }

  MapViewComponent.prototype.componentDidMount = function() {
    if (this.props.design.autoBounds) {
      return this.performAutoZoom();
    }
  };

  MapViewComponent.prototype.componentDidUpdate = function(prevProps) {
    var ref;
    if (this.props.design.autoBounds) {
      if (!_.isEqual(this.props.design.filters, prevProps.design.filters) || !_.isEqual(this.props.design.globalFilters, prevProps.design.globalFilters) || !_.isEqual(this.props.extraFilters, prevProps.extraFilters) || !prevProps.design.autoBounds) {
        return this.performAutoZoom();
      }
    } else {
      if (!_.isEqual(this.props.design.bounds, prevProps.design.bounds)) {
        return (ref = this.refs.leafletMap) != null ? ref.setBounds(this.props.design.bounds) : void 0;
      }
    }
  };

  MapViewComponent.prototype.performAutoZoom = function() {
    return this.props.mapDataSource.getBounds(this.props.design, this.getCompiledFilters(), (function(_this) {
      return function(error, bounds) {
        var ref;
        if (bounds) {
          if ((ref = _this.refs.leafletMap) != null) {
            ref.setBounds(bounds, 0.2);
          }
          if (_this.props.onDesignChange != null) {
            return _this.props.onDesignChange(_.extend({}, _this.props.design, {
              bounds: bounds
            }));
          }
        }
      };
    })(this));
  };

  MapViewComponent.prototype.handleBoundsChange = function(bounds) {
    var design;
    if (this.props.onDesignChange == null) {
      return;
    }
    if (this.props.zoomLocked) {
      return;
    }
    if (this.props.design.autoBounds) {
      return;
    }
    design = _.extend({}, this.props.design, {
      bounds: bounds
    });
    return this.props.onDesignChange(design);
  };

  MapViewComponent.prototype.handleGridClick = function(layerViewId, ev) {
    var design, layer, layerView, ref, ref1, results, scope;
    layerView = _.findWhere(this.props.design.layerViews, {
      id: layerViewId
    });
    layer = LayerFactory.createLayer(layerView.type);
    design = layer.cleanDesign(layerView.design, this.props.schema);
    results = layer.onGridClick(ev, {
      design: design,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      layerDataSource: this.props.mapDataSource.getLayerDataSource(layerViewId),
      scopeData: ((ref = this.props.scope) != null ? (ref1 = ref.data) != null ? ref1.layerViewId : void 0 : void 0) === layerViewId ? this.props.scope.data.data : void 0,
      filters: this.getCompiledFilters()
    });
    if (!results) {
      return;
    }
    if (results.popup) {
      this.setState({
        popupContents: results.popup
      });
    }
    if (results.row && this.props.onRowClick) {
      this.props.onRowClick(results.row.tableId, results.row.primaryKey);
    }
    if (this.props.onScopeChange && _.has(results, "scope")) {
      if (results.scope) {
        scope = {
          name: results.scope.name,
          filter: results.scope.filter,
          data: {
            layerViewId: layerViewId,
            data: results.scope.data
          }
        };
      } else {
        scope = null;
      }
      return this.props.onScopeChange(scope);
    }
  };

  MapViewComponent.prototype.getCompiledFilters = function() {
    return (this.props.extraFilters || []).concat(MapUtils.getCompiledFilters(this.props.design, this.props.schema, MapUtils.getFilterableTables(this.props.design, this.props.schema)));
  };

  MapViewComponent.prototype.renderLegend = function() {
    return R(LegendComponent, {
      schema: this.props.schema,
      layerViews: this.props.design.layerViews,
      filters: this.getCompiledFilters(),
      dataSource: this.props.dataSource
    });
  };

  MapViewComponent.prototype.renderPopup = function() {
    if (!this.state.popupContents) {
      return null;
    }
    return R(ModalPopupComponent, {
      onClose: (function(_this) {
        return function() {
          return _this.setState({
            popupContents: null
          });
        };
      })(this),
      showCloseX: true,
      size: "large"
    }, this.state.popupContents, H.div({
      style: {
        textAlign: "right",
        marginTop: 10
      }
    }, H.button({
      className: "btn btn-default",
      onClick: ((function(_this) {
        return function() {
          return _this.setState({
            popupContents: null
          });
        };
      })(this))
    }, "Close")));
  };

  MapViewComponent.prototype.render = function() {
    var compiledFilters, design, i, index, isScoping, layer, layerDataSource, layerView, leafletLayer, leafletLayers, len, ref, scopedCompiledFilters;
    compiledFilters = this.getCompiledFilters();
    if (this.props.scope) {
      scopedCompiledFilters = compiledFilters.concat([this.props.scope.filter]);
    } else {
      scopedCompiledFilters = compiledFilters;
    }
    leafletLayers = [];
    ref = this.props.design.layerViews;
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      layerView = ref[index];
      layer = LayerFactory.createLayer(layerView.type);
      design = layer.cleanDesign(layerView.design, this.props.schema);
      if (layer.validateDesign(design, this.props.schema)) {
        continue;
      }
      layerDataSource = this.props.mapDataSource.getLayerDataSource(layerView.id);
      isScoping = this.props.scope && this.props.scope.data.layerViewId === layerView.id;
      leafletLayer = {
        tileUrl: layerDataSource.getTileUrl(design, isScoping ? compiledFilters : scopedCompiledFilters),
        utfGridUrl: layerDataSource.getUtfGridUrl(design, isScoping ? compiledFilters : scopedCompiledFilters),
        visible: layerView.visible,
        opacity: isScoping ? layerView.opacity * 0.3 : layerView.opacity,
        minZoom: layer.getMinZoom(design),
        maxZoom: layer.getMaxZoom(design),
        onGridClick: this.handleGridClick.bind(null, layerView.id)
      };
      leafletLayers.push(leafletLayer);
      if (isScoping) {
        leafletLayer = {
          tileUrl: layerDataSource.getTileUrl(design, scopedCompiledFilters),
          utfGridUrl: layerDataSource.getUtfGridUrl(design, scopedCompiledFilters),
          visible: layerView.visible,
          opacity: layerView.opacity,
          minZoom: layer.getMinZoom(design),
          maxZoom: layer.getMaxZoom(design),
          onGridClick: this.handleGridClick.bind(null, layerView.id)
        };
        leafletLayers.push(leafletLayer);
      }
    }
    return H.div({
      style: {
        width: this.props.width,
        height: this.props.height,
        position: 'relative'
      }
    }, this.renderPopup(), R(LeafletMapComponent, {
      ref: "leafletMap",
      initialBounds: this.props.design.bounds,
      baseLayerId: this.props.design.baseLayer,
      layers: leafletLayers,
      width: this.props.width,
      height: this.props.height,
      legend: this.renderLegend(),
      dragging: this.props.dragging,
      touchZoom: this.props.touchZoom,
      scrollWheelZoom: this.props.scrollWheelZoom,
      onBoundsChange: this.handleBoundsChange,
      extraAttribution: this.props.design.attribution,
      loadingSpinner: true,
      maxZoom: this.props.design.maxZoom
    }));
  };

  return MapViewComponent;

})(React.Component);

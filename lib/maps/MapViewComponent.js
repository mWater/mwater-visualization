"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ExprCompiler,
    ExprUtils,
    LayerFactory,
    LeafletMapComponent,
    LegendComponent,
    MapUtils,
    MapViewComponent,
    ModalPopupComponent,
    PropTypes,
    R,
    React,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
LeafletMapComponent = require('./LeafletMapComponent');
ExprUtils = require('mwater-expressions').ExprUtils;
ExprCompiler = require('mwater-expressions').ExprCompiler;
LayerFactory = require('./LayerFactory');
ModalPopupComponent = require('react-library/lib/ModalPopupComponent');
MapUtils = require('./MapUtils');
LegendComponent = require('./LegendComponent'); // Component that displays just the map

module.exports = MapViewComponent = function () {
  var MapViewComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MapViewComponent, _React$Component);

    var _super = _createSuper(MapViewComponent);

    function MapViewComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, MapViewComponent);
      _this = _super.call(this, props);
      _this.handleBoundsChange = _this.handleBoundsChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleGridClick = _this.handleGridClick.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        popupContents: null // Element in the popup

      };
      return _this;
    }

    (0, _createClass2["default"])(MapViewComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        // Autozoom
        if (this.props.design.autoBounds) {
          return this.performAutoZoom();
        }
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        var ref;

        if (this.props.design.autoBounds) {
          // Autozoom if filters or autozoom changed
          if (!_.isEqual(this.props.design.filters, prevProps.design.filters) || !_.isEqual(this.props.design.globalFilters, prevProps.design.globalFilters) || !_.isEqual(this.props.extraFilters, prevProps.extraFilters) || !prevProps.design.autoBounds) {
            return this.performAutoZoom();
          }
        } else {
          // Update bounds
          if (!_.isEqual(this.props.design.bounds, prevProps.design.bounds)) {
            return (ref = this.leafletMap) != null ? ref.setBounds(this.props.design.bounds) : void 0;
          }
        }
      }
    }, {
      key: "performAutoZoom",
      value: function performAutoZoom() {
        var _this2 = this;

        return this.props.mapDataSource.getBounds(this.props.design, this.getCompiledFilters(), function (error, bounds) {
          var ref;

          if (bounds) {
            if ((ref = _this2.leafletMap) != null) {
              ref.setBounds(bounds, 0.2);
            } // Also record if editable as part of bounds


            if (_this2.props.onDesignChange != null) {
              return _this2.props.onDesignChange(_.extend({}, _this2.props.design, {
                bounds: bounds
              }));
            }
          }
        });
      }
    }, {
      key: "handleBoundsChange",
      value: function handleBoundsChange(bounds) {
        var design;
        boundMethodCheck(this, MapViewComponent); // Ignore if readonly

        if (this.props.onDesignChange == null) {
          return;
        }

        if (this.props.zoomLocked) {
          return;
        } // Ignore if autoBounds


        if (this.props.design.autoBounds) {
          return;
        }

        design = _.extend({}, this.props.design, {
          bounds: bounds
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleGridClick",
      value: function handleGridClick(layerViewId, ev) {
        var design, layer, layerView, ref, ref1, results, scope;
        boundMethodCheck(this, MapViewComponent);
        layerView = _.findWhere(this.props.design.layerViews, {
          id: layerViewId
        }); // Create layer

        layer = LayerFactory.createLayer(layerView.type); // Clean design (prevent ever displaying invalid/legacy designs)

        design = layer.cleanDesign(layerView.design, this.props.schema); // Handle click of layer

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
        } // Handle popup first


        if (results.popup) {
          this.setState({
            popupContents: results.popup
          });
        } // Handle onRowClick case


        if (results.row && this.props.onRowClick) {
          this.props.onRowClick(results.row.tableId, results.row.primaryKey);
        } // Handle scoping


        if (this.props.onScopeChange && _.has(results, "scope")) {
          if (results.scope) {
            // Encode layer view id into scope
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
      } // Get filters from extraFilters combined with map filters

    }, {
      key: "getCompiledFilters",
      value: function getCompiledFilters() {
        return (this.props.extraFilters || []).concat(MapUtils.getCompiledFilters(this.props.design, this.props.schema, MapUtils.getFilterableTables(this.props.design, this.props.schema)));
      }
    }, {
      key: "renderLegend",
      value: function renderLegend() {
        return R(LegendComponent, {
          schema: this.props.schema,
          layerViews: this.props.design.layerViews,
          filters: this.getCompiledFilters(),
          dataSource: this.props.dataSource,
          locale: this.context.locale
        });
      }
    }, {
      key: "renderPopup",
      value: function renderPopup() {
        var _this3 = this;

        if (!this.state.popupContents) {
          return null;
        }

        return R(ModalPopupComponent, {
          onClose: function onClose() {
            return _this3.setState({
              popupContents: null
            });
          },
          showCloseX: true,
          size: "large" // Render in fixed height div so that dashboard doesn't collapse to nothing

        }, R('div', {
          style: {
            height: "80vh"
          }
        }, this.state.popupContents), R('div', {
          style: {
            textAlign: "right",
            marginTop: 10
          }
        }, R('button', {
          className: "btn btn-default",
          onClick: function onClick() {
            return _this3.setState({
              popupContents: null
            });
          }
        }, "Close")));
      }
    }, {
      key: "render",
      value: function render() {
        var _this4 = this;

        var compiledFilters, design, i, index, isScoping, layer, layerDataSource, layerView, leafletLayer, leafletLayers, len, ref, scopedCompiledFilters;
        compiledFilters = this.getCompiledFilters(); // Determine scoped filters

        if (this.props.scope) {
          scopedCompiledFilters = compiledFilters.concat([this.props.scope.filter]);
        } else {
          scopedCompiledFilters = compiledFilters;
        } // Convert to leaflet layers, if layers are valid


        leafletLayers = [];
        ref = this.props.design.layerViews;

        for (index = i = 0, len = ref.length; i < len; index = ++i) {
          layerView = ref[index]; // Create layer

          layer = LayerFactory.createLayer(layerView.type); // Clean design (prevent ever displaying invalid/legacy designs)

          design = layer.cleanDesign(layerView.design, this.props.schema); // Ignore if invalid

          if (layer.validateDesign(design, this.props.schema)) {
            continue;
          } // Get layer data source


          layerDataSource = this.props.mapDataSource.getLayerDataSource(layerView.id); // If layer is scoping, fade opacity and add extra filtered version

          isScoping = this.props.scope && this.props.scope.data.layerViewId === layerView.id; // Create leafletLayer

          leafletLayer = {
            tileUrl: layerDataSource.getTileUrl(design, isScoping ? compiledFilters : scopedCompiledFilters),
            utfGridUrl: layerDataSource.getUtfGridUrl(design, isScoping ? compiledFilters : scopedCompiledFilters),
            visible: layerView.visible,
            opacity: isScoping ? layerView.opacity * 0.3 : layerView.opacity,
            minZoom: layer.getMinZoom(design),
            maxZoom: layer.getMaxZoom(design),
            onGridClick: this.handleGridClick.bind(null, layerView.id)
          };
          leafletLayers.push(leafletLayer); // Add scoped layer if scoping

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

        return R('div', {
          style: {
            width: this.props.width,
            height: this.props.height,
            position: 'relative'
          }
        }, this.renderPopup(), R(LeafletMapComponent, {
          ref: function ref(c) {
            return _this4.leafletMap = c;
          },
          initialBounds: this.props.design.bounds,
          baseLayerId: this.props.design.baseLayer,
          baseLayerOpacity: this.props.design.baseLayerOpacity,
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
      }
    }]);
    return MapViewComponent;
  }(React.Component);

  ;
  MapViewComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // data source to use
    // Url source for the map
    mapDataSource: PropTypes.shape({
      // Gets the data source for a layer
      getLayerDataSource: PropTypes.func.isRequired,
      // Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }
      getBounds: PropTypes.func.isRequired
    }).isRequired,
    design: PropTypes.object.isRequired,
    // See Map Design.md
    onDesignChange: PropTypes.func,
    // Called with new design. null/undefined to ignore bounds changes
    width: PropTypes.number,
    // Width in pixels
    height: PropTypes.number,
    // Height in pixels
    onRowClick: PropTypes.func,
    // Called with (tableId, rowId) when item is clicked
    extraFilters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      jsonql: PropTypes.object.isRequired // Extra filters to apply to view

    })),
    // scope of the map (when a layer self-selects a particular scope)
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
    // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
    dragging: PropTypes.bool,
    // Whether the map be draggable with mouse/touch or not. Default true
    touchZoom: PropTypes.bool,
    // Whether the map can be zoomed by touch-dragging with two fingers. Default true
    scrollWheelZoom: PropTypes.bool,
    // Whether the map can be zoomed by using the mouse wheel. Default true
    zoomLocked: PropTypes.bool // Whether changes to zoom level should be persisted. Default false

  };
  MapViewComponent.contextTypes = {
    locale: PropTypes.string
  };
  return MapViewComponent;
}.call(void 0);
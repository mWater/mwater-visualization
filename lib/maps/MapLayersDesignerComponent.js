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

var AddLayerComponent,
    ExprCleaner,
    ExprCompiler,
    LayerFactory,
    MapLayerViewDesignerComponent,
    MapLayersDesignerComponent,
    PropTypes,
    R,
    React,
    ReorderableListComponent,
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
LayerFactory = require('./LayerFactory');
AddLayerComponent = require('./AddLayerComponent');
MapLayerViewDesignerComponent = require('./MapLayerViewDesignerComponent');
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprCleaner = require("mwater-expressions").ExprCleaner; // Designer for layer selection in the map

module.exports = MapLayersDesignerComponent = function () {
  var MapLayersDesignerComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MapLayersDesignerComponent, _React$Component);

    var _super = _createSuper(MapLayersDesignerComponent);

    function MapLayersDesignerComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, MapLayersDesignerComponent);
      _this = _super.apply(this, arguments);
      _this.handleLayerViewChange = _this.handleLayerViewChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRemoveLayerView = _this.handleRemoveLayerView.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleReorder = _this.handleReorder.bind((0, _assertThisInitialized2["default"])(_this));
      _this.renderLayerView = _this.renderLayerView.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    } // Updates design with the specified changes


    (0, _createClass2["default"])(MapLayersDesignerComponent, [{
      key: "updateDesign",
      value: function updateDesign(changes) {
        var design;
        design = _.extend({}, this.props.design, changes);
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleLayerViewChange",
      value: function handleLayerViewChange(index, layerView) {
        var layerViews;
        boundMethodCheck(this, MapLayersDesignerComponent);
        layerViews = this.props.design.layerViews.slice(); // Update self

        layerViews[index] = layerView; // Unselect any in same group if selected

        if (layerView.group && layerView.visible) {
          _.each(this.props.design.layerViews, function (lv, i) {
            if (lv.visible && i !== index && lv.group === layerView.group) {
              return layerViews[i] = _.extend({}, lv, {
                visible: false
              });
            }
          });
        }

        return this.updateDesign({
          layerViews: layerViews
        });
      }
    }, {
      key: "handleRemoveLayerView",
      value: function handleRemoveLayerView(index) {
        var layerViews;
        boundMethodCheck(this, MapLayersDesignerComponent);
        layerViews = this.props.design.layerViews.slice();
        layerViews.splice(index, 1);
        return this.updateDesign({
          layerViews: layerViews
        });
      }
    }, {
      key: "handleReorder",
      value: function handleReorder(layerList) {
        boundMethodCheck(this, MapLayersDesignerComponent);
        return this.updateDesign({
          layerViews: layerList
        });
      }
    }, {
      key: "renderLayerView",
      value: function renderLayerView(layerView, index, connectDragSource, connectDragPreview, connectDropTarget) {
        var _this2 = this;

        var exprCleaner, exprCompiler, filter, filters, jsonql, style;
        boundMethodCheck(this, MapLayersDesignerComponent);
        style = {
          padding: "10px 15px",
          border: "1px solid #ddd",
          marginBottom: -1,
          backgroundColor: "#fff"
        };
        filters = _.clone(this.props.filters) || [];

        if (layerView.design.filter != null) {
          exprCompiler = new ExprCompiler(this.props.schema);
          exprCleaner = new ExprCleaner(this.props.schema); // Clean filter first

          filter = exprCleaner.cleanExpr(layerView.design.filter, {
            types: ["boolean"]
          });

          if (filter) {
            jsonql = exprCompiler.compileExpr({
              expr: filter,
              tableAlias: "{alias}"
            });

            if (jsonql) {
              filters.push({
                table: filter.table,
                jsonql: jsonql
              });
            }
          }
        }

        return R('div', {
          style: style
        }, React.createElement(MapLayerViewDesignerComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          layerView: layerView,
          onLayerViewChange: function onLayerViewChange(lv) {
            return _this2.handleLayerViewChange(index, lv);
          },
          onRemove: function onRemove() {
            return _this2.handleRemoveLayerView(index);
          },
          connectDragSource: connectDragSource,
          connectDragPreview: connectDragPreview,
          connectDropTarget: connectDropTarget,
          allowEditingLayer: this.props.allowEditingLayers,
          filters: _.compact(filters)
        }));
      }
    }, {
      key: "render",
      value: function render() {
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
          } // _.map(@props.design.layerViews, @renderLayerView)

        }, React.createElement(ReorderableListComponent, {
          items: this.props.design.layerViews,
          onReorder: this.handleReorder,
          renderItem: this.renderLayerView,
          getItemId: function getItemId(layerView) {
            return layerView.id;
          }
        }))) : void 0, this.props.allowEditingLayers ? R(AddLayerComponent, {
          key: "addlayer",
          layerNumber: this.props.design.layerViews.length,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.props.design,
          onDesignChange: this.props.onDesignChange
        }) : void 0);
      }
    }]);
    return MapLayersDesignerComponent;
  }(React.Component);

  ;
  MapLayersDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    // See Map Design.md
    onDesignChange: PropTypes.func.isRequired,
    // Called with new design
    allowEditingLayers: PropTypes.bool.isRequired,
    // True to allow editing layers
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return MapLayersDesignerComponent;
}.call(void 0);
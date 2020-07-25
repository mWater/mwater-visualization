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

var ActionCancelModalComponent,
    LayerFactory,
    MapLayerViewDesignerComponent,
    PropTypes,
    R,
    Rcslider,
    React,
    _,
    ui,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');
Rcslider = require('rc-slider')["default"];
LayerFactory = require('./LayerFactory');
ui = require('react-library/lib/bootstrap'); // A single row in the table of layer views. Handles the editor state

module.exports = MapLayerViewDesignerComponent = function () {
  var MapLayerViewDesignerComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MapLayerViewDesignerComponent, _React$Component);

    var _super = _createSuper(MapLayerViewDesignerComponent);

    function MapLayerViewDesignerComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, MapLayerViewDesignerComponent);
      var layer;
      _this = _super.call(this, props);
      _this.handleVisibleClick = _this.handleVisibleClick.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleHideLegend = _this.handleHideLegend.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleToggleEditing = _this.handleToggleEditing.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleSaveEditing = _this.handleSaveEditing.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRename = _this.handleRename.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleOpacityChange = _this.handleOpacityChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRemove = _this.handleRemove.bind((0, _assertThisInitialized2["default"])(_this));
      layer = LayerFactory.createLayer(_this.props.layerView.type);
      _this.state = {
        editing: props.allowEditingLayer && layer.isIncomplete(_this.props.layerView.design, _this.props.schema) // Editing initially if incomplete

      };
      return _this;
    }

    (0, _createClass2["default"])(MapLayerViewDesignerComponent, [{
      key: "update",
      value: function update(updates) {
        return this.props.onLayerViewChange(_.extend({}, this.props.layerView, updates));
      }
    }, {
      key: "handleVisibleClick",
      value: function handleVisibleClick() {
        boundMethodCheck(this, MapLayerViewDesignerComponent);
        return this.update({
          visible: !this.props.layerView.visible
        });
      }
    }, {
      key: "handleHideLegend",
      value: function handleHideLegend(hideLegend) {
        boundMethodCheck(this, MapLayerViewDesignerComponent);
        return this.update({
          hideLegend: hideLegend
        });
      }
    }, {
      key: "handleToggleEditing",
      value: function handleToggleEditing() {
        boundMethodCheck(this, MapLayerViewDesignerComponent);
        return this.setState({
          editing: !this.state.editing
        });
      }
    }, {
      key: "handleSaveEditing",
      value: function handleSaveEditing(design) {
        boundMethodCheck(this, MapLayerViewDesignerComponent);
        return this.update({
          design: design
        });
      }
    }, {
      key: "handleRename",
      value: function handleRename() {
        var name;
        boundMethodCheck(this, MapLayerViewDesignerComponent);

        if (this.props.allowEditingLayer) {
          name = prompt("Enter new name", this.props.layerView.name);

          if (name) {
            return this.update({
              name: name
            });
          }
        }
      }
    }, {
      key: "renderVisible",
      value: function renderVisible() {
        if (this.props.layerView.visible) {
          return R('i', {
            className: "fa fa-fw fa-check-square",
            style: {
              color: "#2E6DA4"
            },
            onClick: this.handleVisibleClick
          });
        } else {
          return R('i', {
            className: "fa fa-fw fa-square",
            style: {
              color: "#DDDDDD"
            },
            onClick: this.handleVisibleClick
          });
        }
      }
    }, {
      key: "renderHideLegend",
      value: function renderHideLegend() {
        return R(ui.Checkbox, {
          value: this.props.layerView.hideLegend,
          onChange: this.handleHideLegend
        }, "Hide Legend");
      }
    }, {
      key: "renderName",
      value: function renderName() {
        return R('span', {
          className: "hover-display-parent",
          onClick: this.handleRename,
          style: {
            cursor: "pointer"
          }
        }, this.props.layerView.name, " ", R('span', {
          className: "hover-display-child glyphicon glyphicon-pencil text-muted"
        }));
      }
    }, {
      key: "renderEditor",
      value: function renderEditor() {
        var layer;
        layer = LayerFactory.createLayer(this.props.layerView.type);
        return R('div', null, layer.isEditable() ? layer.createDesignerElement({
          design: this.props.layerView.design,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onDesignChange: this.handleSaveEditing,
          filters: this.props.filters
        }) : void 0, this.renderOpacityControl(), this.renderHideLegend());
      }
    }, {
      key: "renderLayerEditToggle",
      value: function renderLayerEditToggle() {
        return R('div', {
          key: "edit",
          style: {
            marginBottom: this.state.editing ? 10 : void 0
          }
        }, R('a', {
          onClick: this.handleToggleEditing,
          style: {
            fontSize: 12,
            cursor: "pointer"
          }
        }, this.state.editing ? [R('i', {
          className: "fa fa-caret-up"
        }), " Close"] : [R('i', {
          className: "fa fa-cog"
        }), " Customize..."]));
      }
    }, {
      key: "handleOpacityChange",
      value: function handleOpacityChange(newValue) {
        boundMethodCheck(this, MapLayerViewDesignerComponent);
        return this.update({
          opacity: newValue / 100
        });
      }
    }, {
      key: "handleRemove",
      value: function handleRemove() {
        boundMethodCheck(this, MapLayerViewDesignerComponent);

        if (confirm("Delete layer?")) {
          return this.props.onRemove();
        }
      }
    }, {
      key: "renderOpacityControl",
      value: function renderOpacityControl() {
        return R('div', {
          className: 'form-group',
          style: {
            paddingTop: 10
          }
        }, R('label', {
          className: 'text-muted'
        }, R('span', null, "Opacity: ".concat(Math.round(this.props.layerView.opacity * 100), "%"))), R('div', {
          style: {
            padding: '10px'
          }
        }, React.createElement(Rcslider, {
          min: 0,
          max: 100,
          step: 1,
          tipTransitionName: "rc-slider-tooltip-zoom-down",
          value: this.props.layerView.opacity * 100,
          onChange: this.handleOpacityChange
        })));
      }
    }, {
      key: "renderDeleteLayer",
      value: function renderDeleteLayer() {
        return R('div', {
          style: {
            "float": "right",
            cursor: "pointer",
            marginLeft: 10
          },
          key: "delete"
        }, R('a', {
          onClick: this.handleRemove
        }, R('i', {
          className: "fa fa-remove"
        })));
      }
    }, {
      key: "render",
      value: function render() {
        var layer, style;
        layer = LayerFactory.createLayer(this.props.layerView.type);
        style = {
          cursor: "move",
          marginRight: 8,
          opacity: 0.5
        }; // float: "right"

        return this.props.connectDragPreview(this.props.connectDropTarget(R('div', null, R('div', {
          style: {
            fontSize: 16
          },
          key: "layerView"
        }, this.props.connectDragSource ? this.props.connectDragSource(R('i', {
          className: "fa fa-bars",
          style: style
        })) : void 0, this.props.allowEditingLayer ? this.renderDeleteLayer() : void 0, this.renderVisible(), "\xA0", this.renderName()), this.props.allowEditingLayer ? this.renderLayerEditToggle() : void 0, this.state.editing ? this.renderEditor() : void 0)));
      }
    }]);
    return MapLayerViewDesignerComponent;
  }(React.Component);

  ;
  MapLayerViewDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    layerView: PropTypes.object.isRequired,
    // See Map Design.md
    onLayerViewChange: PropTypes.func.isRequired,
    // Called with new layer view
    onRemove: PropTypes.func.isRequired,
    // Called to remove
    connectDragSource: PropTypes.func,
    // connector for reorderable
    connectDragPreview: PropTypes.func,
    //connector for reorderable
    connectDropTarget: PropTypes.func,
    // connector for reorderable
    allowEditingLayer: PropTypes.bool.isRequired,
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return MapLayerViewDesignerComponent;
}.call(void 0);
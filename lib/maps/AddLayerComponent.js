"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var AddLayerComponent,
    LayerFactory,
    PropTypes,
    R,
    React,
    _,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
uuid = require('uuid');
LayerFactory = require('./LayerFactory'); // Dropdown to add a new layer. 
// Can be overridden by context of addLayerElementFactory which is called with all props

module.exports = AddLayerComponent = function () {
  var AddLayerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(AddLayerComponent, _React$Component);

    function AddLayerComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, AddLayerComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(AddLayerComponent).apply(this, arguments));
      _this.handleAddLayer = _this.handleAddLayer.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleAddLayerView = _this.handleAddLayerView.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(AddLayerComponent, [{
      key: "handleAddLayer",
      value: function handleAddLayer(newLayer) {
        var layer, layerView;
        boundMethodCheck(this, AddLayerComponent);
        layerView = {
          id: uuid(),
          name: newLayer.name,
          desc: "",
          type: newLayer.type,
          visible: true,
          opacity: 1
        }; // Clean design to make valid

        layer = LayerFactory.createLayer(layerView.type);
        layerView.design = layer.cleanDesign(newLayer.design, this.props.schema);
        return this.handleAddLayerView(layerView);
      }
    }, {
      key: "handleAddLayerView",
      value: function handleAddLayerView(layerView) {
        var design, layerViews;
        boundMethodCheck(this, AddLayerComponent); // Add to list

        layerViews = this.props.design.layerViews.slice();
        layerViews.push(layerView);
        design = _.extend({}, this.props.design, {
          layerViews: layerViews
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var newLayers;

        if (this.context.addLayerElementFactory) {
          return this.context.addLayerElementFactory(this.props);
        }

        newLayers = [{
          label: "Marker Layer",
          name: "Untitled Layer",
          type: "Markers",
          design: {}
        }, {
          label: "Radius (circles) Layer",
          name: "Untitled Layer",
          type: "Buffer",
          design: {}
        }, {
          label: "Choropleth Layer",
          name: "Untitled Layer",
          type: "AdminChoropleth",
          design: {}
        }, {
          label: "Cluster Layer",
          name: "Untitled Layer",
          type: "Cluster",
          design: {}
        }, {
          label: "Grid Layer",
          name: "Untitled Layer",
          type: "Grid",
          design: {}
        }, {
          label: "Custom Tile Url (advanced)",
          name: "Untitled Layer",
          type: "TileUrl",
          design: {}
        }];
        return R('div', {
          style: {
            margin: 5
          },
          key: "addLayer",
          className: "btn-group"
        }, R('button', {
          type: "button",
          "data-toggle": "dropdown",
          className: "btn btn-primary dropdown-toggle"
        }, R('span', {
          className: "glyphicon glyphicon-plus"
        }), " Add Layer ", R('span', {
          className: "caret"
        })), R('ul', {
          className: "dropdown-menu"
        }, _.map(newLayers, function (layer, i) {
          return R('li', {
            key: "" + i
          }, R('a', {
            onClick: _this2.handleAddLayer.bind(null, layer)
          }, layer.label || layer.name));
        })));
      }
    }]);
    return AddLayerComponent;
  }(React.Component);

  ;
  AddLayerComponent.propTypes = {
    layerNumber: PropTypes.number.isRequired,
    // Number of layers that already exist
    design: PropTypes.object.isRequired,
    // See Map Design.md
    onDesignChange: PropTypes.func.isRequired,
    // Called with new design
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired
  };
  AddLayerComponent.contextTypes = {
    addLayerElementFactory: PropTypes.func // Can be overridden by setting addLayerElementFactory in context that takes ({schema: , dataSource, design, onDesignChange, layerNumber})

  };
  return AddLayerComponent;
}.call(void 0);
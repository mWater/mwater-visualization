"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var $, ExprCompiler, Layer, LoadingLegend, MWaterServerLayer, PropTypes, R, React, injectTableAlias;
$ = require('jquery');
PropTypes = require('prop-types');
Layer = require('./Layer');
ExprCompiler = require('mwater-expressions').ExprCompiler;
injectTableAlias = require('mwater-expressions').injectTableAlias;
React = require('react');
R = React.createElement; // TODO DEPRECATED. REPLACE WITH REAL MARKER AND BUFFER LAYERS
// Layer defined on the mWater server
// Design is:
// type: type of layer on server
// table: table to filter on (e.g. entities.water_point)
// minZoom: optional minimum zoom
// maxZoom: optional maximum zoom

module.exports = MWaterServerLayer =
/*#__PURE__*/
function (_Layer) {
  (0, _inherits2["default"])(MWaterServerLayer, _Layer);

  function MWaterServerLayer() {
    (0, _classCallCheck2["default"])(this, MWaterServerLayer);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(MWaterServerLayer).apply(this, arguments));
  }

  (0, _createClass2["default"])(MWaterServerLayer, [{
    key: "onGridClick",
    // Called when the interactivity grid is clicked. 
    // arguments:
    //   ev: { data: interactivty data e.g. `{ id: 123 }` }
    //   options: 
    //     design: design of layer
    //     schema: schema to use
    //     dataSource: data source to use
    //     filters: compiled filters to apply to the popup
    // Returns:
    //   null/undefined to do nothing
    //   [table id, primary key] to open a default system popup if one is present
    //   React element to put into a popup
    value: function onGridClick(ev, options) {
      if (ev.data && ev.data.id) {
        return {
          row: {
            tableId: options.design.table,
            primaryKey: ev.data.id
          }
        };
      }

      return null;
    } // Get min and max zoom levels

  }, {
    key: "getMinZoom",
    value: function getMinZoom(design) {
      return design.minZoom;
    }
  }, {
    key: "getMaxZoom",
    value: function getMaxZoom(design) {
      return design.maxZoom;
    } // Get the legend to be optionally displayed on the map. Returns
    // a React element

  }, {
    key: "getLegend",
    value: function getLegend(design, schema) {
      var apiUrl; // Create loading legend component
      // TODO hardcoded

      apiUrl = "https://api.mwater.co/v3/";
      return React.createElement(LoadingLegend, {
        url: "".concat(apiUrl, "maps/legend?type=").concat(design.type)
      });
    } // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      if (design.table) {
        return [design.table];
      } else {
        return [];
      }
    } // True if layer can be edited

  }, {
    key: "isEditable",
    value: function isEditable() {
      return false;
    } // Returns a cleaned design

  }, {
    key: "cleanDesign",
    value: function cleanDesign(design, schema) {
      return design;
    } // Validates design. Null if ok, message otherwise

  }, {
    key: "validateDesign",
    value: function validateDesign(design, schema) {
      return null;
    }
  }]);
  return MWaterServerLayer;
}(Layer);

LoadingLegend = function () {
  // Simple class to load legend from server
  var LoadingLegend =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(LoadingLegend, _React$Component);

    function LoadingLegend(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, LoadingLegend);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(LoadingLegend).call(this, props));
      _this.state = {
        html: "Loading..."
      };
      return _this;
    }

    (0, _createClass2["default"])(LoadingLegend, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        return $.get(this.props.url).done(function (data) {
          return _this2.setState({
            html: data
          });
        });
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        var _this3 = this;

        if (nextProps.url !== this.props.url) {
          return $.get(nextProps.url).done(function (data) {
            return _this3.setState({
              html: data
            });
          });
        }
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            font: "14px/16px Arial, Helvetica, sans-serif",
            color: "#555"
          },
          dangerouslySetInnerHTML: {
            __html: this.state.html
          }
        });
      }
    }]);
    return LoadingLegend;
  }(React.Component);

  ;
  LoadingLegend.propTypes = {
    url: PropTypes.string
  };
  return LoadingLegend;
}.call(void 0);
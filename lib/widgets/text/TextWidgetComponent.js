"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AsyncLoadComponent, PropTypes, R, React, TextComponent, TextWidget, TextWidgetComponent, _;

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');
TextComponent = require('./TextComponent');
TextWidget = require('./TextWidget');
AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent'); // Widget which displays styled text with embedded expressions

module.exports = TextWidgetComponent = function () {
  var TextWidgetComponent =
  /*#__PURE__*/
  function (_AsyncLoadComponent) {
    (0, _inherits2.default)(TextWidgetComponent, _AsyncLoadComponent);

    function TextWidgetComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, TextWidgetComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(TextWidgetComponent).call(this, props));
      _this.state = {
        // Map of expression id to expression value
        exprValues: {},
        error: null,
        cacheExpiry: props.dataSource.getCacheExpiry() // Save cache expiry to see if changes

      };
      return _this;
    } // Override to determine if a load is needed. Not called on mounting


    (0, _createClass2.default)(TextWidgetComponent, [{
      key: "isLoadNeeded",
      value: function isLoadNeeded(newProps, oldProps) {
        var _getExprItems; // Get expression items recursively


        _getExprItems = function getExprItems(items) {
          var exprItems, i, item, len, ref;
          exprItems = [];
          ref = items || [];

          for (i = 0, len = ref.length; i < len; i++) {
            item = ref[i];

            if (item.type === "expr") {
              exprItems.push(item);
            }

            if (item.items) {
              exprItems = exprItems.concat(_getExprItems(item.items));
            }
          }

          return exprItems;
        }; // Reload if filters or expressions have changed or cache expiry


        return !_.isEqual(newProps.filters, oldProps.filters) || !_.isEqual(_getExprItems(newProps.design.items), _getExprItems(oldProps.design.items)) || newProps.dataSource.getCacheExpiry() !== this.state.cacheExpiry;
      } // Call callback with state changes

    }, {
      key: "load",
      value: function load(props, prevProps, callback) {
        var widget; // Shortcut if no expressions in text widget

        widget = new TextWidget();

        if (widget.getExprItems(props.design.items).length === 0) {
          callback({
            error: null,
            exprValues: {}
          }, props.dataSource.getCacheExpiry());
          return;
        } // Get data


        return props.widgetDataSource.getData(props.design, props.filters, function (error, data) {
          return callback({
            error: error,
            exprValues: data || {},
            cacheExpiry: props.dataSource.getCacheExpiry()
          });
        });
      }
    }, {
      key: "scrollToTOCEntry",
      value: function scrollToTOCEntry(entryId) {
        var entries, entry; // Find entry in divComp

        entries = this.divComp.querySelectorAll("h1,h2,h3,h4,h5,h6,h7,h8,h9");
        entry = entries[entryId];

        if (entry) {
          return entry.scrollIntoView(true);
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var exprValues; // If loading, don't display old values

        exprValues = !this.state.loading ? this.state.exprValues : {};
        return R('div', {
          ref: function ref(c) {
            return _this2.divComp = c;
          }
        }, R(TextComponent, {
          design: this.props.design,
          onDesignChange: this.props.onDesignChange,
          filters: this.props.filters,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          exprValues: exprValues,
          width: this.props.width,
          height: this.props.height,
          standardWidth: this.props.standardWidth,
          singleRowTable: this.props.singleRowTable,
          namedStrings: this.props.namedStrings
        }));
      }
    }]);
    return TextWidgetComponent;
  }(AsyncLoadComponent);

  ;
  TextWidgetComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    // Called with new design. null/undefined for readonly
    filters: PropTypes.array,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use for chart
    widgetDataSource: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number,
    singleRowTable: PropTypes.string,
    // Table that is filtered to have one row
    namedStrings: PropTypes.object // Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

  };
  return TextWidgetComponent;
}.call(void 0);
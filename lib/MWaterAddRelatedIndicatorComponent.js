"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var $,
    ExprUtils,
    MWaterAddRelatedIndicatorComponent,
    PropTypes,
    R,
    React,
    _,
    filterMatches,
    _flattenProperties,
    moment,
    querystring,
    ui,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
},
    indexOf = [].indexOf;

$ = require('jquery');
PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
moment = require('moment');
querystring = require('querystring');
ExprUtils = require('mwater-expressions').ExprUtils;
ui = require('./UIComponents'); // List of indicators related to an entity

module.exports = MWaterAddRelatedIndicatorComponent = function () {
  var MWaterAddRelatedIndicatorComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MWaterAddRelatedIndicatorComponent, _React$Component);

    var _super = _createSuper(MWaterAddRelatedIndicatorComponent);

    function MWaterAddRelatedIndicatorComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, MWaterAddRelatedIndicatorComponent);
      _this = _super.call(this, props);
      _this.handleSelect = _this.handleSelect.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        addingTables: [],
        // Set to table ids that have been added
        indicators: null
      };
      return _this;
    }

    (0, _createClass2["default"])(MWaterAddRelatedIndicatorComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        var query; // Get all response-type indicators 

        query = {};
        query.selector = JSON.stringify({
          type: "response"
        });
        query.fields = JSON.stringify({
          "design.name": 1,
          "design.desc": 1,
          "design.properties": 1,
          "design.recommended": 1,
          "deprecated": 1
        });

        if (this.props.client) {
          query.client = this.props.client;
        } // Get list of all indicators


        return $.getJSON(this.props.apiUrl + "indicators?" + querystring.stringify(query), function (indicators) {
          // Filter by table reference
          indicators = _.filter(indicators, function (indicator) {
            return _this2.doesIndicatorReferenceTable(indicator, _this2.props.table) && !indicator.deprecated;
          }); // Sort by recommended then name

          indicators = _.sortByOrder(indicators, [function (indicator) {
            if (indicator.design.recommended) {
              return 0;
            } else {
              return 1;
            }
          }, function (indicator) {
            return ExprUtils.localizeString(indicator.design.name, _this2.context.locale);
          }], ['asc', 'asc']);
          return _this2.setState({
            indicators: indicators
          });
        }).fail(function (xhr) {
          return _this2.setState({
            error: xhr.responseText
          });
        });
      } // See if a property references the indicator

    }, {
      key: "doesIndicatorReferenceTable",
      value: function doesIndicatorReferenceTable(indicator, table) {
        var i, j, len, len1, property, proplist, ref, ref1;
        ref = _.values(indicator.design.properties);

        for (i = 0, len = ref.length; i < len; i++) {
          proplist = ref[i];
          ref1 = _flattenProperties(proplist);

          for (j = 0, len1 = ref1.length; j < len1; j++) {
            property = ref1[j];

            if (property.idTable === table) {
              return true;
            }
          }
        }

        return false;
      }
    }, {
      key: "handleSelect",
      value: function handleSelect(table) {
        boundMethodCheck(this, MWaterAddRelatedIndicatorComponent); // Mark as being added

        this.setState({
          addingTables: _.union(this.state.addingTables, [table])
        });
        return this.props.onSelect(table);
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var indicators; // Filter out ones that are known and not recently added

        indicators = _.filter(this.state.indicators, function (indicator) {
          var ref;
          return !_this3.props.schema.getTable("indicator_values:".concat(indicator._id)) || (ref = "indicator_values:".concat(indicator._id), indexOf.call(_this3.state.addingTables, ref) >= 0);
        }); // Filter by search

        if (this.props.filter) {
          indicators = _.filter(indicators, function (indicator) {
            return filterMatches(_this3.props.filter, ExprUtils.localizeString(indicator.design.name, _this3.context.locale));
          });
        }

        return R('div', null, R('div', {
          style: {
            paddingLeft: 5
          },
          className: "text-muted"
        }, "Other Available Indicators. Click to enable. ", R('i', {
          className: "fa fa-check-circle"
        }), " = recommended", !this.state.indicators ? R('div', {
          className: "text-muted"
        }, R('i', {
          className: "fa fa-spin fa-spinner"
        }), " Loading...") : void 0, R('div', {
          style: {
            paddingLeft: 10
          }
        }, _.map(indicators, function (indicator) {
          var desc, name, ref;
          name = ExprUtils.localizeString(indicator.design.name, _this3.context.locale);
          desc = ExprUtils.localizeString(indicator.design.desc, _this3.context.locale); // If added, put special message

          if (_this3.props.schema.getTable("indicator_values:".concat(indicator._id))) {
            return R('div', {
              key: indicator._id,
              style: {
                cursor: "pointer",
                padding: 4
              },
              className: "text-success"
            }, "".concat(name, " added. See above."));
          }

          return R('div', {
            key: indicator._id,
            style: {
              cursor: "pointer",
              color: "#478",
              padding: 4
            },
            onClick: _this3.handleSelect.bind(null, "indicator_values:".concat(indicator._id)) // If in process of adding

          }, (ref = indicator._id, indexOf.call(_this3.state.addingTables, ref) >= 0) ? R('i', {
            className: "fa fa-spin fa-spinner"
          }) : void 0, indicator.design.recommended ? R('i', {
            className: "fa fa-check-circle fa-fw",
            style: {
              color: "#337ab7"
            }
          }) : void 0, name, desc ? R('span', {
            className: "text-muted",
            style: {
              fontSize: 12,
              paddingLeft: 3
            }
          }, " - " + desc) : void 0);
        }))));
      }
    }]);
    return MWaterAddRelatedIndicatorComponent;
  }(React.Component);

  ;
  MWaterAddRelatedIndicatorComponent.propTypes = {
    table: PropTypes.string.isRequired,
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    user: PropTypes.string,
    // User id
    onSelect: PropTypes.func.isRequired,
    // Called with table id e.g. indicator_values:someid
    schema: PropTypes.object.isRequired,
    filter: PropTypes.string // String filter

  };
  MWaterAddRelatedIndicatorComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return MWaterAddRelatedIndicatorComponent;
}.call(void 0); // Flattens a nested list of properties


_flattenProperties = function flattenProperties(properties) {
  var i, len, prop, props; // Flatten

  props = [];

  for (i = 0, len = properties.length; i < len; i++) {
    prop = properties[i];

    if (prop.contents) {
      props = props.concat(_flattenProperties(prop.contents));
    } else {
      props.push(prop);
    }
  }

  return props;
}; // Filters text based on lower-case


filterMatches = function filterMatches(filter, text) {
  if (!filter) {
    return true;
  }

  if (!text) {
    return false;
  }

  if (text.match(new RegExp(_.escapeRegExp(filter), "i"))) {
    return true;
  }

  return false;
};
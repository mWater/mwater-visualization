"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var DetailLevelSelectComponent, PropTypes, R, React, ReactSelect, _;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ReactSelect = require('react-select')["default"]; // Select detail level within an admin region

module.exports = DetailLevelSelectComponent = function () {
  var DetailLevelSelectComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(DetailLevelSelectComponent, _React$Component);

    var _super = _createSuper(DetailLevelSelectComponent);

    function DetailLevelSelectComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, DetailLevelSelectComponent);
      _this = _super.call(this, props);
      _this.state = {
        options: null
      };
      return _this;
    }

    (0, _createClass2["default"])(DetailLevelSelectComponent, [{
      key: "componentWillMount",
      value: function componentWillMount() {
        return this.loadLevels(this.props);
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        if (nextProps.scope !== this.props.scope) {
          return this.loadLevels(nextProps);
        }
      }
    }, {
      key: "loadLevels",
      value: function loadLevels(props) {
        var _this2 = this;

        var query; // Get country id of scope

        query = {
          type: "query",
          selects: [{
            type: "select",
            expr: {
              type: "field",
              tableAlias: "main",
              column: "level0"
            },
            alias: "level0"
          }],
          from: {
            type: "table",
            table: "admin_regions",
            alias: "main"
          },
          where: {
            type: "op",
            op: "=",
            exprs: [{
              type: "field",
              tableAlias: "main",
              column: "_id"
            }, props.scope]
          }
        }; // Execute query

        return props.dataSource.performQuery(query, function (err, rows) {
          var countryId;

          if (err) {
            alert("Error loading detail levels");
            return;
          }

          countryId = rows[0].level0; // Get levels

          query = {
            type: "query",
            selects: [{
              type: "select",
              expr: {
                type: "field",
                tableAlias: "main",
                column: "level"
              },
              alias: "level"
            }, {
              type: "select",
              expr: {
                type: "field",
                tableAlias: "main",
                column: "name"
              },
              alias: "name"
            }],
            from: {
              type: "table",
              table: "admin_region_levels",
              alias: "main"
            },
            where: {
              type: "op",
              op: "=",
              exprs: [{
                type: "field",
                tableAlias: "main",
                column: "country_id"
              }, countryId]
            },
            orderBy: [{
              ordinal: 1,
              direction: "asc"
            }]
          }; // Execute query

          return props.dataSource.performQuery(query, function (err, rows) {
            var options;

            if (err) {
              alert("Error loading detail levels");
              return;
            } // Only greater than current scope level


            rows = _.filter(rows, function (r) {
              return r.level > props.scopeLevel;
            }); // If detail level set (defaults to zero), and has an option, auto-select

            if (_this2.props.detailLevel <= _this2.props.scopeLevel && rows.length > 0) {
              _this2.props.onChange(rows[0].level);
            }

            options = _.map(rows, function (r) {
              return {
                value: r.level,
                label: r.name
              };
            });
            return _this2.setState({
              options: options
            });
          });
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        if (this.state.options) {
          return R(ReactSelect, {
            value: _.findWhere(this.state.options, {
              value: this.props.detailLevel
            }) || null,
            options: this.state.options,
            onChange: function onChange(opt) {
              return _this3.props.onChange(opt.value);
            }
          });
        } else {
          return R('div', {
            className: "text-muted"
          }, R('i', {
            className: "fa fa-spinner fa-spin"
          }), " Loading...");
        }
      }
    }]);
    return DetailLevelSelectComponent;
  }(React.Component);

  ;
  DetailLevelSelectComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    scope: PropTypes.string.isRequired,
    // admin region
    scopeLevel: PropTypes.number.isRequired,
    // admin region
    detailLevel: PropTypes.number,
    // Detail level within
    onChange: PropTypes.func.isRequired // Called with (detailLevel)

  };
  return DetailLevelSelectComponent;
}.call(void 0);
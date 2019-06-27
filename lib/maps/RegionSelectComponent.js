"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var IdLiteralComponent,
    PropTypes,
    R,
    React,
    RegionSelectComponent,
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
IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent; // Allows selecting of a single region

module.exports = RegionSelectComponent = function () {
  var RegionSelectComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(RegionSelectComponent, _React$Component);

    function RegionSelectComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, RegionSelectComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(RegionSelectComponent).apply(this, arguments));
      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(RegionSelectComponent, [{
      key: "handleChange",
      value: function handleChange(id) {
        var _this2 = this;

        var query;
        boundMethodCheck(this, RegionSelectComponent);

        if (!id) {
          this.props.onChange(null, null);
          return;
        } // Look up level


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
          }],
          from: {
            type: "table",
            table: this.props.regionsTable,
            alias: "main"
          },
          where: {
            type: "op",
            op: "=",
            exprs: [{
              type: "field",
              tableAlias: "main",
              column: "_id"
            }, id]
          }
        }; // Execute query

        return this.props.dataSource.performQuery(query, function (err, rows) {
          if (err) {
            console.log("Error getting regions: " + (err != null ? err.message : void 0));
            return;
          }

          return _this2.props.onChange(id, rows[0].level);
        });
      }
    }, {
      key: "render",
      value: function render() {
        var filter;
        filter = null;

        if (this.props.maxLevel != null) {
          filter = {
            type: "op",
            op: "<=",
            exprs: [{
              type: "field",
              tableAlias: "main",
              column: "level"
            }, this.props.maxLevel]
          };
        }

        return R(IdLiteralComponent, {
          value: this.props.region,
          onChange: this.handleChange,
          idTable: this.props.regionsTable,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          placeholder: this.props.placeholder,
          orderBy: [{
            expr: {
              type: "field",
              tableAlias: "main",
              column: "level"
            },
            direction: "asc"
          }],
          filter: filter
        });
      }
    }]);
    return RegionSelectComponent;
  }(React.Component);

  ;
  RegionSelectComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    region: PropTypes.number,
    // _id of region
    onChange: PropTypes.func.isRequired,
    // Called with (_id, level)
    placeholder: PropTypes.string,
    regionsTable: PropTypes.string.isRequired,
    // e.g. "admin_regions"
    maxLevel: PropTypes.number // Maximum region level allowed

  };
  RegionSelectComponent.defaultProps = {
    placeholder: "All Countries",
    regionsTable: "admin_regions" // Default for existing code

  };
  return RegionSelectComponent;
}.call(void 0);
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AsyncLoadComponent, LoadingComponent, MWaterContextComponent, MWaterLoaderComponent, PropTypes, R, React, Schema, _, mWaterLoader, querystring;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
Schema = require('mwater-expressions').Schema;
querystring = require('querystring');
AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');
LoadingComponent = require('react-library/lib/LoadingComponent');
mWaterLoader = require('./mWaterLoader');
MWaterContextComponent = require('./MWaterContextComponent'); // Loads an mWater schema from the server and creates child with schema and dataSource
// Also creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
// and several other context items

module.exports = MWaterLoaderComponent = function () {
  var MWaterLoaderComponent =
  /*#__PURE__*/
  function (_AsyncLoadComponent) {
    (0, _inherits2["default"])(MWaterLoaderComponent, _AsyncLoadComponent);

    function MWaterLoaderComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, MWaterLoaderComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(MWaterLoaderComponent).call(this, props));
      _this.state = {
        error: null,
        schema: null,
        dataSource: null
      };
      _this.mounted = false;
      return _this;
    } // Override to determine if a load is needed. Not called on mounting


    (0, _createClass2["default"])(MWaterLoaderComponent, [{
      key: "isLoadNeeded",
      value: function isLoadNeeded(newProps, oldProps) {
        return !_.isEqual(_.pick(newProps, "apiUrl", "client", "user", "share", "asUser", "extraTables"), _.pick(oldProps, "apiUrl", "client", "user", "share", "asUser", "extraTables"));
      } // Call callback with state changes

    }, {
      key: "load",
      value: function load(props, prevProps, callback) {
        var _this2 = this;

        // Load schema and data source
        return mWaterLoader({
          apiUrl: props.apiUrl,
          client: props.client,
          share: props.share,
          asUser: props.asUser,
          extraTables: props.extraTables
        }, function (error, config) {
          var defaultError;

          if (error) {
            defaultError = "Cannot load one of the forms that this depends on. Perhaps the administrator has not shared the form with you? Details: ".concat(error.message);

            if (_this2.props.errorFormatter) {
              return callback({
                error: _this2.props.errorFormatter(JSON.parse(error.message), defaultError)
              });
            }

            return callback({
              error: defaultError
            });
          }

          return callback({
            schema: config.schema,
            dataSource: config.dataSource
          });
        });
      }
    }, {
      key: "render",
      value: function render() {
        if (!this.state.schema && !this.state.error) {
          return React.createElement(LoadingComponent);
        } // Inject context


        return R(MWaterContextComponent, {
          apiUrl: this.props.apiUrl,
          client: this.props.client,
          user: this.props.user,
          schema: this.state.schema,
          extraTables: this.props.extraTables,
          onExtraTablesChange: this.props.onExtraTablesChange,
          addLayerElementFactory: this.props.addLayerElementFactory
        }, this.props.children(this.state.error, {
          schema: this.state.schema,
          dataSource: this.state.dataSource
        }));
      }
    }]);
    return MWaterLoaderComponent;
  }(AsyncLoadComponent);

  ;
  MWaterLoaderComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    share: PropTypes.string,
    user: PropTypes.string,
    // user id of logged in user
    asUser: PropTypes.string,
    // Load schema as a specific user (for shared dashboards, etc)
    extraTables: PropTypes.arrayOf(PropTypes.string),
    // Extra tables to load in schema. Forms are not loaded by default as they are too many
    onExtraTablesChange: PropTypes.func,
    // Called when extra tables are changed and schema will be reloaded
    // Override default add layer component. See AddLayerComponent for details
    addLayerElementFactory: PropTypes.func,
    children: PropTypes.func.isRequired,
    // Called with (error, { schema:, dataSource: })
    errorFormatter: PropTypes.func // Custom error formatter that returns React node or string, gets passed the error response from server

  };
  return MWaterLoaderComponent;
}.call(void 0);
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var $, DatagridDataSource, ServerDatagridDataSource, ServerQuickfilterDataSource, compressJson, querystring;
$ = require('jquery');
querystring = require('querystring');
DatagridDataSource = require('./DatagridDataSource');
compressJson = require('../compressJson'); // Uses mWater server to get datagrid data to allow sharing with unprivileged users

module.exports = ServerDatagridDataSource = /*#__PURE__*/function (_DatagridDataSource) {
  (0, _inherits2["default"])(ServerDatagridDataSource, _DatagridDataSource);

  var _super = _createSuper(ServerDatagridDataSource);

  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   datagridId: datagrid id to use on server
  //   rev: revision to use to allow caching
  function ServerDatagridDataSource(options) {
    var _this;

    (0, _classCallCheck2["default"])(this, ServerDatagridDataSource);
    _this = _super.call(this);
    _this.options = options;
    return _this;
  } // Get the data that the widget needs. The widget should implement getData method (see above) to get the data from the server
  //  design: design of the widget. Ignored in the case of server-side rendering
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct


  (0, _createClass2["default"])(ServerDatagridDataSource, [{
    key: "getRows",
    value: function getRows(design, offset, limit, filters, callback) {
      var query, url;
      query = {
        client: this.options.client,
        share: this.options.share,
        filters: compressJson(filters),
        rev: this.options.rev,
        offset: offset,
        limit: limit
      };
      url = this.options.apiUrl + "datagrids/".concat(this.options.datagridId, "/data?") + querystring.stringify(query);
      return $.getJSON(url, function (data) {
        return callback(null, data);
      }).fail(function (xhr) {
        console.log(xhr.responseText);
        return callback(new Error(xhr.responseText));
      });
    }
  }, {
    key: "getQuickfiltersDataSource",
    value: function getQuickfiltersDataSource() {
      return new ServerQuickfilterDataSource(this.options);
    }
  }]);
  return ServerDatagridDataSource;
}(DatagridDataSource);

ServerQuickfilterDataSource = /*#__PURE__*/function () {
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   datagridId: datagrid id to use on server
  //   rev: revision to use to allow caching
  function ServerQuickfilterDataSource(options) {
    (0, _classCallCheck2["default"])(this, ServerQuickfilterDataSource);
    this.options = options;
  } // Gets the values of the quickfilter at index


  (0, _createClass2["default"])(ServerQuickfilterDataSource, [{
    key: "getValues",
    value: function getValues(index, expr, filters, offset, limit, callback) {
      var query, url;
      query = {
        client: this.options.client,
        share: this.options.share,
        filters: compressJson(filters),
        offset: offset,
        limit: limit,
        rev: this.options.rev
      };
      url = this.options.apiUrl + "datagrids/".concat(this.options.datagridId, "/quickfilters/").concat(index, "/values?") + querystring.stringify(query);
      return $.getJSON(url, function (data) {
        return callback(null, data);
      }).fail(function (xhr) {
        console.log(xhr.responseText);
        return callback(new Error(xhr.responseText));
      });
    }
  }]);
  return ServerQuickfilterDataSource;
}();
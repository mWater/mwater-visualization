"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var CachingDataSource, DataSource, LRU;
DataSource = require('mwater-expressions').DataSource;
LRU = require("lru-cache"); // Data source that caches requests. Designed to be simple for implementation
// Pass in option of perform which is function with signature (query, cb) where cb is called with (null, rows) on success

module.exports = CachingDataSource = /*#__PURE__*/function (_DataSource) {
  (0, _inherits2["default"])(CachingDataSource, _DataSource);

  var _super = _createSuper(CachingDataSource);

  function CachingDataSource(options) {
    var _this;

    (0, _classCallCheck2["default"])(this, CachingDataSource);
    _this = _super.call(this);
    _this.perform = options.perform;
    _this.cache = LRU({
      max: 500,
      maxAge: 1000 * 15 * 60
    });
    return _this;
  }

  (0, _createClass2["default"])(CachingDataSource, [{
    key: "performQuery",
    value: function performQuery(query, cb) {
      var _this2 = this;

      var cacheKey, cachedRows;
      cacheKey = JSON.stringify(query);
      cachedRows = this.cache.get(cacheKey);

      if (cachedRows) {
        return cb(null, cachedRows);
      }

      return this.perform(query, function (err, rows) {
        if (!err) {
          // Cache rows
          _this2.cache.set(cacheKey, rows);
        }

        return cb(err, rows);
      });
    }
  }]);
  return CachingDataSource;
}(DataSource);
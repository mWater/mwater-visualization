"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// Data source that returns values for text-based and id-based quickfilters. Allows client-server model that supports sharing 
var QuickfiltersDataSource;

module.exports = QuickfiltersDataSource =
/*#__PURE__*/
function () {
  function QuickfiltersDataSource() {
    (0, _classCallCheck2["default"])(this, QuickfiltersDataSource);
  }

  (0, _createClass2["default"])(QuickfiltersDataSource, [{
    key: "getValues",
    // Gets the values of the quickfilter at index
    value: function getValues(index, expr, filters, offset, limit, callback) {
      throw new Error("Not implemented");
    }
  }]);
  return QuickfiltersDataSource;
}();
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// Get widget data directly from the dataSource
var DirectWidgetDataSource;

module.exports = DirectWidgetDataSource =
/*#__PURE__*/
function () {
  // options:
  //   widget: widget object
  //   schema: schema to use
  //   dataSource: general data source
  //   apiUrl: API url to use for talking to mWater server. Not needed if no map widgets
  //   client: client id to use for talking to mWater server. Not needed if no map widgets
  function DirectWidgetDataSource(options) {
    (0, _classCallCheck2["default"])(this, DirectWidgetDataSource);
    this.options = options;
  } // Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
  //  design: design of the widget. Ignored in the case of server-side rendering
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  callback: (error, data)


  (0, _createClass2["default"])(DirectWidgetDataSource, [{
    key: "getData",
    value: function getData(design, filters, callback) {
      return this.options.widget.getData(design, this.options.schema, this.options.dataSource, filters, callback);
    } // For map widgets, the following is required
    //  design: design of the widget. Ignored in the case of server-side rendering

  }, {
    key: "getMapDataSource",
    value: function getMapDataSource(design) {
      var DirectMapDataSource;
      DirectMapDataSource = require('../maps/DirectMapDataSource');
      return new DirectMapDataSource({
        apiUrl: this.options.apiUrl,
        client: this.options.client,
        design: design,
        schema: this.options.schema,
        dataSource: this.options.dataSource
      });
    } // Get the url to download an image (by id from an image or imagelist column)
    // Height, if specified, is minimum height needed. May return larger image

  }, {
    key: "getImageUrl",
    value: function getImageUrl(imageId, height) {
      return this.options.dataSource.getImageUrl(imageId, height);
    }
  }]);
  return DirectWidgetDataSource;
}();
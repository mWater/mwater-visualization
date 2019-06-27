"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var CalendarChart, ChartWidget, IFrameWidget, ImageMosaicChart, ImageWidget, LayeredChart, MapWidget, MarkdownWidget, PivotChart, TOCWidget, TableChart, TextWidget, WidgetFactory;
ChartWidget = require('./charts/ChartWidget');
LayeredChart = require('./charts/layered/LayeredChart');
TableChart = require('./charts/table/TableChart');
CalendarChart = require('./charts/calendar/CalendarChart');
ImageMosaicChart = require('./charts/imagemosaic/ImageMosaicChart');
PivotChart = require('./charts/pivot/PivotChart');
MarkdownWidget = require('./MarkdownWidget');
TextWidget = require('./text/TextWidget');
ImageWidget = require('./ImageWidget');
MapWidget = require('./MapWidget');
IFrameWidget = require('./IFrameWidget');
TOCWidget = require('./TOCWidget'); // Creates widgets based on type 

module.exports = WidgetFactory =
/*#__PURE__*/
function () {
  function WidgetFactory() {
    (0, _classCallCheck2["default"])(this, WidgetFactory);
  }

  (0, _createClass2["default"])(WidgetFactory, null, [{
    key: "createWidget",
    value: function createWidget(type) {
      switch (type) {
        case "LayeredChart":
          return new ChartWidget(new LayeredChart());

        case "TableChart":
          return new ChartWidget(new TableChart());

        case "CalendarChart":
          return new ChartWidget(new CalendarChart());

        case "ImageMosaicChart":
          return new ChartWidget(new ImageMosaicChart());

        case "PivotChart":
          return new ChartWidget(new PivotChart());

        case "Markdown":
          return new MarkdownWidget();

        case "Map":
          return new MapWidget();

        case "Text":
          return new TextWidget();

        case "Image":
          return new ImageWidget();

        case "IFrame":
          return new IFrameWidget();

        case "TOC":
          return new TOCWidget();

        default:
          throw new Error("Unknown widget type ".concat(type));
      }
    }
  }]);
  return WidgetFactory;
}();
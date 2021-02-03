"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ActionCancelModalComponent,
    ChartViewComponent,
    ChartWidget,
    ChartWidgetComponent,
    CsvBuilder,
    DropdownWidgetComponent,
    ModalWindowComponent,
    PropTypes,
    R,
    React,
    Widget,
    ui,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
Widget = require('./../Widget');
DropdownWidgetComponent = require('./../DropdownWidgetComponent');
CsvBuilder = require('./../../CsvBuilder');
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');
ChartViewComponent = require('./ChartViewComponent');
ModalWindowComponent = require('react-library/lib/ModalWindowComponent');
ui = require('react-library/lib/bootstrap'); // A widget which is a chart

module.exports = ChartWidget = /*#__PURE__*/function (_Widget) {
  (0, _inherits2["default"])(ChartWidget, _Widget);

  var _super = _createSuper(ChartWidget);

  function ChartWidget(chart) {
    var _this;

    (0, _classCallCheck2["default"])(this, ChartWidget);
    _this = _super.call(this);
    _this.chart = chart;
    return _this;
  } // Creates a view of the widget.
  // options:
  //  schema: schema to use
  //  dataSource: data source to use
  //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  //  design: widget design
  //  scope: scope of the widget (when the widget self-selects a particular scope)
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  onScopeChange: called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  //  onDesignChange: called with new design. null/undefined for readonly
  //  width: width in pixels on screen
  //  height: height in pixels on screen
  //  onRowClick: Called with (tableId, rowId) when item is clicked


  (0, _createClass2["default"])(ChartWidget, [{
    key: "createViewElement",
    value: function createViewElement(options) {
      return R(ChartWidgetComponent, {
        chart: this.chart,
        design: options.design,
        schema: options.schema,
        widgetDataSource: options.widgetDataSource,
        dataSource: options.dataSource,
        scope: options.scope,
        filters: options.filters,
        onScopeChange: options.onScopeChange,
        onDesignChange: options.onDesignChange,
        width: options.width,
        height: options.height,
        onRowClick: options.onRowClick
      });
    } // Get the data that the widget needs. This will be called on the server, typically.
    //   design: design of the chart
    //   schema: schema to use
    //   dataSource: data source to get data from
    //   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    //   callback: (error, data)

  }, {
    key: "getData",
    value: function getData(design, schema, dataSource, filters, callback) {
      // Clean design first
      design = this.chart.cleanDesign(design, schema);
      return this.chart.getData(design, schema, dataSource, filters, callback);
    } // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      // Clean design first
      design = this.chart.cleanDesign(design, schema);
      return this.chart.getFilterableTables(design, schema);
    } // Determine if widget is auto-height, which means that a vertical height is not required.

  }, {
    key: "isAutoHeight",
    value: function isAutoHeight() {
      return this.chart.isAutoHeight();
    }
  }]);
  return ChartWidget;
}(Widget);

ChartWidgetComponent = function () {
  var _ChartWidgetComponent;

  // Complete chart widget
  var ChartWidgetComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(ChartWidgetComponent, _React$Component);

    var _super2 = _createSuper(ChartWidgetComponent);

    function ChartWidgetComponent(props) {
      var _this2;

      (0, _classCallCheck2["default"])(this, ChartWidgetComponent);
      _this2 = _super2.call(this, props); // Saves a csv file to disk

      _this2.handleSaveCsvFile = _this2.handleSaveCsvFile.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleStartEditing = _this2.handleStartEditing.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleEndEditing = _this2.handleEndEditing.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleCancelEditing = _this2.handleCancelEditing.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleEditDesignChange = _this2.handleEditDesignChange.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.state = {
        // Design that is being edited. Change is propagated on closing window
        editDesign: null
      };
      return _this2;
    }

    (0, _createClass2["default"])(ChartWidgetComponent, [{
      key: "handleSaveCsvFile",
      value: function handleSaveCsvFile() {
        var _this3 = this;

        boundMethodCheck(this, ChartWidgetComponent); // Get the data

        return this.props.widgetDataSource.getData(this.props.design, this.props.filters, function (err, data) {
          var FileSaver, blob, csv, table;

          if (err) {
            return alert("Failed to get data");
          } // Create data table


          table = _this3.props.chart.createDataTable(_this3.props.design, _this3.props.schema, _this3.props.dataSource, data, _this3.context.locale);

          if (!table) {
            return;
          } // Convert to csv


          csv = new CsvBuilder().build(table); // Add BOM

          csv = "\uFEFF" + csv; // Make a blob and save

          blob = new Blob([csv], {
            type: "text/csv"
          }); // Require at use as causes server problems

          FileSaver = require('file-saver');
          return FileSaver.saveAs(blob, "Exported Data.csv");
        });
      }
    }, {
      key: "handleStartEditing",
      value: function handleStartEditing() {
        boundMethodCheck(this, ChartWidgetComponent); // Can't edit if already editing

        if (this.state.editDesign) {
          return;
        }

        return this.setState({
          editDesign: this.props.design
        });
      }
    }, {
      key: "handleEndEditing",
      value: function handleEndEditing() {
        boundMethodCheck(this, ChartWidgetComponent);
        this.props.onDesignChange(this.state.editDesign);
        return this.setState({
          editDesign: null
        });
      }
    }, {
      key: "handleCancelEditing",
      value: function handleCancelEditing() {
        boundMethodCheck(this, ChartWidgetComponent);
        return this.setState({
          editDesign: null
        });
      }
    }, {
      key: "handleEditDesignChange",
      value: function handleEditDesignChange(design) {
        boundMethodCheck(this, ChartWidgetComponent);
        return this.setState({
          editDesign: design
        });
      }
    }, {
      key: "renderChart",
      value: function renderChart(design, onDesignChange, width, height) {
        return R(ChartViewComponent, {
          chart: this.props.chart,
          design: design,
          onDesignChange: onDesignChange,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          widgetDataSource: this.props.widgetDataSource,
          scope: this.props.scope,
          filters: this.props.filters,
          width: width,
          height: height,
          onScopeChange: this.props.onScopeChange,
          onRowClick: this.props.onRowClick
        });
      }
    }, {
      key: "renderEditor",
      value: function renderEditor() {
        var _this4 = this;

        var chart, chartHeight, chartWidth, content, editor;

        if (!this.state.editDesign) {
          return null;
        } // Create editor


        editor = this.props.chart.createDesignerElement({
          schema: this.props.schema,
          filters: this.props.filters,
          dataSource: this.props.dataSource,
          design: this.state.editDesign,
          onDesignChange: this.handleEditDesignChange
        });

        if (this.props.chart.hasDesignerPreview()) {
          // Create chart (maxing out at half of width of screen)
          chartWidth = Math.min(document.body.clientWidth / 2, this.props.width);
          chartHeight = this.props.height * (chartWidth / this.props.width);
          chart = this.renderChart(this.state.editDesign, function (design) {
            return _this4.setState({
              editDesign: design
            });
          }, chartWidth, chartHeight, chartWidth);
          content = R('div', {
            style: {
              height: "100%",
              width: "100%"
            }
          }, R('div', {
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              border: "solid 2px #EEE",
              borderRadius: 8,
              padding: 10,
              width: chartWidth + 20,
              height: chartHeight + 20,
              overflow: "hidden"
            }
          }, chart), R('div', {
            style: {
              width: "100%",
              height: "100%",
              paddingLeft: chartWidth + 40
            }
          }, R('div', {
            style: {
              width: "100%",
              height: "100%",
              overflowY: "auto",
              paddingLeft: 20,
              paddingRight: 20,
              borderLeft: "solid 3px #AAA"
            }
          }, editor)));
          return R(ModalWindowComponent, {
            isOpen: true,
            onRequestClose: this.handleEndEditing
          }, content);
        } else {
          return R(ActionCancelModalComponent, {
            size: "large",
            onCancel: this.handleCancelEditing,
            onAction: this.handleEndEditing
          }, editor);
        }
      } // Render a link to start editing

    }, {
      key: "renderEditLink",
      value: function renderEditLink() {
        return R('div', {
          className: "mwater-visualization-widget-placeholder",
          onClick: this.handleStartEditing
        }, R(ui.Icon, {
          id: this.props.chart.getPlaceholderIcon()
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var design, dropdownItems, emptyDesign, validDesign;
        design = this.props.chart.cleanDesign(this.props.design, this.props.schema); // Determine if valid design

        validDesign = !this.props.chart.validateDesign(design, this.props.schema); // Determine if empty

        emptyDesign = this.props.chart.isEmpty(design); // Create dropdown items

        dropdownItems = this.props.chart.createDropdownItems(design, this.props.schema, this.props.widgetDataSource, this.props.filters);

        if (validDesign) {
          dropdownItems.push({
            label: "Export Data",
            icon: "save-file",
            onClick: this.handleSaveCsvFile
          });
        }

        if (this.props.onDesignChange != null) {
          dropdownItems.unshift({
            label: this.props.chart.getEditLabel(),
            icon: "pencil",
            onClick: this.handleStartEditing
          });
        } // Wrap in a simple widget


        return R('div', {
          onDoubleClick: this.props.onDesignChange != null ? this.handleStartEditing : void 0,
          style: {
            position: "relative",
            width: this.props.width
          }
        }, this.props.onDesignChange != null ? this.renderEditor() : void 0, React.createElement(DropdownWidgetComponent, {
          width: this.props.width,
          height: this.props.height,
          dropdownItems: dropdownItems
        }, this.renderChart(design, this.props.onDesignChange, this.props.width, this.props.height)), (emptyDesign || !validDesign) && this.props.onDesignChange != null ? this.renderEditLink() : void 0);
      }
    }]);
    return ChartWidgetComponent;
  }(React.Component);

  ;
  ChartWidgetComponent.propTypes = (_ChartWidgetComponent = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // data source to use
    widgetDataSource: PropTypes.object.isRequired,
    chart: PropTypes.object.isRequired,
    // Chart object to use
    design: PropTypes.object.isRequired,
    // Design of chart
    onDesignChange: PropTypes.func
  }, (0, _defineProperty2["default"])(_ChartWidgetComponent, "dataSource", PropTypes.object.isRequired), (0, _defineProperty2["default"])(_ChartWidgetComponent, "width", PropTypes.number), (0, _defineProperty2["default"])(_ChartWidgetComponent, "height", PropTypes.number), (0, _defineProperty2["default"])(_ChartWidgetComponent, "scope", PropTypes.any), (0, _defineProperty2["default"])(_ChartWidgetComponent, "filters", PropTypes.array), (0, _defineProperty2["default"])(_ChartWidgetComponent, "onScopeChange", PropTypes.func), (0, _defineProperty2["default"])(_ChartWidgetComponent, "onRowClick", PropTypes.func), (0, _defineProperty2["default"])(_ChartWidgetComponent, "connectMoveHandle", PropTypes.func), (0, _defineProperty2["default"])(_ChartWidgetComponent, "connectResizeHandle", PropTypes.func), _ChartWidgetComponent);
  ChartWidgetComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return ChartWidgetComponent;
}.call(void 0);
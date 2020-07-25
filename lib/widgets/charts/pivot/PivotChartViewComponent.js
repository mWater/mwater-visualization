"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ActionCancelModalComponent,
    ExprUtils,
    IntersectionDesignerComponent,
    PivotChartLayoutBuilder,
    PivotChartLayoutComponent,
    PivotChartUtils,
    PivotChartViewComponent,
    PropTypes,
    R,
    React,
    ReactDOM,
    SegmentDesignerComponent,
    TextComponent,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
ReactDOM = require('react-dom');
R = React.createElement;
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');
ExprUtils = require('mwater-expressions').ExprUtils;
TextComponent = require('../../text/TextComponent');
PivotChartUtils = require('./PivotChartUtils');
PivotChartLayoutComponent = require('./PivotChartLayoutComponent');
PivotChartLayoutBuilder = require('./PivotChartLayoutBuilder');
SegmentDesignerComponent = require('./SegmentDesignerComponent');
IntersectionDesignerComponent = require('./IntersectionDesignerComponent'); // Displays a pivot chart

module.exports = PivotChartViewComponent = function () {
  var PivotChartViewComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(PivotChartViewComponent, _React$Component);

    var _super = _createSuper(PivotChartViewComponent);

    function PivotChartViewComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, PivotChartViewComponent);
      _this = _super.call(this, props);
      _this.handleHeaderChange = _this.handleHeaderChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFooterChange = _this.handleFooterChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleEditSection = _this.handleEditSection.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleSaveEditSegment = _this.handleSaveEditSegment.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleCancelEditSegment = _this.handleCancelEditSegment.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleSaveEditIntersection = _this.handleSaveEditIntersection.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleCancelEditIntersection = _this.handleCancelEditIntersection.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRemoveSegment = _this.handleRemoveSegment.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleInsertBeforeSegment = _this.handleInsertBeforeSegment.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleInsertAfterSegment = _this.handleInsertAfterSegment.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleAddChildSegment = _this.handleAddChildSegment.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleSummarizeSegment = _this.handleSummarizeSegment.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        editSegment: null,
        // Segment being edited
        editIntersectionId: null,
        // id of intersection being edited
        editIntersection: null // value of intersection being edited

      };
      return _this;
    }

    (0, _createClass2["default"])(PivotChartViewComponent, [{
      key: "handleHeaderChange",
      value: function handleHeaderChange(header) {
        boundMethodCheck(this, PivotChartViewComponent);
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          header: header
        }));
      }
    }, {
      key: "handleFooterChange",
      value: function handleFooterChange(footer) {
        boundMethodCheck(this, PivotChartViewComponent);
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          footer: footer
        }));
      }
    }, {
      key: "handleEditSection",
      value: function handleEditSection(sectionId) {
        var segment;
        boundMethodCheck(this, PivotChartViewComponent); // If intersection

        if (sectionId.match(":")) {
          return this.setState({
            editIntersectionId: sectionId,
            editIntersection: this.props.design.intersections[sectionId] || {}
          });
        } else {
          // Find segment
          segment = PivotChartUtils.findSegment(this.props.design.rows, sectionId) || PivotChartUtils.findSegment(this.props.design.columns, sectionId);
          return this.setState({
            editSegment: segment
          });
        }
      }
    }, {
      key: "handleSaveEditSegment",
      value: function handleSaveEditSegment() {
        var design, segment;
        boundMethodCheck(this, PivotChartViewComponent); // Always has label when saved

        segment = this.state.editSegment;

        if (segment.label == null) {
          segment = _.extend({}, segment, {
            label: ""
          });
        }

        design = _.extend({}, this.props.design, {
          rows: PivotChartUtils.replaceSegment(this.props.design.rows, segment),
          columns: PivotChartUtils.replaceSegment(this.props.design.columns, segment)
        });
        this.props.onDesignChange(design);
        return this.setState({
          editSegment: null
        });
      }
    }, {
      key: "handleCancelEditSegment",
      value: function handleCancelEditSegment() {
        boundMethodCheck(this, PivotChartViewComponent);
        return this.setState({
          editSegment: null
        });
      }
    }, {
      key: "handleSaveEditIntersection",
      value: function handleSaveEditIntersection() {
        var design, intersections;
        boundMethodCheck(this, PivotChartViewComponent);
        intersections = _.clone(this.props.design.intersections);
        intersections[this.state.editIntersectionId] = this.state.editIntersection;
        design = _.extend({}, this.props.design, {
          intersections: intersections
        });
        this.props.onDesignChange(design);
        return this.setState({
          editIntersectionId: null,
          editIntersection: null
        });
      }
    }, {
      key: "handleCancelEditIntersection",
      value: function handleCancelEditIntersection() {
        boundMethodCheck(this, PivotChartViewComponent);
        return this.setState({
          editIntersectionId: null,
          editIntersection: null
        });
      }
    }, {
      key: "handleRemoveSegment",
      value: function handleRemoveSegment(segmentId) {
        var design;
        boundMethodCheck(this, PivotChartViewComponent);
        design = _.extend({}, this.props.design, {
          rows: PivotChartUtils.removeSegment(this.props.design.rows, segmentId),
          columns: PivotChartUtils.removeSegment(this.props.design.columns, segmentId)
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleInsertBeforeSegment",
      value: function handleInsertBeforeSegment(segmentId) {
        var design;
        boundMethodCheck(this, PivotChartViewComponent);
        design = _.extend({}, this.props.design, {
          rows: PivotChartUtils.insertBeforeSegment(this.props.design.rows, segmentId),
          columns: PivotChartUtils.insertBeforeSegment(this.props.design.columns, segmentId)
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleInsertAfterSegment",
      value: function handleInsertAfterSegment(segmentId) {
        var design;
        boundMethodCheck(this, PivotChartViewComponent);
        design = _.extend({}, this.props.design, {
          rows: PivotChartUtils.insertAfterSegment(this.props.design.rows, segmentId),
          columns: PivotChartUtils.insertAfterSegment(this.props.design.columns, segmentId)
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleAddChildSegment",
      value: function handleAddChildSegment(segmentId) {
        var design;
        boundMethodCheck(this, PivotChartViewComponent);
        design = _.extend({}, this.props.design, {
          rows: PivotChartUtils.addChildSegment(this.props.design.rows, segmentId),
          columns: PivotChartUtils.addChildSegment(this.props.design.columns, segmentId)
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleSummarizeSegment",
      value: function handleSummarizeSegment(segmentId) {
        var design;
        boundMethodCheck(this, PivotChartViewComponent);
        design = PivotChartUtils.summarizeSegment(this.props.design, segmentId, "Summary");
        return this.props.onDesignChange(design);
      }
    }, {
      key: "renderHeader",
      value: function renderHeader() {
        return R('div', {
          style: {
            paddingLeft: 10,
            paddingRight: 10
          }
        }, R(TextComponent, {
          design: this.props.design.header,
          onDesignChange: this.props.onDesignChange ? this.handleHeaderChange : void 0,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          exprValues: this.props.data.header || {},
          width: this.props.width,
          standardWidth: this.props.standardWidth
        }));
      }
    }, {
      key: "renderFooter",
      value: function renderFooter() {
        return R('div', {
          style: {
            paddingLeft: 10,
            paddingRight: 10
          }
        }, R(TextComponent, {
          design: this.props.design.footer,
          onDesignChange: this.props.onDesignChange ? this.handleFooterChange : void 0,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          exprValues: this.props.data.footer || {},
          width: this.props.width,
          standardWidth: this.props.standardWidth
        }));
      }
    }, {
      key: "renderEditSegmentModal",
      value: function renderEditSegmentModal() {
        var _this2 = this;

        var segmentType;

        if (!this.state.editSegment) {
          return;
        }

        segmentType = PivotChartUtils.findSegment(this.props.design.rows, this.state.editSegment.id) ? "row" : "column";
        return R(ActionCancelModalComponent, {
          header: "Edit ".concat(segmentType),
          onAction: this.handleSaveEditSegment,
          onCancel: this.handleCancelEditSegment
        }, R(SegmentDesignerComponent, {
          segment: this.state.editSegment,
          table: this.props.design.table,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          segmentType: segmentType,
          onChange: function onChange(segment) {
            return _this2.setState({
              editSegment: segment
            });
          },
          filters: this.props.filters
        }));
      }
    }, {
      key: "renderEditIntersectionModal",
      value: function renderEditIntersectionModal() {
        var _this3 = this;

        if (!this.state.editIntersectionId) {
          return;
        }

        return R(ActionCancelModalComponent, {
          header: "Edit Value",
          onAction: this.handleSaveEditIntersection,
          onCancel: this.handleCancelEditIntersection
        }, R(IntersectionDesignerComponent, {
          intersection: this.state.editIntersection,
          table: this.props.design.table,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: function onChange(intersection) {
            return _this3.setState({
              editIntersection: intersection
            });
          },
          filters: this.props.filters
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var layout;
        layout = new PivotChartLayoutBuilder({
          schema: this.props.schema
        }).buildLayout(this.props.design, this.props.data, this.context.locale);
        return R('div', {
          style: {
            width: this.props.width,
            height: this.props.height
          }
        }, this.renderHeader(), this.renderEditSegmentModal(), this.renderEditIntersectionModal(), R('div', {
          key: "layout",
          style: {
            margin: 5,
            marginTop: 12,
            overflowX: "auto",
            padding: 7 // Allow table to scroll since tables have hard minimum widths, Leave room for gear menu

          }
        }, R(PivotChartLayoutComponent, {
          layout: layout,
          editable: this.props.onDesignChange != null,
          onEditSection: this.props.onDesignChange != null ? this.handleEditSection : void 0,
          onRemoveSegment: this.props.onDesignChange != null ? this.handleRemoveSegment : void 0,
          onInsertBeforeSegment: this.props.onDesignChange != null ? this.handleInsertBeforeSegment : void 0,
          onInsertAfterSegment: this.props.onDesignChange != null ? this.handleInsertAfterSegment : void 0,
          onAddChildSegment: this.props.onDesignChange != null ? this.handleAddChildSegment : void 0,
          onSummarizeSegment: this.props.onDesignChange != null ? this.handleSummarizeSegment : void 0
        })), this.renderFooter());
      }
    }]);
    return PivotChartViewComponent;
  }(React.Component);

  ;
  PivotChartViewComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    width: PropTypes.number.isRequired,
    standardWidth: PropTypes.number,
    // Deprecated
    scope: PropTypes.any,
    // scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: PropTypes.func,
    // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  PivotChartViewComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return PivotChartViewComponent;
}.call(void 0);
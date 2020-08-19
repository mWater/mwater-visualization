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

var Color,
    LayoutCellComponent,
    PivotChartLayoutComponent,
    PropTypes,
    R,
    React,
    ReactDOM,
    _,
    classNames,
    ui,
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
Color = require('color');
ui = require('react-library/lib/bootstrap');
classNames = require('classnames'); // Displays a pivot chart from a layout

module.exports = PivotChartLayoutComponent = function () {
  var PivotChartLayoutComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(PivotChartLayoutComponent, _React$Component);

    var _super = _createSuper(PivotChartLayoutComponent);

    function PivotChartLayoutComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, PivotChartLayoutComponent);
      _this = _super.call(this, props); // Records the cell components. This is to be able to calculate the bounds of sections
      // to allow floating hover controls

      _this.recordCellComp = _this.recordCellComp.bind((0, _assertThisInitialized2["default"])(_this));
      _this.renderHoverPlusIcon = _this.renderHoverPlusIcon.bind((0, _assertThisInitialized2["default"])(_this));
      _this.renderHoverRemoveIcon = _this.renderHoverRemoveIcon.bind((0, _assertThisInitialized2["default"])(_this)); // Render floating hover controls

      _this.renderHoverControls = _this.renderHoverControls.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        hoverSection: null // Current section being hovered over

      }; // Index of cell components by "<rowIndex>:<columnIndex>"

      _this.cellComps = {};
      return _this;
    }

    (0, _createClass2["default"])(PivotChartLayoutComponent, [{
      key: "recordCellComp",
      value: function recordCellComp(rowIndex, columnIndex, comp) {
        var key;
        boundMethodCheck(this, PivotChartLayoutComponent);
        key = "".concat(rowIndex, ":").concat(columnIndex);

        if (comp) {
          return this.cellComps[key] = comp;
        } else {
          return delete this.cellComps[key];
        }
      }
    }, {
      key: "renderRow",
      value: function renderRow(row, rowIndex) {
        var _this2 = this;

        return R('tr', {
          key: rowIndex
        }, _.map(row.cells, function (cell, columnIndex) {
          return R(LayoutCellComponent, {
            ref: _this2.recordCellComp.bind(null, rowIndex, columnIndex),
            key: columnIndex,
            layout: _this2.props.layout,
            rowIndex: rowIndex,
            columnIndex: columnIndex,
            onHover: _this2.props.editable ? function () {
              return _this2.setState({
                hoverSection: cell.section
              });
            } : void 0,
            hoverSection: _this2.props.editable ? _this2.state.hoverSection : void 0,
            onEditSection: _this2.props.onEditSection ? _this2.props.onEditSection.bind(null, cell.section) : void 0,
            onSummarizeSegment: _this2.props.onSummarizeSegment ? _this2.props.onSummarizeSegment.bind(null, cell.section) : void 0
          });
        }));
      }
    }, {
      key: "renderHoverPlusIcon",
      value: function renderHoverPlusIcon(key, x, y, onClick) {
        boundMethodCheck(this, PivotChartLayoutComponent); // Render a plus box

        return R('div', {
          key: key,
          onClick: onClick,
          style: {
            position: "absolute",
            left: x - 7,
            top: y - 6,
            border: "solid 1px #337ab7",
            backgroundColor: "white",
            paddingLeft: 3,
            paddingRight: 3,
            paddingTop: 0,
            color: "#337ab7",
            fontSize: 9,
            cursor: "pointer",
            opacity: 0.8
          }
        }, R(ui.Icon, {
          id: "fa-plus"
        }));
      }
    }, {
      key: "renderHoverRemoveIcon",
      value: function renderHoverRemoveIcon(key, x, y, onClick) {
        boundMethodCheck(this, PivotChartLayoutComponent); // Render a plus box

        return R('div', {
          key: key,
          onClick: onClick,
          style: {
            position: "absolute",
            left: x - 7,
            top: y - 6,
            border: "solid 1px #337ab7",
            backgroundColor: "white",
            paddingLeft: 3,
            paddingRight: 3,
            paddingTop: 0,
            color: "#337ab7",
            fontSize: 9,
            cursor: "pointer",
            opacity: 0.8
          }
        }, R(ui.Icon, {
          id: "fa-remove"
        }));
      }
    }, {
      key: "renderHoverControls",
      value: function renderHoverControls() {
        var cell, cellTd, columnIndex, controls, key, maxX, maxY, minX, minY, ref, ref1, ref2, rowIndex, sectionType;
        boundMethodCheck(this, PivotChartLayoutComponent);

        if (!this.state.hoverSection) {
          return;
        } // Determine hover rectangle and section type (row, column or intersection)


        minX = maxX = minY = maxY = null;
        sectionType = null;
        ref = this.cellComps;

        for (key in ref) {
          cell = ref[key];
          rowIndex = parseInt(key.split(":")[0]);
          columnIndex = parseInt(key.split(":")[1]);
          cellTd = cell.getTdComponent();

          if (!cellTd) {
            continue;
          } // If hover


          if (((ref1 = this.props.layout.rows[rowIndex]) != null ? (ref2 = ref1.cells[columnIndex]) != null ? ref2.section : void 0 : void 0) === this.state.hoverSection) {
            // Add bounds
            minX = minX == null || cellTd.offsetLeft < minX ? cellTd.offsetLeft : minX;
            minY = minY == null || cellTd.offsetTop < minY ? cellTd.offsetTop : minY;
            maxX = maxX == null || cellTd.offsetLeft + cellTd.offsetWidth > maxX ? cellTd.offsetLeft + cellTd.offsetWidth : maxX;
            maxY = maxY == null || cellTd.offsetTop + cellTd.offsetHeight > maxY ? cellTd.offsetTop + cellTd.offsetHeight : maxY; // Record type

            sectionType = this.props.layout.rows[rowIndex].cells[columnIndex].type;
          }
        }

        if (minX == null || !sectionType) {
          return null;
        } // Determine types of controls to show


        controls = [];

        if (sectionType === "row" && this.props.onInsertBeforeSegment) {
          controls.push(this.renderHoverPlusIcon("top", (minX + maxX) / 2, minY, this.props.onInsertBeforeSegment.bind(null, this.state.hoverSection)));
        }

        if (sectionType === "row" && this.props.onInsertAfterSegment) {
          controls.push(this.renderHoverPlusIcon("bottom", (minX + maxX) / 2, maxY, this.props.onInsertAfterSegment.bind(null, this.state.hoverSection)));
        }

        if (sectionType === "row" && this.props.onAddChildSegment) {
          controls.push(this.renderHoverPlusIcon("right", maxX, (minY + maxY) / 2, this.props.onAddChildSegment.bind(null, this.state.hoverSection)));
        }

        if (sectionType === "column" && this.props.onInsertBeforeSegment) {
          controls.push(this.renderHoverPlusIcon("left", minX, (minY + maxY) / 2, this.props.onInsertBeforeSegment.bind(null, this.state.hoverSection)));
        }

        if (sectionType === "column" && this.props.onInsertAfterSegment) {
          controls.push(this.renderHoverPlusIcon("right", maxX, (minY + maxY) / 2, this.props.onInsertAfterSegment.bind(null, this.state.hoverSection)));
        }

        if (sectionType === "column" && this.props.onAddChildSegment) {
          controls.push(this.renderHoverPlusIcon("bottom", (minX + maxX) / 2, maxY, this.props.onAddChildSegment.bind(null, this.state.hoverSection)));
        }

        if ((sectionType === 'row' || sectionType === 'column') && this.props.onRemoveSegment) {
          controls.push(this.renderHoverRemoveIcon("topright", maxX, minY, this.props.onRemoveSegment.bind(null, this.state.hoverSection)));
        }

        return R('div', {
          key: "hover-controls"
        }, controls);
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        return R('div', {
          style: {
            position: "relative"
          },
          onMouseLeave: function onMouseLeave() {
            return _this3.setState({
              hoverSection: null
            });
          } // Define CSS classes to keep HTML as small as possible
          // https://stackoverflow.com/a/19047221/876117
          // https://github.com/mWater/mwater-portal/issues/1183
          // cell borders not visible in firefox when you have a cell with position relative inside a table with collapsed borders

        }, R('style', null, ".pivot-chart-table {\n  width: 100%;\n  border-spacing: 0;\n  border-collapse: collapse;\n  position: relative;\n}\n\n.pivot-chart-table .cell {\n  padding: 5px;\n  vertical-align: top;\n  background-color: white;\n}\n\n.pivot-chart-table .bt1 { border-top: solid 1px #f4f4f4 }\n.pivot-chart-table .bt2 { border-top: solid 1px #ccc }\n.pivot-chart-table .bt3 { border-top: solid 1px #888 }\n\n.pivot-chart-table .bb1 { border-bottom: solid 1px #f4f4f4 }\n.pivot-chart-table .bb2 { border-bottom: solid 1px #ccc }\n.pivot-chart-table .bb3 { border-bottom: solid 1px #888 }\n\n.pivot-chart-table .bl1 { border-left: solid 1px #f4f4f4 }\n.pivot-chart-table .bl2 { border-left: solid 1px #ccc }\n.pivot-chart-table .bl3 { border-left: solid 1px #888 }\n\n.pivot-chart-table .br1 { border-right: solid 1px #f4f4f4 }\n.pivot-chart-table .br2 { border-right: solid 1px #ccc }\n.pivot-chart-table .br3 { border-right: solid 1px #888 }"), this.props.layout.tooManyRows ? R('div', {
          className: "text-warning",
          style: {
            fontSize: 12
          }
        }, R('i', {
          className: "fa fa-exclamation-circle"
        }), " Warning: Too many rows in table to display") : void 0, this.props.layout.tooManyColumns ? R('div', {
          className: "text-warning",
          style: {
            fontSize: 12
          }
        }, R('i', {
          className: "fa fa-exclamation-circle"
        }), " Warning: Too many columns in table to display") : void 0, R('table', {
          className: "pivot-chart-table"
        }, R('tbody', null, _.map(this.props.layout.rows, function (row, rowIndex) {
          return _this3.renderRow(row, rowIndex);
        }))), this.renderHoverControls());
      }
    }]);
    return PivotChartLayoutComponent;
  }(React.Component);

  ;
  PivotChartLayoutComponent.propTypes = {
    layout: PropTypes.object.isRequired,
    // See README.md
    editable: PropTypes.bool,
    // If true, all below must be present. If false, none must be present
    onEditSection: PropTypes.func,
    // Called with id of section (segment id or intersection id)
    onRemoveSegment: PropTypes.func,
    // Called with id of segment
    onInsertBeforeSegment: PropTypes.func,
    // Called with id of segment
    onInsertAfterSegment: PropTypes.func,
    // Called with id of segment
    onAddChildSegment: PropTypes.func,
    // Called with id of segment
    onSummarizeSegment: PropTypes.func // Called with id of segment. Summarizes the segment

  };
  return PivotChartLayoutComponent;
}.call(void 0);

LayoutCellComponent = function () {
  // Single layout cell
  var LayoutCellComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(LayoutCellComponent, _React$Component2);

    var _super2 = _createSuper(LayoutCellComponent);

    function LayoutCellComponent() {
      var _this4;

      (0, _classCallCheck2["default"])(this, LayoutCellComponent);
      _this4 = _super2.apply(this, arguments);
      _this4.handleClick = _this4.handleClick.bind((0, _assertThisInitialized2["default"])(_this4));
      return _this4;
    }

    (0, _createClass2["default"])(LayoutCellComponent, [{
      key: "handleClick",
      value: function handleClick(ev) {
        var cell;
        boundMethodCheck(this, LayoutCellComponent); // Ignore blanks

        cell = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex];

        if (!cell.section) {
          return;
        } // Ignore unconfigured cells


        if (cell.unconfigured) {
          return;
        }

        if (this.props.onEditSection) {
          return this.props.onEditSection();
        }
      } // Gets cell component

    }, {
      key: "getTdComponent",
      value: function getTdComponent() {
        return this.tdComponent;
      } // Render an unconfigured cell

    }, {
      key: "renderUnconfigured",
      value: function renderUnconfigured(cell) {
        return R('span', {
          style: {
            fontSize: "90%"
          }
        }, R('a', {
          style: {
            cursor: "pointer"
          },
          onClick: this.props.onEditSection
        }, "Edit"), cell.summarize ? [R('span', {
          className: "text-muted"
        }, " / "), R('a', {
          style: {
            cursor: "pointer"
          },
          onClick: this.props.onSummarizeSegment
        }, "Summarize")] : void 0);
      }
    }, {
      key: "render",
      value: function render() {
        var _this5 = this;

        var backgroundColor, borderBottom, borderRight, borderWeights, cell, classes, innerStyle, isHover, ref, ref1, ref2, ref3, style;
        cell = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex];

        if (cell.skip) {
          return null;
        }

        isHover = this.props.hoverSection && cell.section === this.props.hoverSection; // Determine background color

        backgroundColor = cell.unconfigured && this.props.onEditSection ? "#eff5fb" : cell.backgroundColor || null;

        if (isHover) {
          backgroundColor = Color(backgroundColor || "#ffffff").darken(0.03);
        } // Add striping


        if (this.props.layout.striping === "columns" && ((ref = cell.type) === 'column' || ref === 'intersection') && this.props.columnIndex % 2 === 0) {
          backgroundColor = Color(backgroundColor || "#ffffff").darken(0.03);
        } else if (this.props.layout.striping === "rows" && ((ref1 = cell.type) === 'row' || ref1 === 'intersection') && this.props.rowIndex % 2 === 0) {
          backgroundColor = Color(backgroundColor || "#ffffff").darken(0.03);
        }

        borderWeights = [null, "solid 1px #f4f4f4", "solid 1px #ccc", "solid 1px #888"]; // Collapsed borders mean that weights need to be combined for adjacent cells

        borderBottom = Math.max(cell.borderBottom || 0, ((ref2 = this.props.layout.rows[this.props.rowIndex + 1]) != null ? ref2.cells[this.props.columnIndex].borderTop : void 0) || 0);
        borderRight = Math.max(cell.borderRight || 0, ((ref3 = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex + 1]) != null ? ref3.borderLeft : void 0) || 0);
        style = {
          backgroundColor: backgroundColor,
          textAlign: cell.align,
          cursor: isHover && !cell.unconfigured ? "pointer" : void 0
        };
        classes = classNames({
          cell: true,
          // List out borders in compact way to keep HTML smaller
          bt1: cell.borderTop === 1,
          bt2: cell.borderTop === 2,
          bt3: cell.borderTop === 3,
          bb1: cell.borderBottom === 1,
          bb2: cell.borderBottom === 2,
          bb3: cell.borderBottom === 3,
          bl1: cell.borderLeft === 1,
          bl2: cell.borderLeft === 2,
          bl3: cell.borderLeft === 3,
          br1: cell.borderRight === 1,
          br2: cell.borderRight === 2,
          br3: cell.borderRight === 3
        }); // Style that should not affect popup menu

        innerStyle = {
          fontWeight: cell.bold ? "bold" : void 0,
          fontStyle: cell.italic ? "italic" : void 0,
          marginLeft: cell.indent ? cell.indent * 5 : void 0
        };
        return R('td', {
          ref: function ref(c) {
            return _this5.tdComponent = c;
          },
          onMouseEnter: this.props.onHover,
          onClick: this.handleClick,
          className: classes,
          style: style,
          colSpan: cell.columnSpan || null,
          rowSpan: cell.rowSpan || null
        }, R('span', {
          style: innerStyle
        }, cell.unconfigured && this.props.onEditSection ? this.renderUnconfigured(cell) : cell.text || "\xA0\xA0\xA0")); // Placeholder
      }
    }]);
    return LayoutCellComponent;
  }(React.Component);

  ;
  LayoutCellComponent.propTypes = {
    layout: PropTypes.object.isRequired,
    // See PivotChart Design.md
    rowIndex: PropTypes.number.isRequired,
    columnIndex: PropTypes.number.isRequired,
    hoverSection: PropTypes.string,
    // Which section is currently hovered over
    onHover: PropTypes.func,
    // Called when hovered over
    onEditSection: PropTypes.func,
    onSummarizeSegment: PropTypes.func
  };
  return LayoutCellComponent;
}.call(void 0);
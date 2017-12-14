var Color, H, LayoutCellComponent, PivotChartLayoutComponent, PropTypes, R, React, ReactDOM, _, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

H = React.DOM;

Color = require('color');

ui = require('react-library/lib/bootstrap');

module.exports = PivotChartLayoutComponent = (function(superClass) {
  extend(PivotChartLayoutComponent, superClass);

  PivotChartLayoutComponent.propTypes = {
    layout: PropTypes.object.isRequired,
    editable: PropTypes.bool,
    onEditSection: PropTypes.func,
    onRemoveSegment: PropTypes.func,
    onInsertBeforeSegment: PropTypes.func,
    onInsertAfterSegment: PropTypes.func,
    onAddChildSegment: PropTypes.func,
    onSummarizeSegment: PropTypes.func
  };

  function PivotChartLayoutComponent(props) {
    this.renderHoverControls = bind(this.renderHoverControls, this);
    this.renderHoverRemoveIcon = bind(this.renderHoverRemoveIcon, this);
    this.renderHoverPlusIcon = bind(this.renderHoverPlusIcon, this);
    this.recordCellComp = bind(this.recordCellComp, this);
    PivotChartLayoutComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      hoverSection: null
    };
    this.cellComps = {};
  }

  PivotChartLayoutComponent.prototype.recordCellComp = function(rowIndex, columnIndex, comp) {
    var key;
    key = rowIndex + ":" + columnIndex;
    if (comp) {
      return this.cellComps[key] = comp;
    } else {
      return delete this.cellComps[key];
    }
  };

  PivotChartLayoutComponent.prototype.renderRow = function(row, rowIndex) {
    return H.tr({
      key: rowIndex
    }, _.map(row.cells, (function(_this) {
      return function(cell, columnIndex) {
        return R(LayoutCellComponent, {
          ref: _this.recordCellComp.bind(null, rowIndex, columnIndex),
          key: columnIndex,
          layout: _this.props.layout,
          rowIndex: rowIndex,
          columnIndex: columnIndex,
          onHover: _this.props.editable ? (function() {
            return _this.setState({
              hoverSection: cell.section
            });
          }) : void 0,
          hoverSection: _this.props.editable ? _this.state.hoverSection : void 0,
          onEditSection: _this.props.onEditSection ? _this.props.onEditSection.bind(null, cell.section) : void 0,
          onSummarizeSegment: _this.props.onSummarizeSegment ? _this.props.onSummarizeSegment.bind(null, cell.section) : void 0
        });
      };
    })(this)));
  };

  PivotChartLayoutComponent.prototype.renderHoverPlusIcon = function(key, x, y, onClick) {
    return H.div({
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
  };

  PivotChartLayoutComponent.prototype.renderHoverRemoveIcon = function(key, x, y, onClick) {
    return H.div({
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
  };

  PivotChartLayoutComponent.prototype.renderHoverControls = function() {
    var cell, cellTd, columnIndex, controls, key, maxX, maxY, minX, minY, ref, ref1, ref2, rowIndex, sectionType;
    if (!this.state.hoverSection) {
      return;
    }
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
      }
      if (((ref1 = this.props.layout.rows[rowIndex]) != null ? (ref2 = ref1.cells[columnIndex]) != null ? ref2.section : void 0 : void 0) === this.state.hoverSection) {
        minX = (minX == null) || cellTd.offsetLeft < minX ? cellTd.offsetLeft : minX;
        minY = (minY == null) || cellTd.offsetTop < minY ? cellTd.offsetTop : minY;
        maxX = (maxX == null) || cellTd.offsetLeft + cellTd.offsetWidth > maxX ? cellTd.offsetLeft + cellTd.offsetWidth : maxX;
        maxY = (maxY == null) || cellTd.offsetTop + cellTd.offsetHeight > maxY ? cellTd.offsetTop + cellTd.offsetHeight : maxY;
        sectionType = this.props.layout.rows[rowIndex].cells[columnIndex].type;
      }
    }
    if ((minX == null) || !sectionType) {
      return null;
    }
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
    return H.div({
      key: "hover-controls"
    }, controls);
  };

  PivotChartLayoutComponent.prototype.render = function() {
    var style;
    style = {
      width: "100%",
      borderSpacing: 0,
      borderCollapse: "collapse",
      position: "relative"
    };
    return H.div({
      style: {
        position: "relative"
      },
      onMouseLeave: ((function(_this) {
        return function() {
          return _this.setState({
            hoverSection: null
          });
        };
      })(this))
    }, H.table({
      style: style
    }, H.tbody(null, _.map(this.props.layout.rows, (function(_this) {
      return function(row, rowIndex) {
        return _this.renderRow(row, rowIndex);
      };
    })(this)))), this.renderHoverControls());
  };

  return PivotChartLayoutComponent;

})(React.Component);

LayoutCellComponent = (function(superClass) {
  extend(LayoutCellComponent, superClass);

  function LayoutCellComponent() {
    this.handleClick = bind(this.handleClick, this);
    return LayoutCellComponent.__super__.constructor.apply(this, arguments);
  }

  LayoutCellComponent.propTypes = {
    layout: PropTypes.object.isRequired,
    rowIndex: PropTypes.number.isRequired,
    columnIndex: PropTypes.number.isRequired,
    hoverSection: PropTypes.string,
    onHover: PropTypes.func,
    onEditSection: PropTypes.func,
    onSummarizeSegment: PropTypes.func
  };

  LayoutCellComponent.prototype.handleClick = function(ev) {
    var cell;
    cell = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex];
    if (!cell.section) {
      return;
    }
    if (cell.unconfigured) {
      return;
    }
    if (this.props.onEditSection) {
      return this.props.onEditSection();
    }
  };

  LayoutCellComponent.prototype.getTdComponent = function() {
    return this.tdComponent;
  };

  LayoutCellComponent.prototype.renderUnconfigured = function(cell) {
    return H.span({
      style: {
        fontSize: "90%"
      }
    }, H.a({
      style: {
        cursor: "pointer"
      },
      onClick: this.props.onEditSection
    }, "Edit"), cell.summarize ? [
      H.span({
        className: "text-muted"
      }, " / "), H.a({
        style: {
          cursor: "pointer"
        },
        onClick: this.props.onSummarizeSegment
      }, "Summarize")
    ] : void 0);
  };

  LayoutCellComponent.prototype.render = function() {
    var backgroundColor, borderBottom, borderRight, borderWeights, cell, innerStyle, isHover, ref, ref1, ref2, ref3, style;
    cell = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex];
    if (cell.skip) {
      return null;
    }
    isHover = this.props.hoverSection && cell.section === this.props.hoverSection;
    backgroundColor = cell.unconfigured && this.props.onEditSection ? "#eff5fb" : cell.backgroundColor || "#FFFFFF";
    if (isHover) {
      backgroundColor = Color(backgroundColor).darken(0.03);
    }
    if (this.props.layout.striping === "columns" && ((ref = cell.type) === 'column' || ref === 'intersection') && this.props.columnIndex % 2 === 0) {
      backgroundColor = Color(backgroundColor).darken(0.03);
    } else if (this.props.layout.striping === "rows" && ((ref1 = cell.type) === 'row' || ref1 === 'intersection') && this.props.rowIndex % 2 === 0) {
      backgroundColor = Color(backgroundColor).darken(0.03);
    }
    borderWeights = [null, "solid 1px #f4f4f4", "solid 1px #ccc", "solid 1px #888"];
    borderBottom = Math.max(cell.borderBottom || 0, ((ref2 = this.props.layout.rows[this.props.rowIndex + 1]) != null ? ref2.cells[this.props.columnIndex].borderTop : void 0) || 0);
    borderRight = Math.max(cell.borderRight || 0, ((ref3 = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex + 1]) != null ? ref3.borderLeft : void 0) || 0);
    style = {
      padding: 5,
      verticalAlign: "top",
      backgroundColor: backgroundColor,
      position: "relative",
      textAlign: cell.align,
      cursor: isHover && !cell.unconfigured ? "pointer" : void 0,
      borderTop: borderWeights[cell.borderTop || 0],
      borderBottom: borderWeights[borderBottom],
      borderLeft: borderWeights[cell.borderLeft || 0],
      borderRight: borderWeights[borderRight]
    };
    innerStyle = {
      fontWeight: cell.bold ? "bold" : void 0,
      fontStyle: cell.italic ? "italic" : void 0,
      marginLeft: cell.indent ? cell.indent * 5 : void 0
    };
    return H.td({
      ref: ((function(_this) {
        return function(c) {
          return _this.tdComponent = c;
        };
      })(this)),
      onMouseEnter: this.props.onHover,
      onClick: this.handleClick,
      style: style,
      colSpan: cell.columnSpan || 1,
      rowSpan: cell.rowSpan || 1
    }, H.span({
      style: innerStyle
    }, cell.unconfigured && this.props.onEditSection ? this.renderUnconfigured(cell) : cell.text || "\u00A0\u00A0\u00A0"));
  };

  return LayoutCellComponent;

})(React.Component);

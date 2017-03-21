var Color, H, LayoutCellComponent, PivotChartLayoutComponent, R, React, ReactDOM, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

_ = require('lodash');

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

H = React.DOM;

Color = require('color');

module.exports = PivotChartLayoutComponent = (function(superClass) {
  extend(PivotChartLayoutComponent, superClass);

  PivotChartLayoutComponent.propTypes = {
    layout: React.PropTypes.object.isRequired,
    editable: React.PropTypes.bool,
    onEditSection: React.PropTypes.func,
    onRemoveSegment: React.PropTypes.func,
    onInsertBeforeSegment: React.PropTypes.func,
    onInsertAfterSegment: React.PropTypes.func,
    onAddChildSegment: React.PropTypes.func
  };

  function PivotChartLayoutComponent(props) {
    PivotChartLayoutComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      hoverSection: null
    };
  }

  PivotChartLayoutComponent.prototype.renderRow = function(row, rowIndex) {
    return H.tr({
      key: rowIndex
    }, _.map(row.cells, (function(_this) {
      return function(cell, columnIndex) {
        return R(LayoutCellComponent, {
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
          onRemoveSegment: _this.props.onRemoveSegment ? _this.props.onRemoveSegment.bind(null, cell.section) : void 0,
          onInsertBeforeSegment: _this.props.onInsertBeforeSegment ? _this.props.onInsertBeforeSegment.bind(null, cell.section) : void 0,
          onInsertAfterSegment: _this.props.onInsertAfterSegment ? _this.props.onInsertAfterSegment.bind(null, cell.section) : void 0,
          onAddChildSegment: _this.props.onAddChildSegment ? _this.props.onAddChildSegment.bind(null, cell.section) : void 0
        });
      };
    })(this)));
  };

  PivotChartLayoutComponent.prototype.render = function() {
    var style;
    style = {
      width: "100%",
      borderSpacing: 0,
      borderCollapse: "collapse"
    };
    return H.table({
      style: style
    }, H.tbody({
      onMouseLeave: ((function(_this) {
        return function() {
          return _this.setState({
            hoverSection: null
          });
        };
      })(this))
    }, _.map(this.props.layout.rows, (function(_this) {
      return function(row, rowIndex) {
        return _this.renderRow(row, rowIndex);
      };
    })(this))));
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
    layout: React.PropTypes.object.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    columnIndex: React.PropTypes.number.isRequired,
    hoverSection: React.PropTypes.string,
    onHover: React.PropTypes.func,
    onEditSection: React.PropTypes.func,
    onRemoveSegment: React.PropTypes.func,
    onInsertBeforeSegment: React.PropTypes.func,
    onInsertAfterSegment: React.PropTypes.func,
    onAddChildSegment: React.PropTypes.func
  };

  LayoutCellComponent.prototype.handleClick = function(ev) {
    var cell, elem;
    elem = ev.target;
    while (elem) {
      if (elem === this.menuEl) {
        return;
      }
      elem = elem.parentElement;
    }
    cell = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex];
    if (!cell.section) {
      return;
    }
    if (this.props.onEditSection) {
      return this.props.onEditSection();
    }
  };

  LayoutCellComponent.prototype.renderMenuItems = function(cell) {
    var ref, ref1;
    return [
      this.props.onEditSection ? H.li({
        key: "edit"
      }, H.a({
        onClick: this.props.onEditSection
      }, "Edit")) : void 0, this.props.onRemoveSegment && ((ref = cell.type) === "row" || ref === "column") ? H.li({
        key: "remove"
      }, H.a({
        onClick: this.props.onRemoveSegment
      }, "Remove")) : void 0, this.props.onInsertBeforeSegment && cell.type === "row" ? H.li({
        key: "before"
      }, H.a({
        onClick: this.props.onInsertBeforeSegment
      }, "Insert Above")) : void 0, this.props.onInsertAfterSegment && cell.type === "row" ? H.li({
        key: "after"
      }, H.a({
        onClick: this.props.onInsertAfterSegment
      }, "Insert Below")) : void 0, this.props.onInsertBeforeSegment && cell.type === "column" ? H.li({
        key: "before"
      }, H.a({
        onClick: this.props.onInsertBeforeSegment
      }, "Insert Left")) : void 0, this.props.onInsertAfterSegment && cell.type === "column" ? H.li({
        key: "after"
      }, H.a({
        onClick: this.props.onInsertAfterSegment
      }, "Insert Right")) : void 0, this.props.onAddChildSegment && ((ref1 = cell.type) === "row" || ref1 === "column") ? H.li({
        key: "child"
      }, H.a({
        onClick: this.props.onAddChildSegment
      }, "Subdivide")) : void 0
    ];
  };

  LayoutCellComponent.prototype.renderMenu = function(cell) {
    var innerStyle, outerStyle;
    outerStyle = {
      position: "absolute",
      top: 5,
      right: 5,
      zIndex: 1000
    };
    innerStyle = {
      backgroundColor: "white",
      border: "solid 1px #337ab7",
      opacity: 0.7,
      color: "#337ab7",
      cursor: "pointer"
    };
    return H.div({
      className: "dropdown",
      style: outerStyle,
      ref: ((function(_this) {
        return function(el) {
          return _this.menuEl = el;
        };
      })(this))
    }, H.div({
      style: innerStyle,
      "data-toggle": "dropdown"
    }, H.i({
      className: "fa fa-pencil fa-fw"
    })), H.ul({
      className: "dropdown-menu dropdown-menu-right",
      style: {
        top: 20
      }
    }, this.renderMenuItems(cell)));
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
      cursor: isHover ? "pointer" : void 0,
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
      onMouseEnter: this.props.onHover,
      onClick: this.handleClick,
      style: style,
      colSpan: cell.columnSpan || 1,
      rowSpan: cell.rowSpan || 1
    }, cell.sectionTop && cell.sectionRight && isHover ? this.renderMenu(cell) : void 0, H.span({
      style: innerStyle
    }, cell.unconfigured && this.props.onEditSection ? "Click to configure" : void 0, cell.text || "\u00A0"));
  };

  return LayoutCellComponent;

})(React.Component);

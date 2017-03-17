var H, LayoutCellComponent, PivotChartLayoutComponent, R, React, ReactDOM, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

_ = require('lodash');

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

H = React.DOM;

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
      width: "100%"
    };
    return H.table({
      style: style,
      className: "table table-bordered"
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
    var ref, ref1, ref2, ref3, ref4, ref5;
    return [
      this.props.onEditSection ? H.li({
        key: "edit"
      }, H.a({
        onClick: this.props.onEditSection
      }, "Edit")) : void 0, this.props.onRemoveSegment && ((ref = cell.type) === "rowLabel" || ref === "rowSegment" || ref === "columnLabel" || ref === "columnSegment") ? H.li({
        key: "remove"
      }, H.a({
        onClick: this.props.onRemoveSegment
      }, "Remove")) : void 0, this.props.onInsertBeforeSegment && ((ref1 = cell.type) === "rowLabel" || ref1 === "rowSegment") ? H.li({
        key: "before"
      }, H.a({
        onClick: this.props.onInsertBeforeSegment
      }, "Insert Above")) : void 0, this.props.onInsertAfterSegment && ((ref2 = cell.type) === "rowLabel" || ref2 === "rowSegment") ? H.li({
        key: "after"
      }, H.a({
        onClick: this.props.onInsertAfterSegment
      }, "Insert Below")) : void 0, this.props.onInsertBeforeSegment && ((ref3 = cell.type) === "columnLabel" || ref3 === "columnSegment") ? H.li({
        key: "before"
      }, H.a({
        onClick: this.props.onInsertBeforeSegment
      }, "Insert Left")) : void 0, this.props.onInsertAfterSegment && ((ref4 = cell.type) === "columnLabel" || ref4 === "columnSegment") ? H.li({
        key: "after"
      }, H.a({
        onClick: this.props.onInsertAfterSegment
      }, "Insert Right")) : void 0, this.props.onAddChildSegment && ((ref5 = cell.type) === "rowLabel" || ref5 === "rowSegment" || ref5 === "columnLabel" || ref5 === "columnSegment") ? H.li({
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
    var cell, isHover, isRight, isTop, ref, style;
    cell = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex];
    if (cell.type === "skip") {
      return null;
    }
    isTop = cell.section && (this.props.rowIndex === 0 || this.props.layout.rows[this.props.rowIndex - 1].cells[this.props.columnIndex].section !== cell.section);
    isRight = cell.section && (this.props.columnIndex >= this.props.layout.rows[0].cells.length - (cell.columnSpan || 1) || this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex + (cell.columnSpan || 1)].section !== cell.section);
    isHover = this.props.hoverSection && cell.section === this.props.hoverSection;
    style = {
      padding: 5,
      backgroundColor: cell.unconfigured && !isHover && this.props.onEditSection ? "#dfebf6" : cell.unconfigured && this.props.onEditSection ? "#eff5fb" : isHover ? "#F8F8F8" : void 0,
      position: "relative",
      textAlign: cell.align,
      cursor: isHover ? "pointer" : void 0,
      color: (ref = cell.type) === 'rowSegment' || ref === 'columnSegment' ? "#666" : void 0
    };
    return H.td({
      onMouseEnter: this.props.onHover,
      onClick: this.handleClick,
      style: style,
      colSpan: cell.columnSpan || 1,
      rowSpan: cell.rowSpan || 1
    }, isTop && isRight && isHover ? this.renderMenu(cell) : void 0, cell.unconfigured && this.props.onEditSection ? "Click to configure" : void 0, cell.text || "\u00A0");
  };

  return LayoutCellComponent;

})(React.Component);

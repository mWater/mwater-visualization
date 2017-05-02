var AxisBuilder, DashboardPopupComponent, ExprUtils, H, R, React, TableChartUtils, TableChartViewComponent, TableContentsComponent, _, ui,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

AxisBuilder = require('../../../axes/AxisBuilder');

ExprUtils = require('mwater-expressions').ExprUtils;

ui = require('react-library/lib/bootstrap');

TableChartUtils = require('./TableChartUtils');

DashboardPopupComponent = require('../../../dashboards/DashboardPopupComponent');

module.exports = TableChartViewComponent = (function(superClass) {
  extend(TableChartViewComponent, superClass);

  function TableChartViewComponent() {
    return TableChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  TableChartViewComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    standardWidth: React.PropTypes.number,
    scope: React.PropTypes.shape({
      name: React.PropTypes.node.isRequired,
      filter: React.PropTypes.shape({
        table: React.PropTypes.string.isRequired,
        jsonql: React.PropTypes.object.isRequired
      }),
      data: React.PropTypes.any
    }),
    onScopeChange: React.PropTypes.func,
    onSystemAction: React.PropTypes.func,
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      design: React.PropTypes.object.isRequired
    })).isRequired,
    onPopupsChange: React.PropTypes.func,
    namedStrings: React.PropTypes.object,
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired,
      jsonql: React.PropTypes.object.isRequired
    }))
  };

  TableChartViewComponent.prototype.shouldComponentUpdate = function(prevProps) {
    return !_.isEqual(prevProps, this.props);
  };

  TableChartViewComponent.prototype.render = function() {
    var style;
    style = {
      width: this.props.standardWidth,
      height: this.props.height * (this.props.standardWidth / this.props.width),
      transform: "scale(" + (this.props.width / this.props.standardWidth) + ", " + (this.props.width / this.props.standardWidth) + ")",
      transformOrigin: "0 0"
    };
    return H.div({
      style: style,
      className: "overflow-auto-except-print"
    }, H.div({
      style: {
        fontWeight: "bold",
        textAlign: "center"
      },
      ref: "title"
    }, this.props.design.titleText), R(TableContentsComponent, {
      design: this.props.design,
      data: this.props.data,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      widgetDataSource: this.props.widgetDataSource,
      onSystemAction: this.props.onSystemAction,
      scope: this.props.scope,
      onScopeChange: this.props.onScopeChange,
      popups: this.props.popups,
      onPopupsChange: this.props.onPopupsChange,
      namedStrings: this.props.namedStrings,
      filters: this.props.filters
    }));
  };

  return TableChartViewComponent;

})(React.Component);

TableContentsComponent = (function(superClass) {
  extend(TableContentsComponent, superClass);

  TableContentsComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    scope: React.PropTypes.shape({
      name: React.PropTypes.node.isRequired,
      filter: React.PropTypes.shape({
        table: React.PropTypes.string.isRequired,
        jsonql: React.PropTypes.object.isRequired
      }),
      data: React.PropTypes.any
    }),
    onScopeChange: React.PropTypes.func,
    onSystemAction: React.PropTypes.func,
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      design: React.PropTypes.object.isRequired
    })).isRequired,
    onPopupsChange: React.PropTypes.func,
    namedStrings: React.PropTypes.object,
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired,
      jsonql: React.PropTypes.object.isRequired
    }))
  };

  TableContentsComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  function TableContentsComponent() {
    this.handleSelectAll = bind(this.handleSelectAll, this);
    this.handleSelectRow = bind(this.handleSelectRow, this);
    this.handleMultiselectAction = bind(this.handleMultiselectAction, this);
    this.handleRowClick = bind(this.handleRowClick, this);
    TableContentsComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      selectedIds: {}
    };
  }

  TableContentsComponent.prototype.shouldComponentUpdate = function(prevProps, prevState) {
    if (prevProps.design !== this.props.design && !_.isEqual(prevProps.design, this.props.design)) {
      return true;
    }
    if (prevProps.data !== this.props.data && !_.isEqual(prevProps.data, this.props.data)) {
      return true;
    }
    if (prevProps.schema !== this.props.schema) {
      return true;
    }
    if (prevProps.scope !== this.props.scope) {
      return true;
    }
    if (prevState.selectedIds !== this.state.selectedIds) {
      return true;
    }
    return false;
  };

  TableContentsComponent.prototype.handleRowClick = function(rowIndex) {
    var row;
    row = this.props.data.main[rowIndex];
    if (this.props.design.clickAction === "scope") {
      if (this.props.scope && TableChartUtils.isRowScoped(row, this.props.scope.data)) {
        return this.props.onScopeChange(null);
      } else {
        return this.props.onScopeChange(TableChartUtils.createRowScope(this.props.design, this.props.schema, row));
      }
    } else if (this.props.design.clickAction === "popup" && this.props.design.clickActionPopup) {
      return this.dashboardPopupComponent.show(this.props.design.clickActionPopup, TableChartUtils.createRowFilter(this.props.design, this.props.schema, row));
    } else if (this.props.design.clickAction && this.props.design.clickAction.match(/^system:/) && row.id && this.props.onSystemAction) {
      return this.props.onSystemAction(this.props.design.clickAction.split(":")[1], this.props.design.table, [row.id]);
    }
  };

  TableContentsComponent.prototype.handleMultiselectAction = function(multiselectAction) {
    if (multiselectAction.action === "scope") {
      return alert("TODO");
    } else if (multiselectAction.action === "popup") {
      return alert("TODO");
    } else if (multiselectAction.action.match(/^system:/) && this.props.onSystemAction) {
      return this.props.onSystemAction(multiselectAction.action.split(":")[1], this.props.design.table, _.keys(this.state.selectedIds));
    }
  };

  TableContentsComponent.prototype.handleSelectRow = function(index, selected, ev) {
    var id, selectedIds;
    ev.stopPropagation();
    id = this.props.data.main[index].id;
    selectedIds = _.clone(this.state.selectedIds);
    if (selected) {
      delete selectedIds[id];
    } else {
      selectedIds[id] = true;
    }
    return this.setState({
      selectedIds: selectedIds
    });
  };

  TableContentsComponent.prototype.handleSelectAll = function(selected) {
    var j, len, ref, row, selectedIds;
    if (selected) {
      selectedIds = {};
    } else {
      selectedIds = {};
      ref = this.props.data.main;
      for (j = 0, len = ref.length; j < len; j++) {
        row = ref[j];
        selectedIds[row.id] = true;
      }
    }
    return this.setState({
      selectedIds: selectedIds
    });
  };

  TableContentsComponent.prototype.renderHeaderCell = function(index) {
    var axisBuilder, column, text;
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    column = this.props.design.columns[index];
    text = column.headerText || axisBuilder.summarizeAxis(column.textAxis, this.context.locale);
    return H.th({
      key: index
    }, text);
  };

  TableContentsComponent.prototype.renderSelectAll = function() {
    var selected;
    selected = _.keys(this.state.selectedIds).length >= this.props.data.main.length;
    return H.th({
      style: {
        width: 1,
        color: "#888"
      },
      onClick: this.handleSelectAll.bind(null, selected)
    }, selected ? H.i({
      className: "fa fa-fw fa-check-square",
      style: {
        color: "#2E6DA4"
      }
    }) : H.i({
      className: "fa fa-fw fa-square-o",
      style: {
        color: "#888"
      }
    }));
  };

  TableContentsComponent.prototype.renderHeader = function() {
    return H.thead({
      key: "head"
    }, H.tr({
      key: "head"
    }, this.props.design.multiselect ? this.renderSelectAll() : void 0, _.map(this.props.design.columns, (function(_this) {
      return function(column, i) {
        return _this.renderHeaderCell(i);
      };
    })(this))));
  };

  TableContentsComponent.prototype.renderImage = function(id) {
    var url;
    url = this.props.dataSource.getImageUrl(id);
    return H.a({
      href: url,
      key: id,
      target: "_blank",
      style: {
        paddingLeft: 5,
        paddingRight: 5
      }
    }, "Image");
  };

  TableContentsComponent.prototype.renderCell = function(rowIndex, columnIndex) {
    var column, exprType, exprUtils, node, ref, ref1, row, value;
    row = this.props.data.main[rowIndex];
    column = this.props.design.columns[columnIndex];
    exprUtils = new ExprUtils(this.props.schema);
    exprType = exprUtils.getExprType((ref = column.textAxis) != null ? ref.expr : void 0);
    value = row["c" + columnIndex];
    if (value == null) {
      node = null;
    } else {
      if ((exprType === 'image' || exprType === 'imagelist' || exprType === 'geometry' || exprType === 'text[]') && _.isString(value)) {
        value = JSON.parse(value);
      }
      switch (exprType) {
        case "text":
        case "number":
          node = value;
          break;
        case "boolean":
        case "enum":
        case "enumset":
        case "text[]":
          node = exprUtils.stringifyExprLiteral((ref1 = column.textAxis) != null ? ref1.expr : void 0, value, this.context.locale);
          break;
        case "date":
          node = moment(value, "YYYY-MM-DD").format("ll");
          break;
        case "datetime":
          node = moment(value, moment.ISO_8601).format("lll");
          break;
        case "image":
          node = this.renderImage(value.id);
          break;
        case "imagelist":
          node = _.map(value, (function(_this) {
            return function(v) {
              return _this.renderImage(v.id);
            };
          })(this));
          break;
        case "geometry":
          if (value.type === "Point") {
            node = (value.coordinates[1].toFixed(6)) + " " + (value.coordinates[0].toFixed(6));
          } else {
            node = value.type;
          }
          break;
        default:
          node = "" + value;
      }
    }
    return H.td({
      key: columnIndex
    }, node);
  };

  TableContentsComponent.prototype.renderCheckbox = function(index, selected) {
    return H.td({
      key: "checkbox",
      style: {
        width: 1
      },
      onClick: this.handleSelectRow.bind(null, index, selected)
    }, selected ? H.i({
      className: "fa fa-fw fa-check-square",
      style: {
        color: "#2E6DA4"
      }
    }) : H.i({
      className: "fa fa-fw fa-square-o",
      style: {
        color: "#888"
      }
    }));
  };

  TableContentsComponent.prototype.renderRow = function(index) {
    var row, scoped, selected, style;
    row = this.props.data.main[index];
    selected = this.props.design.multiselect && row.id && this.state.selectedIds[row.id];
    scoped = this.props.scope && TableChartUtils.isRowScoped(row, this.props.scope.data);
    style = {};
    if (scoped) {
      style.backgroundColor = "#bad5f7";
    } else if (selected) {
      style.backgroundColor = "#eee";
    }
    return H.tr({
      key: index,
      onClick: this.handleRowClick.bind(null, index),
      style: style
    }, [
      this.props.design.multiselect ? this.renderCheckbox(index, selected) : void 0, _.map(this.props.design.columns, (function(_this) {
        return function(column, i) {
          return _this.renderCell(index, i);
        };
      })(this))
    ]);
  };

  TableContentsComponent.prototype.renderBody = function() {
    return H.tbody({
      key: "body"
    }, _.map(this.props.data.main, (function(_this) {
      return function(row, i) {
        return _this.renderRow(i);
      };
    })(this)));
  };

  TableContentsComponent.prototype.renderActions = function() {
    if (this.props.design.multiselect && this.props.design.multiselectActions) {
      return H.div(null, _.map(this.props.design.multiselectActions, (function(_this) {
        return function(multiselectAction, index) {
          return R(ui.Button, {
            key: index,
            disabled: _.isEmpty(_this.state.selectedIds),
            onClick: _this.handleMultiselectAction.bind(null, multiselectAction),
            size: "xs"
          }, multiselectAction.label);
        };
      })(this)));
    }
  };

  TableContentsComponent.prototype.renderPopup = function() {
    return R(DashboardPopupComponent, {
      ref: (function(_this) {
        return function(c) {
          return _this.dashboardPopupComponent = c;
        };
      })(this),
      popups: this.props.popups,
      onPopupsChange: this.props.onPopupsChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      widgetDataSource: this.props.widgetDataSource,
      onSystemAction: this.props.onSystemAction,
      namedStrings: this.props.namedStrings,
      filters: this.props.filters
    });
  };

  TableContentsComponent.prototype.render = function() {
    return H.div(null, this.renderActions(), this.renderPopup(), H.table({
      className: "table table-condensed table-hover",
      style: {
        fontSize: "10pt",
        marginBottom: 0
      }
    }, this.renderHeader(), this.renderBody()));
  };

  return TableContentsComponent;

})(React.Component);

var AxisBuilder, DashboardPopupSelectorComponent, ExprComponent, ExprUtils, FilterExprComponent, H, LinkComponent, MultiselectActionsDesignerComponent, OrderingsComponent, R, React, ReorderableListComponent, TableChartColumnDesignerComponent, TableChartDesignerComponent, TableChartUtils, TableSelectComponent, _, ui, update, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('uuid');

ui = require('react-library/lib/bootstrap');

update = require('react-library/lib/update');

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../../../axes/AxisBuilder');

LinkComponent = require('mwater-expressions-ui').LinkComponent;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

OrderingsComponent = require('./OrderingsComponent');

TableSelectComponent = require('../../../TableSelectComponent');

ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");

DashboardPopupSelectorComponent = require('../../../dashboards/DashboardPopupSelectorComponent');

TableChartUtils = require('./TableChartUtils');

MultiselectActionsDesignerComponent = require('./MultiselectActionsDesignerComponent');

module.exports = TableChartDesignerComponent = (function(superClass) {
  extend(TableChartDesignerComponent, superClass);

  function TableChartDesignerComponent() {
    this.handleReorder = bind(this.handleReorder, this);
    this.renderColumn = bind(this.renderColumn, this);
    this.handleAddColumn = bind(this.handleAddColumn, this);
    this.handleRemoveColumn = bind(this.handleRemoveColumn, this);
    this.handleColumnChange = bind(this.handleColumnChange, this);
    this.handleOrderingsChange = bind(this.handleOrderingsChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleTitleTextChange = bind(this.handleTitleTextChange, this);
    this.update = bind(this.update, this);
    return TableChartDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  TableChartDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      design: React.PropTypes.object.isRequired
    })).isRequired,
    onPopupsChange: React.PropTypes.func,
    onSystemAction: React.PropTypes.func,
    namedStrings: React.PropTypes.object,
    getSystemActions: React.PropTypes.func,
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired,
      jsonql: React.PropTypes.object.isRequired
    }))
  };

  TableChartDesignerComponent.prototype.update = function() {
    return update(this.props.design, this.props.onDesignChange, arguments);
  };

  TableChartDesignerComponent.prototype.handleTitleTextChange = function(ev) {
    return this.update({
      titleText: ev.target.value
    });
  };

  TableChartDesignerComponent.prototype.handleTableChange = function(table) {
    return this.update({
      table: table
    });
  };

  TableChartDesignerComponent.prototype.handleFilterChange = function(filter) {
    return this.update({
      filter: filter
    });
  };

  TableChartDesignerComponent.prototype.handleOrderingsChange = function(orderings) {
    return this.update({
      orderings: orderings
    });
  };

  TableChartDesignerComponent.prototype.handleColumnChange = function(index, column) {
    var columns;
    columns = this.props.design.columns.slice();
    columns[index] = column;
    return this.update({
      columns: columns
    });
  };

  TableChartDesignerComponent.prototype.handleRemoveColumn = function(index) {
    var columns;
    columns = this.props.design.columns.slice();
    columns.splice(index, 1);
    return this.update({
      columns: columns
    });
  };

  TableChartDesignerComponent.prototype.handleAddColumn = function() {
    var columns;
    columns = this.props.design.columns.slice();
    columns.push({
      id: uuid()
    });
    return this.update({
      columns: columns
    });
  };

  TableChartDesignerComponent.prototype.renderTable = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.i({
      className: "fa fa-database"
    }), " ", "Data Source"), ": ", React.createElement(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: this.handleTableChange
    }));
  };

  TableChartDesignerComponent.prototype.renderTitle = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Title"), H.input({
      type: "text",
      className: "form-control input-sm",
      value: this.props.design.titleText,
      onChange: this.handleTitleTextChange,
      placeholder: "Untitled"
    }));
  };

  TableChartDesignerComponent.prototype.renderColumn = function(column, index, connectDragSource, connectDragPreview, connectDropTarget) {
    var style;
    style = {
      borderTop: "solid 1px #EEE",
      paddingTop: 10,
      paddingBottom: 10
    };
    return connectDragPreview(connectDropTarget(H.div({
      key: index,
      style: style
    }, React.createElement(TableChartColumnDesignerComponent, {
      design: this.props.design,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      index: index,
      onChange: this.handleColumnChange.bind(null, index),
      onRemove: this.handleRemoveColumn.bind(null, index),
      connectDragSource: connectDragSource
    }))));
  };

  TableChartDesignerComponent.prototype.handleReorder = function(map) {
    return this.update({
      columns: map
    });
  };

  TableChartDesignerComponent.prototype.renderColumns = function() {
    if (!this.props.design.table) {
      return;
    }
    return H.div(null, R(ReorderableListComponent, {
      items: this.props.design.columns,
      onReorder: this.handleReorder,
      renderItem: this.renderColumn,
      getItemId: (function(_this) {
        return function(item) {
          return item.id;
        };
      })(this)
    }), H.button({
      className: "btn btn-default btn-sm",
      type: "button",
      onClick: this.handleAddColumn
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Column"));
  };

  TableChartDesignerComponent.prototype.renderOrderings = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-sort-by-attributes"
    }), " ", "Ordering"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(OrderingsComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      orderings: this.props.design.orderings,
      onOrderingsChange: this.handleOrderingsChange,
      table: this.props.design.table
    })));
  };

  TableChartDesignerComponent.prototype.renderFilter = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " ", "Filters"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  TableChartDesignerComponent.prototype.renderAdvanced = function() {
    var action, actions, availableMultiselectActions, i, j, len, len1, options;
    options = [
      {
        value: null,
        label: "Do nothing"
      }, {
        value: "scope",
        label: "Filter other widgets"
      }, {
        value: "popup",
        label: "Open popup"
      }
    ];
    if (this.props.getSystemActions && !TableChartUtils.isTableAggr(this.props.design, this.props.schema)) {
      actions = this.props.getSystemActions(this.props.design.table);
      for (i = 0, len = actions.length; i < len; i++) {
        action = actions[i];
        if (!action.multiple && action.id === "open") {
          options.push({
            value: "system:" + action.id,
            label: action.name
          });
        }
      }
    }
    availableMultiselectActions = [];
    if (this.props.getSystemActions && this.props.design.multiselect) {
      actions = this.props.getSystemActions(this.props.design.table);
      for (j = 0, len1 = actions.length; j < len1; j++) {
        action = actions[j];
        if (action.multiple) {
          availableMultiselectActions.push({
            id: "system:" + action.id,
            name: action.name
          });
        }
      }
    }
    return R(ui.CollapsibleSection, {
      label: "Advanced",
      labelMuted: true
    }, R(ui.FormGroup, {
      labelMuted: true,
      label: "When row is clicked:"
    }, R(ui.Select, {
      value: this.props.design.clickAction || null,
      onChange: this.update("clickAction"),
      options: options
    })), this.props.design.clickAction === "popup" ? R(DashboardPopupSelectorComponent, {
      popups: this.props.popups,
      onPopupsChange: this.props.onPopupsChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      widgetDataSource: this.props.widgetDataSource,
      onSystemAction: this.props.onSystemAction,
      namedStrings: this.props.namedStrings,
      filters: this.props.filters,
      popupId: this.props.design.clickActionPopup,
      onPopupIdChange: this.update("clickActionPopup")
    }) : void 0, !TableChartUtils.isTableAggr(this.props.design, this.props.schema) ? R(ui.Checkbox, {
      value: this.props.design.multiselect,
      onChange: this.update("multiselect")
    }, "Allow selecting multiple rows") : void 0, this.props.design.multiselect && availableMultiselectActions && availableMultiselectActions.length > 0 ? R(ui.FormGroup, {
      labelMuted: true,
      label: "Options when multiple rows selected:"
    }, R(MultiselectActionsDesignerComponent, {
      availableActions: availableMultiselectActions,
      multiselectActions: this.props.design.multiselectActions,
      onMultiselectActionsChange: this.update("multiselectActions")
    })) : void 0);
  };

  TableChartDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.renderColumns(), this.props.design.table ? H.hr() : void 0, this.renderOrderings(), this.renderFilter(), H.hr(), this.renderTitle(), this.props.design.table ? this.renderAdvanced() : void 0);
  };

  return TableChartDesignerComponent;

})(React.Component);

TableChartColumnDesignerComponent = (function(superClass) {
  extend(TableChartColumnDesignerComponent, superClass);

  function TableChartColumnDesignerComponent() {
    this.handleAggrChange = bind(this.handleAggrChange, this);
    this.handleHeaderTextChange = bind(this.handleHeaderTextChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return TableChartColumnDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  TableChartColumnDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired
  };

  TableChartColumnDesignerComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  TableChartColumnDesignerComponent.prototype.updateColumn = function(changes) {
    var column;
    column = _.extend({}, this.props.design.columns[this.props.index], changes);
    return this.props.onChange(column);
  };

  TableChartColumnDesignerComponent.prototype.updateTextAxis = function(changes) {
    var textAxis;
    textAxis = _.extend({}, this.props.design.columns[this.props.index].textAxis, changes);
    return this.updateColumn({
      textAxis: textAxis
    });
  };

  TableChartColumnDesignerComponent.prototype.handleExprChange = function(expr) {
    return this.updateTextAxis({
      expr: expr
    });
  };

  TableChartColumnDesignerComponent.prototype.handleHeaderTextChange = function(ev) {
    return this.updateColumn({
      headerText: ev.target.value
    });
  };

  TableChartColumnDesignerComponent.prototype.handleAggrChange = function(aggr) {
    return this.updateTextAxis({
      aggr: aggr
    });
  };

  TableChartColumnDesignerComponent.prototype.renderRemove = function() {
    if (this.props.design.columns.length > 1) {
      return H.button({
        className: "btn btn-xs btn-link pull-right",
        type: "button",
        onClick: this.props.onRemove
      }, H.span({
        className: "glyphicon glyphicon-remove"
      }));
    }
  };

  TableChartColumnDesignerComponent.prototype.renderExpr = function() {
    var column, title;
    column = this.props.design.columns[this.props.index];
    title = "Value";
    return H.div(null, H.label({
      className: "text-muted"
    }, title), ": ", React.createElement(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      value: column.textAxis ? column.textAxis.expr : void 0,
      onChange: this.handleExprChange,
      aggrStatuses: ["literal", "individual", "aggregate"]
    }));
  };

  TableChartColumnDesignerComponent.prototype.renderHeader = function() {
    var axisBuilder, column, placeholder;
    column = this.props.design.columns[this.props.index];
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    placeholder = axisBuilder.summarizeAxis(column.textAxis, this.context.locale);
    return H.div(null, H.label({
      className: "text-muted"
    }, "Header"), ": ", H.input({
      type: "text",
      className: "form-control input-sm",
      style: {
        display: "inline-block",
        width: "15em"
      },
      value: column.headerText,
      onChange: this.handleHeaderTextChange,
      placeholder: placeholder
    }));
  };

  TableChartColumnDesignerComponent.prototype.render = function() {
    var iconStyle;
    iconStyle = {
      cursor: "move",
      marginRight: 8,
      opacity: 0.5,
      fontSize: 12,
      height: 20
    };
    return H.div(null, this.props.connectDragSource(H.i({
      className: "fa fa-bars",
      style: iconStyle
    })), this.renderRemove(), H.label(null, "Column " + (this.props.index + 1)), H.div({
      style: {
        marginLeft: 5
      }
    }, this.renderExpr(), this.renderHeader()));
  };

  return TableChartColumnDesignerComponent;

})(React.Component);

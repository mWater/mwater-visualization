var DashboardUtils, ExprCompiler, ExprComponent, ExprUtils, PopupFilterJoinsEditComponent, PropTypes, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

DashboardUtils = require('../dashboards/DashboardUtils');

module.exports = PopupFilterJoinsEditComponent = (function(superClass) {
  extend(PopupFilterJoinsEditComponent, superClass);

  PopupFilterJoinsEditComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    idTable: PropTypes.string.isRequired,
    defaultPopupFilterJoins: PropTypes.object.isRequired,
    popup: PropTypes.object.isRequired,
    design: PropTypes.object,
    onDesignChange: PropTypes.func.isRequired
  };

  function PopupFilterJoinsEditComponent(props) {
    this.handleExprChange = bind(this.handleExprChange, this);
    PopupFilterJoinsEditComponent.__super__.constructor.call(this, props);
    this.state = {
      expanded: false
    };
  }

  PopupFilterJoinsEditComponent.prototype.handleExprChange = function(table, expr) {
    var design;
    design = this.props.design || this.props.defaultPopupFilterJoins;
    design = _.clone(design);
    design[table] = expr;
    return this.props.onDesignChange(design);
  };

  PopupFilterJoinsEditComponent.prototype.render = function() {
    var filterableTables, popupDashboard, popupFilterJoins;
    if (!this.state.expanded) {
      return R('a', {
        className: "btn btn-link",
        onClick: ((function(_this) {
          return function() {
            return _this.setState({
              expanded: true
            });
          };
        })(this))
      }, "Advanced Popup Options");
    }
    popupDashboard = {
      items: this.props.popup.items,
      layout: "blocks"
    };
    filterableTables = DashboardUtils.getFilterableTables(popupDashboard, this.props.schema);
    filterableTables = [this.props.table].concat(_.without(filterableTables, this.props.table));
    popupFilterJoins = this.props.design || this.props.defaultPopupFilterJoins;
    return R('div', null, R('div', {
      className: "text-muted"
    }, "Optional connections for other tables to filtering the popup"), R('table', {
      className: "table table-condensed table-bordered"
    }, R('thead', null, R('tr', null, R('th', null, "Data Source"), R('th', null, "Connection"))), R('tbody', null, _.map(filterableTables, (function(_this) {
      return function(filterableTable) {
        var ref;
        return R('tr', {
          key: filterableTable
        }, R('td', {
          style: {
            verticalAlign: "middle"
          }
        }, ExprUtils.localizeString((ref = _this.props.schema.getTable(filterableTable)) != null ? ref.name : void 0)), R('td', null, R(ExprComponent, {
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          table: filterableTable,
          value: popupFilterJoins[filterableTable],
          onChange: _this.handleExprChange.bind(null, filterableTable),
          types: _this.props.table === _this.props.idTable ? ["id", "id[]"] : ["id"],
          idTable: _this.props.idTable,
          preferLiteral: false,
          placeholder: "None"
        })));
      };
    })(this)))));
  };

  return PopupFilterJoinsEditComponent;

})(React.Component);

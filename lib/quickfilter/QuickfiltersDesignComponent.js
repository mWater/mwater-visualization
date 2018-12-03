var ExprComponent, ExprUtils, PropTypes, QuickfilterDesignComponent, QuickfiltersDesignComponent, R, React, RemovableComponent, TableSelectComponent, ui, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

update = require('update-object');

TableSelectComponent = require('../TableSelectComponent');

ExprComponent = require('mwater-expressions-ui').ExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

ui = require('react-library/lib/bootstrap');

module.exports = QuickfiltersDesignComponent = (function(superClass) {
  extend(QuickfiltersDesignComponent, superClass);

  function QuickfiltersDesignComponent() {
    this.handleRemove = bind(this.handleRemove, this);
    this.handleAdd = bind(this.handleAdd, this);
    this.handleDesignChange = bind(this.handleDesignChange, this);
    return QuickfiltersDesignComponent.__super__.constructor.apply(this, arguments);
  }

  QuickfiltersDesignComponent.propTypes = {
    design: PropTypes.array.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    tables: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
  };

  QuickfiltersDesignComponent.defaultProps = {
    design: []
  };

  QuickfiltersDesignComponent.prototype.handleDesignChange = function(design) {
    var i, index, ref;
    design = design.slice();
    for (index = i = 0, ref = design.length; 0 <= ref ? i < ref : i > ref; index = 0 <= ref ? ++i : --i) {
      if (design[index].merged && !this.isMergeable(design, index)) {
        design[index] = _.extend({}, design[index], {
          merged: false
        });
      }
    }
    return this.props.onDesignChange(design);
  };

  QuickfiltersDesignComponent.prototype.isMergeable = function(design, index) {
    var enumValues, exprUtils, idTable, prevEnumValues, prevIdTable, prevType, type;
    if (index === 0) {
      return false;
    }
    exprUtils = new ExprUtils(this.props.schema);
    type = exprUtils.getExprType(design[index].expr);
    prevType = exprUtils.getExprType(design[index - 1].expr);
    idTable = exprUtils.getExprIdTable(design[index].expr);
    prevIdTable = exprUtils.getExprIdTable(design[index - 1].expr);
    enumValues = exprUtils.getExprEnumValues(design[index].expr);
    prevEnumValues = exprUtils.getExprEnumValues(design[index - 1].expr);
    if (!type || type !== prevType) {
      return false;
    }
    if (idTable !== prevIdTable) {
      return false;
    }
    if (enumValues && !_.isEqual(_.pluck(enumValues, "id"), _.pluck(prevEnumValues, "id"))) {
      return false;
    }
    return true;
  };

  QuickfiltersDesignComponent.prototype.renderQuickfilter = function(item, index) {
    return R(QuickfilterDesignComponent, {
      key: index,
      design: item,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      tables: this.props.tables,
      mergeable: this.isMergeable(this.props.design, index),
      onChange: (function(_this) {
        return function(newItem) {
          var design;
          design = _this.props.design.slice();
          design[index] = newItem;
          return _this.handleDesignChange(design);
        };
      })(this),
      onRemove: this.handleRemove.bind(null, index)
    });
  };

  QuickfiltersDesignComponent.prototype.handleAdd = function() {
    var design;
    design = this.props.design.concat([{}]);
    return this.props.onDesignChange(design);
  };

  QuickfiltersDesignComponent.prototype.handleRemove = function(index) {
    var design;
    design = this.props.design.slice();
    design.splice(index, 1);
    return this.props.onDesignChange(design);
  };

  QuickfiltersDesignComponent.prototype.render = function() {
    return R('div', null, _.map(this.props.design, (function(_this) {
      return function(item, index) {
        return _this.renderQuickfilter(item, index);
      };
    })(this)), this.props.tables.length > 0 ? R('button', {
      type: "button",
      className: "btn btn-sm btn-default",
      onClick: this.handleAdd
    }, R('span', {
      className: "glyphicon glyphicon-plus"
    }), " Add Quick Filter") : void 0);
  };

  return QuickfiltersDesignComponent;

})(React.Component);

QuickfilterDesignComponent = (function(superClass) {
  extend(QuickfilterDesignComponent, superClass);

  QuickfilterDesignComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    mergeable: PropTypes.bool,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    tables: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
  };

  function QuickfilterDesignComponent(props) {
    this.handleMultiChange = bind(this.handleMultiChange, this);
    this.handleMergedChange = bind(this.handleMergedChange, this);
    this.handleLabelChange = bind(this.handleLabelChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    var ref;
    QuickfilterDesignComponent.__super__.constructor.call(this, props);
    this.state = {
      table: ((ref = props.design.expr) != null ? ref.table : void 0) || props.tables[0]
    };
  }

  QuickfilterDesignComponent.prototype.handleTableChange = function(table) {
    var design;
    this.setState({
      table: table
    });
    design = {
      expr: null,
      label: null
    };
    return this.props.onChange(design);
  };

  QuickfilterDesignComponent.prototype.handleExprChange = function(expr) {
    return this.props.onChange(update(this.props.design, {
      expr: {
        $set: expr
      }
    }));
  };

  QuickfilterDesignComponent.prototype.handleLabelChange = function(ev) {
    return this.props.onChange(update(this.props.design, {
      label: {
        $set: ev.target.value
      }
    }));
  };

  QuickfilterDesignComponent.prototype.handleMergedChange = function(merged) {
    return this.props.onChange(update(this.props.design, {
      merged: {
        $set: merged
      }
    }));
  };

  QuickfilterDesignComponent.prototype.handleMultiChange = function(multi) {
    return this.props.onChange(update(this.props.design, {
      multi: {
        $set: multi
      }
    }));
  };

  QuickfilterDesignComponent.prototype.render = function() {
    var exprType;
    exprType = new ExprUtils(this.props.schema).getExprType(this.props.design.expr);
    return R(RemovableComponent, {
      onRemove: this.props.onRemove
    }, R('div', {
      className: "panel panel-default"
    }, R('div', {
      className: "panel-body"
    }, R('div', {
      className: "form-group",
      key: "table"
    }, R('label', {
      className: "text-muted"
    }, "Data Source"), R(ui.Select, {
      value: this.state.table,
      options: _.map(this.props.tables, (function(_this) {
        return function(table) {
          return {
            value: table,
            label: ExprUtils.localizeString(_this.props.schema.getTable(table).name)
          };
        };
      })(this)),
      onChange: this.handleTableChange
    })), R('div', {
      className: "form-group",
      key: "expr"
    }, R('label', {
      className: "text-muted"
    }, "Filter By"), R('div', null, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.state.table,
      value: this.props.design.expr,
      onChange: this.handleExprChange,
      types: ['enum', 'text', 'enumset', 'date', 'datetime']
    }))), this.props.design.expr ? R('div', {
      className: "form-group",
      key: "label"
    }, R('label', {
      className: "text-muted"
    }, "Label"), R('input', {
      type: "text",
      className: "form-control input-sm",
      value: this.props.design.label || "",
      onChange: this.handleLabelChange,
      placeholder: "Optional Label"
    })) : void 0, this.props.mergeable ? R(ui.Checkbox, {
      value: this.props.design.merged,
      onChange: this.handleMergedChange
    }, "Merge with previous quickfilter ", R('span', {
      className: "text-muted"
    }, "- displays as one single control that filters both")) : void 0, exprType === 'enum' || exprType === 'text' || exprType === 'enumset' ? R(ui.Checkbox, {
      value: this.props.design.multi,
      onChange: this.handleMultiChange
    }, "Allow multiple selections") : void 0)));
  };

  return QuickfilterDesignComponent;

})(React.Component);

RemovableComponent = (function(superClass) {
  extend(RemovableComponent, superClass);

  function RemovableComponent() {
    return RemovableComponent.__super__.constructor.apply(this, arguments);
  }

  RemovableComponent.propTypes = {
    onRemove: PropTypes.func.isRequired
  };

  RemovableComponent.prototype.render = function() {
    return R('div', {
      style: {
        display: "flex"
      },
      className: "hover-display-parent"
    }, R('div', {
      style: {
        flex: "1 1 auto"
      },
      key: "main"
    }, this.props.children), R('div', {
      style: {
        flex: "0 0 auto",
        alignSelf: "center"
      },
      className: "hover-display-child",
      key: "remove"
    }, R('a', {
      onClick: this.props.onRemove,
      style: {
        fontSize: "80%",
        cursor: "pointer",
        marginLeft: 5
      }
    }, R('span', {
      className: "glyphicon glyphicon-remove"
    }))));
  };

  return RemovableComponent;

})(React.Component);

var AutoSizeComponent, DatagridViewComponent, DirectDatagridDataSource, ExprCompiler, ExprComponent, ExprUtils, FindReplaceModalComponent, ModalPopupComponent, PropTypes, R, React, ReactSelect, _, async, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

async = require('async');

ReactSelect = require('react-select')["default"];

AutoSizeComponent = require('react-library/lib/AutoSizeComponent');

DatagridViewComponent = require('./DatagridViewComponent');

DirectDatagridDataSource = require('./DirectDatagridDataSource');

ModalPopupComponent = require('react-library/lib/ModalPopupComponent');

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

module.exports = FindReplaceModalComponent = (function(superClass) {
  extend(FindReplaceModalComponent, superClass);

  FindReplaceModalComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      jsonql: PropTypes.object.isRequired
    })),
    canEditValue: PropTypes.func,
    updateValue: PropTypes.func,
    onUpdate: PropTypes.func
  };

  function FindReplaceModalComponent(props) {
    FindReplaceModalComponent.__super__.constructor.call(this, props);
    this.state = {
      open: false,
      replaceColumn: null,
      withExpr: null,
      conditionExpr: null,
      progress: null
    };
  }

  FindReplaceModalComponent.prototype.show = function() {
    return this.setState({
      open: true,
      progress: null
    });
  };

  FindReplaceModalComponent.prototype.performReplace = function() {
    var completed, exprCompiler, exprUtils, extraFilter, i, len, query, ref, replaceExpr, wheres;
    exprUtils = new ExprUtils(this.props.schema);
    exprCompiler = new ExprCompiler(this.props.schema);
    replaceExpr = _.findWhere(this.props.design.columns, {
      id: this.state.replaceColumn
    }).expr;
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "main",
            column: this.props.schema.getTable(this.props.design.table).primaryKey
          },
          alias: "id"
        }, {
          type: "select",
          expr: exprCompiler.compileExpr({
            expr: this.state.withExpr,
            tableAlias: "main"
          }),
          alias: "withValue"
        }
      ],
      from: {
        type: "table",
        table: this.props.design.table,
        alias: "main"
      }
    };
    wheres = [];
    if (this.props.design.filter) {
      wheres.push(exprCompiler.compileExpr({
        expr: this.props.design.filter,
        tableAlias: "main"
      }));
    }
    if (this.state.conditionExpr) {
      wheres.push(exprCompiler.compileExpr({
        expr: this.state.conditionExpr,
        tableAlias: "main"
      }));
    }
    ref = this.props.filters || [];
    for (i = 0, len = ref.length; i < len; i++) {
      extraFilter = ref[i];
      if (extraFilter.table === this.props.design.table) {
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"));
      }
    }
    query.where = {
      type: "op",
      op: "and",
      exprs: _.compact(wheres)
    };
    this.setState({
      progress: 0
    });
    completed = 0;
    return this.props.dataSource.performQuery(query, (function(_this) {
      return function(error, rows) {
        if (error) {
          _this.setState({
            progress: null
          });
          alert("Error: " + error.message);
          return;
        }
        return async.mapLimit(rows, 10, function(row, cb) {
          if (!_this.state.open) {
            return;
          }
          return _.defer(function() {
            completed += 1;
            _this.setState({
              progress: completed * 50 / rows.length
            });
            return _this.props.canEditValue(_this.props.design.table, row.id, replaceExpr, cb);
          });
        }, function(error, canEdits) {
          if (error) {
            _this.setState({
              progress: null
            });
            alert("Error: " + error.message);
            return;
          }
          if (!_.all(canEdits)) {
            _this.setState({
              progress: null
            });
            alert("You do not have permission to replace all values");
            return;
          }
          if (!confirm("Replace " + canEdits.length + " values? This cannot be undone.")) {
            _this.setState({
              progress: null
            });
            return;
          }
          return async.eachLimit(rows, 10, function(row, cb) {
            if (!_this.state.open) {
              return;
            }
            return _.defer(function() {
              completed += 1;
              _this.setState({
                progress: completed * 50 / rows.length
              });
              return _this.props.updateValue(_this.props.design.table, row.id, replaceExpr, row.withValue, cb);
            });
          }, function(error) {
            var base;
            if (error) {
              _this.setState({
                progress: null
              });
              alert("Error: " + error.message);
              return;
            }
            alert("Success");
            _this.setState({
              progress: null,
              open: false
            });
            return typeof (base = _this.props).onUpdate === "function" ? base.onUpdate() : void 0;
          });
        });
      };
    })(this));
  };

  FindReplaceModalComponent.prototype.renderPreview = function() {
    var design, exprUtils;
    exprUtils = new ExprUtils(this.props.schema);
    design = _.clone(this.props.design);
    design.columns = _.map(design.columns, (function(_this) {
      return function(column) {
        var expr;
        if (column.id !== _this.state.replaceColumn) {
          return column;
        }
        expr = {
          type: "case",
          table: _this.props.design.table,
          cases: [
            {
              when: _this.state.conditionExpr || {
                type: "literal",
                valueType: "boolean",
                value: true
              },
              then: _this.state.withExpr
            }
          ],
          "else": column.expr
        };
        return _.extend({}, column, {
          expr: expr,
          label: column.label || exprUtils.summarizeExpr(column.expr, _this.props.design.locale)
        });
      };
    })(this));
    return R(AutoSizeComponent, {
      injectWidth: true
    }, (function(_this) {
      return function(size) {
        return R(DatagridViewComponent, {
          width: size.width,
          height: 400,
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          datagridDataSource: new DirectDatagridDataSource({
            schema: _this.props.schema,
            dataSource: _this.props.dataSource
          }),
          design: design,
          filters: _this.props.filters
        });
      };
    })(this));
  };

  FindReplaceModalComponent.prototype.renderContents = function() {
    var exprUtils, replaceColumnOptions, replaceColumns, replaceExpr;
    exprUtils = new ExprUtils(this.props.schema);
    replaceColumns = _.filter(this.props.design.columns, function(column) {
      return !column.subtable && exprUtils.getExprAggrStatus(column.expr) === "individual";
    });
    replaceColumnOptions = _.map(replaceColumns, (function(_this) {
      return function(column) {
        return {
          value: column.id,
          label: column.label || exprUtils.summarizeExpr(column.expr, _this.props.design.locale)
        };
      };
    })(this));
    if (this.state.progress != null) {
      return R('div', null, R('h3', null, "Working..."), R('div', {
        className: 'progress'
      }, R('div', {
        className: 'progress-bar',
        style: {
          width: this.state.progress + "%"
        }
      })));
    }
    return R('div', null, R('div', {
      key: "replace",
      className: "form-group"
    }, R('label', null, "Column with data to replace: "), R(ReactSelect, {
      options: replaceColumnOptions,
      value: _.findWhere(replaceColumnOptions, {
        value: this.state.replaceColumn
      }),
      onChange: (function(_this) {
        return function(opt) {
          return _this.setState({
            replaceColumn: opt.value
          });
        };
      })(this),
      placeholder: "Select Column...",
      styles: {
        menu: (function(_this) {
          return function(style) {
            return _.extend({}, style, {
              zIndex: 2
            });
          };
        })(this)
      }
    })), this.state.replaceColumn ? (replaceExpr = _.findWhere(this.props.design.columns, {
      id: this.state.replaceColumn
    }).expr, R('div', {
      key: "with",
      className: "form-group"
    }, R('label', null, "Value to replace data with: "), R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      value: this.state.withExpr,
      onChange: (function(_this) {
        return function(value) {
          return _this.setState({
            withExpr: value
          });
        };
      })(this),
      types: [exprUtils.getExprType(replaceExpr)],
      enumValues: exprUtils.getExprEnumValues(replaceExpr),
      idTable: exprUtils.getExprIdTable(replaceExpr),
      preferLiteral: true,
      placeholder: "(Blank)"
    }))) : void 0, R('div', {
      key: "condition",
      className: "form-group"
    }, R('label', null, "Only in rows that (optional):"), R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      value: this.state.conditionExpr,
      onChange: (function(_this) {
        return function(value) {
          return _this.setState({
            conditionExpr: value
          });
        };
      })(this),
      types: ["boolean"],
      placeholder: "All Rows"
    })), R('div', {
      key: "preview"
    }, R('h4', null, "Preview"), this.renderPreview()));
  };

  FindReplaceModalComponent.prototype.render = function() {
    if (!this.state.open) {
      return null;
    }
    return R(ModalPopupComponent, {
      size: "large",
      header: "Find/Replace",
      footer: [
        R('button', {
          key: "cancel",
          type: "button",
          onClick: (function(_this) {
            return function() {
              return _this.setState({
                open: false
              });
            };
          })(this),
          className: "btn btn-default"
        }, "Cancel"), R('button', {
          key: "apply",
          type: "button",
          disabled: !this.state.replaceColumn || (this.state.progress != null),
          onClick: (function(_this) {
            return function() {
              return _this.performReplace();
            };
          })(this),
          className: "btn btn-primary"
        }, "Apply")
      ]
    }, this.renderContents());
  };

  return FindReplaceModalComponent;

})(React.Component);

var ActionCancelModalComponent, AutoSizeComponent, DatagridComponent, DatagridDesignerComponent, DatagridEditorComponent, DatagridUtils, DatagridViewComponent, ExprCleaner, ExprCompiler, ExprUtils, FindReplaceModalComponent, H, PropTypes, QuickfilterCompiler, QuickfiltersComponent, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

AutoSizeComponent = require('react-library/lib/AutoSizeComponent');

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprCleaner = require('mwater-expressions').ExprCleaner;

DatagridViewComponent = require('./DatagridViewComponent');

DatagridDesignerComponent = require('./DatagridDesignerComponent');

DatagridUtils = require('./DatagridUtils');

QuickfiltersComponent = require('../quickfilter/QuickfiltersComponent');

QuickfilterCompiler = require('../quickfilter/QuickfilterCompiler');

FindReplaceModalComponent = require('./FindReplaceModalComponent');

module.exports = DatagridComponent = (function(superClass) {
  extend(DatagridComponent, superClass);

  DatagridComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    datagridDataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    titleElem: PropTypes.node,
    extraTitleButtonsElem: PropTypes.node,
    canEditValue: PropTypes.func,
    updateValue: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    quickfilterLocks: PropTypes.array
  };

  function DatagridComponent(props) {
    this.handleEdit = bind(this.handleEdit, this);
    this.handleCellEditingToggle = bind(this.handleCellEditingToggle, this);
    this.getQuickfilterValues = bind(this.getQuickfilterValues, this);
    DatagridComponent.__super__.constructor.call(this, props);
    this.state = {
      editingDesign: false,
      cellEditingEnabled: false,
      quickfiltersHeight: null,
      quickfiltersValues: null
    };
  }

  DatagridComponent.prototype.reload = function() {
    var ref;
    return (ref = this.datagridView) != null ? ref.reload() : void 0;
  };

  DatagridComponent.prototype.componentDidMount = function() {
    return this.updateHeight();
  };

  DatagridComponent.prototype.componentDidUpdate = function() {
    return this.updateHeight();
  };

  DatagridComponent.prototype.updateHeight = function() {
    if (this.refs.quickfilters) {
      if (this.state.quickfiltersHeight !== this.refs.quickfilters.offsetHeight) {
        return this.setState({
          quickfiltersHeight: this.refs.quickfilters.offsetHeight
        });
      }
    } else {
      return this.setState({
        quickfiltersHeight: 0
      });
    }
  };

  DatagridComponent.prototype.getQuickfilterValues = function() {
    return this.state.quickfiltersValues || [];
  };

  DatagridComponent.prototype.handleCellEditingToggle = function() {
    if (this.state.cellEditingEnabled) {
      return this.setState({
        cellEditingEnabled: false
      });
    } else {
      if (confirm("Turn on cell editing? This is allow you to edit the live data and is an advanced feature.")) {
        return this.setState({
          cellEditingEnabled: true
        });
      }
    }
  };

  DatagridComponent.prototype.handleEdit = function() {
    return this.setState({
      editingDesign: true
    });
  };

  DatagridComponent.prototype.getCompiledFilters = function() {
    var column, columnExpr, compiledFilters, expr, exprCleaner, exprCompiler, exprUtils, filter, i, jsonql, len, ref;
    exprCompiler = new ExprCompiler(this.props.schema);
    exprUtils = new ExprUtils(this.props.schema);
    exprCleaner = new ExprCleaner(this.props.schema);
    compiledFilters = [];
    if (this.props.design.filter) {
      jsonql = exprCompiler.compileExpr({
        expr: this.props.design.filter,
        tableAlias: "{alias}"
      });
      if (jsonql) {
        compiledFilters.push({
          table: this.props.design.table,
          jsonql: jsonql
        });
      }
    }
    ref = this.props.design.globalFilters || [];
    for (i = 0, len = ref.length; i < len; i++) {
      filter = ref[i];
      column = this.props.schema.getColumn(this.props.design.table, filter.columnId);
      if (!column) {
        continue;
      }
      columnExpr = {
        type: "field",
        table: this.props.design.table,
        column: column.id
      };
      if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
        continue;
      }
      expr = {
        type: "op",
        op: filter.op,
        table: this.props.design.table,
        exprs: [columnExpr].concat(filter.exprs)
      };
      expr = exprCleaner.cleanExpr(expr, {
        table: this.props.design.table
      });
      jsonql = exprCompiler.compileExpr({
        expr: expr,
        tableAlias: "{alias}"
      });
      if (jsonql) {
        compiledFilters.push({
          table: this.props.design.table,
          jsonql: jsonql
        });
      }
    }
    return compiledFilters;
  };

  DatagridComponent.prototype.renderCellEdit = function() {
    var label;
    if (!this.props.canEditValue || (this.props.onDesignChange == null)) {
      return null;
    }
    label = [
      H.i({
        className: this.state.cellEditingEnabled ? "fa fa-fw fa-check-square" : "fa fa-fw fa-square-o"
      }), " ", "Cell Editing"
    ];
    return H.a({
      key: "cell-edit",
      className: "btn btn-link btn-sm",
      onClick: this.handleCellEditingToggle
    }, label);
  };

  DatagridComponent.prototype.renderEditButton = function() {
    if (!this.props.onDesignChange) {
      return null;
    }
    return H.button({
      type: "button",
      className: "btn btn-primary",
      onClick: this.handleEdit
    }, H.span({
      className: "glyphicon glyphicon-cog"
    }), " ", "Settings");
  };

  DatagridComponent.prototype.renderFindReplace = function() {
    if (!this.state.cellEditingEnabled) {
      return null;
    }
    return H.a({
      key: "findreplace",
      className: "btn btn-link btn-sm",
      onClick: ((function(_this) {
        return function() {
          return _this.refs.findReplaceModal.show();
        };
      })(this))
    }, "Find/Replace");
  };

  DatagridComponent.prototype.renderTitleBar = function() {
    return H.div({
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        padding: 4
      }
    }, H.div({
      style: {
        float: "right"
      }
    }, this.renderFindReplace(), this.renderCellEdit(), this.renderEditButton(), this.props.extraTitleButtonsElem), this.props.titleElem);
  };

  DatagridComponent.prototype.renderQuickfilter = function() {
    return H.div({
      style: {
        position: "absolute",
        top: 40,
        left: 0,
        right: 0
      },
      ref: "quickfilters"
    }, R(QuickfiltersComponent, {
      design: this.props.design.quickfilters,
      schema: this.props.schema,
      quickfiltersDataSource: this.props.datagridDataSource.getQuickfiltersDataSource(),
      values: this.state.quickfiltersValues,
      table: this.props.design.table,
      onValuesChange: (function(_this) {
        return function(values) {
          return _this.setState({
            quickfiltersValues: values
          });
        };
      })(this),
      locks: this.props.quickfilterLocks,
      filters: this.getCompiledFilters()
    }));
  };

  DatagridComponent.prototype.renderEditor = function() {
    if (!this.state.editingDesign) {
      return;
    }
    return R(DatagridEditorComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.props.design,
      onDesignChange: (function(_this) {
        return function(design) {
          if (!_.isEqual(_this.props.design.quickfilters, design.quickfilters)) {
            _this.setState({
              quickfiltersValues: null
            });
          }
          _this.props.onDesignChange(design);
          return _this.setState({
            editingDesign: false
          });
        };
      })(this),
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            editingDesign: false
          });
        };
      })(this)
    });
  };

  DatagridComponent.prototype.renderFindReplaceModal = function(filters) {
    return R(FindReplaceModalComponent, {
      ref: "findReplaceModal",
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      datagridDataSource: this.props.datagridDataSource,
      design: this.props.design,
      filters: filters,
      canEditValue: this.props.canEditValue,
      updateValue: this.props.updateValue,
      onUpdate: (function(_this) {
        return function() {
          var ref;
          return (ref = _this.datagridView) != null ? ref.reload() : void 0;
        };
      })(this)
    });
  };

  DatagridComponent.prototype.render = function() {
    var filters, hasQuickfilters, ref;
    filters = new QuickfilterCompiler(this.props.schema).compile(this.props.design.quickfilters, this.state.quickfiltersValues, this.props.quickfilterLocks);
    hasQuickfilters = ((ref = this.props.design.quickfilters) != null ? ref[0] : void 0) != null;
    return H.div({
      style: {
        width: "100%",
        height: "100%",
        position: "relative",
        paddingTop: 40 + (this.state.quickfiltersHeight || 0)
      }
    }, this.renderTitleBar(filters), this.renderQuickfilter(), this.renderEditor(), this.renderFindReplaceModal(filters), R(AutoSizeComponent, {
      injectWidth: true,
      injectHeight: true
    }, (function(_this) {
      return function(size) {
        var design;
        design = new DatagridUtils(_this.props.schema).cleanDesign(_this.props.design);
        if (!new DatagridUtils(_this.props.schema).validateDesign(design)) {
          return R(DatagridViewComponent, {
            ref: function(view) {
              return _this.datagridView = view;
            },
            width: size.width - 1,
            height: size.height - 1,
            pageSize: 100,
            schema: _this.props.schema,
            dataSource: _this.props.dataSource,
            datagridDataSource: _this.props.datagridDataSource,
            design: design,
            filters: filters,
            onDesignChange: _this.props.onDesignChange,
            onRowDoubleClick: _this.props.onRowDoubleClick,
            canEditCell: _this.state.cellEditingEnabled ? _this.props.canEditValue : void 0,
            updateCell: _this.state.cellEditingEnabled ? _this.props.updateValue : void 0
          });
        } else if (_this.props.onDesignChange) {
          return H.div({
            style: {
              textAlign: "center",
              marginTop: size.height / 2
            }
          }, H.a({
            className: "btn btn-link",
            onClick: _this.handleEdit
          }, "Click Here to Configure"));
        } else {
          return null;
        }
      };
    })(this)));
  };

  return DatagridComponent;

})(React.Component);

DatagridEditorComponent = (function(superClass) {
  extend(DatagridEditorComponent, superClass);

  DatagridEditorComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  };

  function DatagridEditorComponent(props) {
    DatagridEditorComponent.__super__.constructor.call(this, props);
    this.state = {
      design: props.design
    };
  }

  DatagridEditorComponent.prototype.render = function() {
    return R(ActionCancelModalComponent, {
      onAction: (function(_this) {
        return function() {
          _this.props.onDesignChange(_this.state.design);
          return _this.setState({
            design: _this.props.design
          });
        };
      })(this),
      onCancel: this.props.onCancel,
      size: "large"
    }, R(DatagridDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.state.design,
      onDesignChange: (function(_this) {
        return function(design) {
          return _this.setState({
            design: design
          });
        };
      })(this)
    }));
  };

  return DatagridEditorComponent;

})(React.Component);

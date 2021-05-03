"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var AutoSizeComponent, DatagridViewComponent, DirectDatagridDataSource, ExprCompiler, ExprComponent, ExprUtils, FindReplaceModalComponent, ModalPopupComponent, PropTypes, R, React, ReactSelect, _, async, injectTableAlias;

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
injectTableAlias = require('mwater-expressions').injectTableAlias; // Modal to perform find/replace on datagrid

module.exports = FindReplaceModalComponent = function () {
  var FindReplaceModalComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(FindReplaceModalComponent, _React$Component);

    var _super = _createSuper(FindReplaceModalComponent);

    function FindReplaceModalComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, FindReplaceModalComponent);
      _this = _super.call(this, props);
      _this.state = {
        open: false,
        // True if modal is open
        replaceColumn: null,
        // Column id to replace
        withExpr: null,
        // Replace with expression
        conditionExpr: null,
        // Condition expr
        progress: null // 0-100 when working

      };
      return _this;
    }

    (0, _createClass2["default"])(FindReplaceModalComponent, [{
      key: "show",
      value: function show() {
        return this.setState({
          open: true,
          progress: null
        });
      }
    }, {
      key: "performReplace",
      value: function performReplace() {
        var _this2 = this;

        var completed, exprCompiler, exprUtils, extraFilter, i, len, query, ref, replaceExpr, wheres;
        exprUtils = new ExprUtils(this.props.schema);
        exprCompiler = new ExprCompiler(this.props.schema); // Get expr of replace column

        replaceExpr = _.findWhere(this.props.design.columns, {
          id: this.state.replaceColumn
        }).expr; // Get ids and with value, filtered by filters, design.filter and conditionExpr (if present)

        query = {
          type: "query",
          selects: [{
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
          }],
          from: {
            type: "table",
            table: this.props.design.table,
            alias: "main"
          }
        }; // Filter by filter

        wheres = [];

        if (this.props.design.filter) {
          wheres.push(exprCompiler.compileExpr({
            expr: this.props.design.filter,
            tableAlias: "main"
          }));
        } // Filter by conditionExpr


        if (this.state.conditionExpr) {
          wheres.push(exprCompiler.compileExpr({
            expr: this.state.conditionExpr,
            tableAlias: "main"
          }));
        }

        ref = this.props.filters || []; // Add extra filters

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
        }); // Number completed (twice for each row, once to check can edit and other to perform)

        completed = 0;
        return this.props.dataSource.performQuery(query, function (error, rows) {
          if (error) {
            _this2.setState({
              progress: null
            });

            alert("Error: ".concat(error.message));
            return;
          } // Check canEditValue on each one


          return async.mapLimit(rows, 10, function (row, cb) {
            // Abort if closed
            if (!_this2.state.open) {
              return;
            } // Prevent stack overflow


            return _.defer(function () {
              // First half
              completed += 1;

              _this2.setState({
                progress: completed * 50 / rows.length
              });

              return _this2.props.canEditValue(_this2.props.design.table, row.id, replaceExpr, cb);
            });
          }, function (error, canEdits) {
            if (error) {
              _this2.setState({
                progress: null
              });

              alert("Error: ".concat(error.message));
              return;
            }

            if (!_.all(canEdits)) {
              _this2.setState({
                progress: null
              });

              alert("You do not have permission to replace all values");
              return;
            } // Confirm


            if (!confirm("Replace ".concat(canEdits.length, " values? This cannot be undone."))) {
              _this2.setState({
                progress: null
              });

              return;
            } // Perform updateValue on each one
            // Do one at a time to prevent conflicts. TODO should do all at once in a transaction.


            return async.eachLimit(rows, 1, function (row, cb) {
              // Abort if closed
              if (!_this2.state.open) {
                return;
              } // Prevent stack overflow


              return _.defer(function () {
                // First half
                completed += 1;

                _this2.setState({
                  progress: completed * 50 / rows.length
                });

                return _this2.props.updateValue(_this2.props.design.table, row.id, replaceExpr, row.withValue, cb);
              });
            }, function (error) {
              var base;

              if (error) {
                _this2.setState({
                  progress: null
                });

                alert("Error: ".concat(error.message));
                return;
              }

              alert("Success");

              _this2.setState({
                progress: null,
                open: false
              });

              return typeof (base = _this2.props).onUpdate === "function" ? base.onUpdate() : void 0;
            });
          });
        });
      }
    }, {
      key: "renderPreview",
      value: function renderPreview() {
        var _this3 = this;

        var design, exprUtils;
        exprUtils = new ExprUtils(this.props.schema); // Replace "replace" column with fake case statement to simulate change

        design = _.clone(this.props.design);
        design.columns = _.map(design.columns, function (column) {
          var expr; // Unchanged if not replace column 

          if (column.id !== _this3.state.replaceColumn) {
            return column;
          }

          expr = {
            type: "case",
            table: _this3.props.design.table,
            cases: [{
              when: _this3.state.conditionExpr || {
                type: "literal",
                valueType: "boolean",
                value: true
              },
              then: _this3.state.withExpr
            }],
            // Unchanged
            "else": column.expr
          }; // Specify label to prevent strange titles

          return _.extend({}, column, {
            expr: expr,
            label: column.label || exprUtils.summarizeExpr(column.expr, _this3.props.design.locale)
          });
        });
        return R(AutoSizeComponent, {
          injectWidth: true
        }, function (size) {
          return R(DatagridViewComponent, {
            width: size.width,
            height: 400,
            schema: _this3.props.schema,
            dataSource: _this3.props.dataSource,
            datagridDataSource: new DirectDatagridDataSource({
              schema: _this3.props.schema,
              dataSource: _this3.props.dataSource
            }),
            design: design,
            filters: _this3.props.filters
          });
        });
      }
    }, {
      key: "renderContents",
      value: function renderContents() {
        var _this4 = this;

        var exprUtils, replaceColumnOptions, replaceColumns, replaceExpr;
        exprUtils = new ExprUtils(this.props.schema); // Determine which columns are replace-able. Excludes subtables and aggregates

        replaceColumns = _.filter(this.props.design.columns, function (column) {
          return !column.subtable && exprUtils.getExprAggrStatus(column.expr) === "individual";
        });
        replaceColumnOptions = _.map(replaceColumns, function (column) {
          return {
            value: column.id,
            label: column.label || exprUtils.summarizeExpr(column.expr, _this4.props.design.locale)
          };
        }); // Show progress

        if (this.state.progress != null) {
          return R('div', null, R('h3', null, "Working..."), R('div', {
            className: 'progress'
          }, R('div', {
            className: 'progress-bar',
            style: {
              width: "".concat(this.state.progress, "%")
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
          }) || null,
          onChange: function onChange(opt) {
            return _this4.setState({
              replaceColumn: opt.value
            });
          },
          placeholder: "Select Column...",
          styles: {
            // Keep menu above fixed data table headers
            menu: function menu(style) {
              return _.extend({}, style, {
                zIndex: 2
              });
            }
          } // Get expr of replace column

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
          onChange: function onChange(value) {
            return _this4.setState({
              withExpr: value
            });
          },
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
          onChange: function onChange(value) {
            return _this4.setState({
              conditionExpr: value
            });
          },
          types: ["boolean"],
          placeholder: "All Rows"
        })), R('div', {
          key: "preview"
        }, R('h4', null, "Preview"), this.renderPreview()));
      }
    }, {
      key: "render",
      value: function render() {
        var _this5 = this;

        if (!this.state.open) {
          return null;
        }

        return R(ModalPopupComponent, {
          size: "large",
          header: "Find/Replace",
          footer: [R('button', {
            key: "cancel",
            type: "button",
            onClick: function onClick() {
              return _this5.setState({
                open: false
              });
            },
            className: "btn btn-default"
          }, "Cancel"), R('button', {
            key: "apply",
            type: "button",
            disabled: !this.state.replaceColumn || this.state.progress != null,
            onClick: function onClick() {
              return _this5.performReplace();
            },
            className: "btn btn-primary"
          }, "Apply")]
        }, this.renderContents());
      }
    }]);
    return FindReplaceModalComponent;
  }(React.Component);

  ;
  FindReplaceModalComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // dataSource to use
    design: PropTypes.object.isRequired,
    // Design of datagrid. See README.md of this folder
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      // id table to filter
      jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias

    })),
    // Check if expression of table row is editable
    // If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
    canEditValue: PropTypes.func,
    // Update table row expression with a new value
    // Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
    updateValue: PropTypes.func,
    onUpdate: PropTypes.func // Called when values have been updated

  };
  return FindReplaceModalComponent;
}.call(void 0);
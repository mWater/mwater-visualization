"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ActionCancelModalComponent,
    AutoSizeComponent,
    DatagridComponent,
    DatagridDesignerComponent,
    DatagridEditorComponent,
    DatagridUtils,
    DatagridViewComponent,
    ExprCleaner,
    ExprCompiler,
    ExprUtils,
    FindReplaceModalComponent,
    PropTypes,
    QuickfilterCompiler,
    QuickfiltersComponent,
    R,
    React,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
AutoSizeComponent = require('react-library/lib/AutoSizeComponent');
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');
ExprUtils = require('mwater-expressions').ExprUtils;
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprCleaner = require('mwater-expressions').ExprCleaner;
DatagridViewComponent = require('./DatagridViewComponent');
DatagridDesignerComponent = require('./DatagridDesignerComponent');
DatagridUtils = require('./DatagridUtils')["default"];
QuickfiltersComponent = require('../quickfilter/QuickfiltersComponent');
QuickfilterCompiler = require('../quickfilter/QuickfilterCompiler');
FindReplaceModalComponent = require('./FindReplaceModalComponent'); // Datagrid with decorations 
// See README.md for description of datagrid format
// Design should be cleaned already before being passed in (see DatagridUtils)

module.exports = DatagridComponent = function () {
  var DatagridComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(DatagridComponent, _React$Component);

    var _super = _createSuper(DatagridComponent);

    function DatagridComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, DatagridComponent);
      _this = _super.call(this, props); // Get the values of the quick filters

      _this.getQuickfilterValues = _this.getQuickfilterValues.bind((0, _assertThisInitialized2["default"])(_this)); // Get filters that are applied by the quickfilters

      _this.getQuickfilterFilters = _this.getQuickfilterFilters.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleCellEditingToggle = _this.handleCellEditingToggle.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleEdit = _this.handleEdit.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        editingDesign: false,
        // is design being edited
        cellEditingEnabled: false,
        // True if cells can be edited directly
        quickfiltersHeight: null,
        // Height of quickfilters
        quickfiltersValues: null
      };
      return _this;
    }

    (0, _createClass2["default"])(DatagridComponent, [{
      key: "reload",
      value: function reload() {
        var ref;
        return (ref = this.datagridView) != null ? ref.reload() : void 0;
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        return this.updateHeight();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate() {
        return this.updateHeight();
      }
    }, {
      key: "updateHeight",
      value: function updateHeight() {
        // Calculate quickfilters height
        if (this.quickfilters) {
          if (this.state.quickfiltersHeight !== this.quickfilters.offsetHeight) {
            return this.setState({
              quickfiltersHeight: this.quickfilters.offsetHeight
            });
          }
        } else {
          return this.setState({
            quickfiltersHeight: 0
          });
        }
      }
    }, {
      key: "getQuickfilterValues",
      value: function getQuickfilterValues() {
        boundMethodCheck(this, DatagridComponent);
        return this.state.quickfiltersValues || [];
      }
    }, {
      key: "getQuickfilterFilters",
      value: function getQuickfilterFilters() {
        boundMethodCheck(this, DatagridComponent);
        return new QuickfilterCompiler(this.props.schema).compile(this.props.design.quickfilters, this.state.quickfiltersValues, this.props.quickfilterLocks);
      }
    }, {
      key: "handleCellEditingToggle",
      value: function handleCellEditingToggle() {
        boundMethodCheck(this, DatagridComponent);

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
      }
    }, {
      key: "handleEdit",
      value: function handleEdit() {
        boundMethodCheck(this, DatagridComponent);
        return this.setState({
          editingDesign: true
        });
      } // Get datagrid filter compiled for quickfilter filtering

    }, {
      key: "getCompiledFilters",
      value: function getCompiledFilters() {
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

        ref = this.props.design.globalFilters || []; // Add global filters

        for (i = 0, len = ref.length; i < len; i++) {
          filter = ref[i]; // Check if exists and is correct type

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
          } // Create expr


          expr = {
            type: "op",
            op: filter.op,
            table: this.props.design.table,
            exprs: [columnExpr].concat(filter.exprs)
          }; // Clean expr

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
      } // Toggle to allow cell editing

    }, {
      key: "renderCellEdit",
      value: function renderCellEdit() {
        var label;

        if (!this.props.canEditValue || this.props.onDesignChange == null) {
          return null;
        }

        label = [R('i', {
          className: this.state.cellEditingEnabled ? "fa fa-fw fa-check-square" : "fa fa-fw fa-square-o"
        }), " ", "Cell Editing"];
        return R('a', {
          key: "cell-edit",
          className: "btn btn-link btn-sm",
          onClick: this.handleCellEditingToggle
        }, label);
      }
    }, {
      key: "renderEditButton",
      value: function renderEditButton() {
        if (!this.props.onDesignChange) {
          return null;
        }

        return R('button', {
          type: "button",
          className: "btn btn-primary",
          onClick: this.handleEdit
        }, R('span', {
          className: "glyphicon glyphicon-cog"
        }), " ", "Settings");
      }
    }, {
      key: "renderFindReplace",
      value: function renderFindReplace() {
        var _this2 = this;

        if (!this.state.cellEditingEnabled) {
          return null;
        }

        return R('a', {
          key: "findreplace",
          className: "btn btn-link btn-sm",
          onClick: function onClick() {
            return _this2.findReplaceModal.show();
          }
        }, "Find/Replace");
      }
    }, {
      key: "renderTitleBar",
      value: function renderTitleBar() {
        return R('div', {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            padding: 4
          }
        }, R('div', {
          style: {
            "float": "right"
          }
        }, this.renderFindReplace(), this.renderCellEdit(), this.renderEditButton(), this.props.extraTitleButtonsElem), this.props.titleElem);
      }
    }, {
      key: "renderQuickfilter",
      value: function renderQuickfilter() {
        var _this3 = this;

        return R('div', {
          style: {
            position: "absolute",
            top: 40,
            left: 0,
            right: 0
          },
          ref: function ref(c) {
            return _this3.quickfilters = c;
          }
        }, R(QuickfiltersComponent, {
          design: this.props.design.quickfilters,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          quickfiltersDataSource: this.props.datagridDataSource.getQuickfiltersDataSource(),
          values: this.state.quickfiltersValues,
          table: this.props.design.table,
          onValuesChange: function onValuesChange(values) {
            return _this3.setState({
              quickfiltersValues: values
            });
          },
          locks: this.props.quickfilterLocks,
          filters: this.getCompiledFilters()
        }));
      } // Renders the editor modal

    }, {
      key: "renderEditor",
      value: function renderEditor() {
        var _this4 = this;

        if (!this.state.editingDesign) {
          return;
        }

        return R(DatagridEditorComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.props.design,
          onDesignChange: function onDesignChange(design) {
            // If quickfilters have changed, reset values
            if (!_.isEqual(_this4.props.design.quickfilters, design.quickfilters)) {
              _this4.setState({
                quickfiltersValues: null
              });
            }

            _this4.props.onDesignChange(design);

            return _this4.setState({
              editingDesign: false
            });
          },
          onCancel: function onCancel() {
            return _this4.setState({
              editingDesign: false
            });
          }
        });
      }
    }, {
      key: "renderFindReplaceModal",
      value: function renderFindReplaceModal(filters) {
        var _this5 = this;

        return R(FindReplaceModalComponent, {
          ref: function ref(c) {
            return _this5.findReplaceModal = c;
          },
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          datagridDataSource: this.props.datagridDataSource,
          design: this.props.design,
          filters: filters,
          canEditValue: this.props.canEditValue,
          updateValue: this.props.updateValue,
          onUpdate: function onUpdate() {
            var ref; // Reload

            return (ref = _this5.datagridView) != null ? ref.reload() : void 0;
          }
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this6 = this;

        var filters, hasQuickfilters, ref;
        filters = this.props.filters || []; // Compile quickfilters

        filters = filters.concat(this.getQuickfilterFilters());
        hasQuickfilters = ((ref = this.props.design.quickfilters) != null ? ref[0] : void 0) != null;
        return R('div', {
          style: {
            width: "100%",
            height: "100%",
            position: "relative",
            paddingTop: 40 + (this.state.quickfiltersHeight || 0)
          }
        }, this.renderTitleBar(filters), this.renderQuickfilter(), this.renderEditor(), this.renderFindReplaceModal(filters), R(AutoSizeComponent, {
          injectWidth: true,
          injectHeight: true
        }, function (size) {
          var design; // Clean before displaying

          design = new DatagridUtils(_this6.props.schema).cleanDesign(_this6.props.design);

          if (!new DatagridUtils(_this6.props.schema).validateDesign(design)) {
            return R(DatagridViewComponent, {
              ref: function ref(view) {
                return _this6.datagridView = view;
              },
              width: size.width - 1,
              // minus 1 px to test if it solves the jitter with scroll
              height: size.height - 1,
              pageSize: 100,
              schema: _this6.props.schema,
              dataSource: _this6.props.dataSource,
              datagridDataSource: _this6.props.datagridDataSource,
              design: design,
              filters: filters,
              onDesignChange: _this6.props.onDesignChange,
              onRowClick: _this6.props.onRowClick,
              onRowDoubleClick: _this6.props.onRowDoubleClick,
              canEditCell: _this6.state.cellEditingEnabled ? _this6.props.canEditValue : void 0,
              updateCell: _this6.state.cellEditingEnabled ? _this6.props.updateValue : void 0
            });
          } else if (_this6.props.onDesignChange) {
            return R('div', {
              style: {
                textAlign: "center",
                marginTop: size.height / 2
              }
            }, R('a', {
              className: "btn btn-link",
              onClick: _this6.handleEdit
            }, "Click Here to Configure"));
          } else {
            return null;
          }
        }));
      }
    }]);
    return DatagridComponent;
  }(React.Component);

  ;
  DatagridComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // dataSource to use
    datagridDataSource: PropTypes.object.isRequired,
    // datagrid dataSource to use
    design: PropTypes.object.isRequired,
    // Design of datagrid. See README.md of this folder
    onDesignChange: PropTypes.func,
    // Called when design changes
    titleElem: PropTypes.node,
    // Extra element to include in title at left
    extraTitleButtonsElem: PropTypes.node,
    // Extra elements to add to right
    // Check if expression of table row is editable
    // If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
    canEditValue: PropTypes.func,
    // Update table row expression with a new value
    // Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
    updateValue: PropTypes.func,
    // Called when row is clicked with (tableId, rowId)
    onRowClick: PropTypes.func,
    // Called when row is double-clicked with (tableId, rowId)
    onRowDoubleClick: PropTypes.func,
    quickfilterLocks: PropTypes.array,
    // Locked quickfilter values. See README in quickfilters
    // Filters to add to the datagrid
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      // id table to filter
      jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias

    }))
  };
  return DatagridComponent;
}.call(void 0);

DatagridEditorComponent = function () {
  // Popup editor
  var DatagridEditorComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(DatagridEditorComponent, _React$Component2);

    var _super2 = _createSuper(DatagridEditorComponent);

    function DatagridEditorComponent(props) {
      var _this7;

      (0, _classCallCheck2["default"])(this, DatagridEditorComponent);
      _this7 = _super2.call(this, props);
      _this7.state = {
        design: props.design
      };
      return _this7;
    }

    (0, _createClass2["default"])(DatagridEditorComponent, [{
      key: "render",
      value: function render() {
        var _this8 = this;

        return R(ActionCancelModalComponent, {
          onAction: function onAction() {
            _this8.props.onDesignChange(_this8.state.design);

            return _this8.setState({
              design: _this8.props.design
            });
          },
          onCancel: this.props.onCancel,
          size: "large"
        }, R(DatagridDesignerComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.state.design,
          onDesignChange: function onDesignChange(design) {
            return _this8.setState({
              design: design
            });
          }
        }));
      }
    }]);
    return DatagridEditorComponent;
  }(React.Component);

  ;
  DatagridEditorComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // dataSource to use
    design: PropTypes.object.isRequired,
    // Design of datagrid. See README.md of this folder
    onDesignChange: PropTypes.func.isRequired,
    // Called when design changes
    onCancel: PropTypes.func.isRequired // Called when cancelled

  };
  return DatagridEditorComponent;
}.call(void 0);
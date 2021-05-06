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

var ExprComponent,
    ExprUtils,
    PropTypes,
    QuickfilterDesignComponent,
    QuickfiltersDesignComponent,
    R,
    React,
    RemovableComponent,
    TableSelectComponent,
    _,
    ui,
    update,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
update = require('update-object');
TableSelectComponent = require('../TableSelectComponent');
ExprComponent = require('mwater-expressions-ui').ExprComponent;
ExprUtils = require('mwater-expressions').ExprUtils;
ui = require('react-library/lib/bootstrap'); // Displays quick filters and allows their value to be modified

module.exports = QuickfiltersDesignComponent = function () {
  var QuickfiltersDesignComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(QuickfiltersDesignComponent, _React$Component);

    var _super = _createSuper(QuickfiltersDesignComponent);

    function QuickfiltersDesignComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, QuickfiltersDesignComponent);
      _this = _super.apply(this, arguments);
      _this.handleDesignChange = _this.handleDesignChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleAdd = _this.handleAdd.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRemove = _this.handleRemove.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(QuickfiltersDesignComponent, [{
      key: "handleDesignChange",
      value: function handleDesignChange(design) {
        var i, index, ref;
        boundMethodCheck(this, QuickfiltersDesignComponent);
        design = design.slice(); // Update merged, clearing if not mergeable

        for (index = i = 0, ref = design.length; 0 <= ref ? i < ref : i > ref; index = 0 <= ref ? ++i : --i) {
          if (design[index].merged && !this.isMergeable(design, index)) {
            design[index] = _.extend({}, design[index], {
              merged: false
            });
          }
        }

        return this.props.onDesignChange(design);
      } // Determine if quickfilter at index is mergeable with previous (same type, id table and enum values)

    }, {
      key: "isMergeable",
      value: function isMergeable(design, index) {
        var enumValues, exprUtils, idTable, multi, prevEnumValues, prevIdTable, prevMulti, prevType, type;

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
        multi = design[index].multi || false;
        prevMulti = design[index - 1].multi || false;

        if (multi !== prevMulti) {
          return false;
        }

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
      }
    }, {
      key: "renderQuickfilter",
      value: function renderQuickfilter(item, index) {
        var _this2 = this;

        return R(QuickfilterDesignComponent, {
          key: index,
          design: item,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          tables: this.props.tables,
          mergeable: this.isMergeable(this.props.design, index),
          onChange: function onChange(newItem) {
            var design;
            design = _this2.props.design.slice();
            design[index] = newItem;
            return _this2.handleDesignChange(design);
          },
          onRemove: this.handleRemove.bind(null, index)
        });
      }
    }, {
      key: "handleAdd",
      value: function handleAdd() {
        var design;
        boundMethodCheck(this, QuickfiltersDesignComponent); // Add blank to end

        design = this.props.design.concat([{}]);
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleRemove",
      value: function handleRemove(index) {
        var design;
        boundMethodCheck(this, QuickfiltersDesignComponent);
        design = this.props.design.slice();
        design.splice(index, 1);
        return this.props.onDesignChange(design);
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        return R('div', null, _.map(this.props.design, function (item, index) {
          return _this3.renderQuickfilter(item, index);
        }), this.props.tables.length > 0 ? R('button', {
          type: "button",
          className: "btn btn-sm btn-default",
          onClick: this.handleAdd
        }, R('span', {
          className: "glyphicon glyphicon-plus"
        }), " Add Quick Filter") : void 0);
      }
    }]);
    return QuickfiltersDesignComponent;
  }(React.Component);

  ;
  QuickfiltersDesignComponent.propTypes = {
    design: PropTypes.array.isRequired,
    // Design of quickfilters. See README.md
    onDesignChange: PropTypes.func.isRequired,
    // Called when design changes
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    tables: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired // List of possible table ids to use

  };
  QuickfiltersDesignComponent.defaultProps = {
    design: []
  };
  return QuickfiltersDesignComponent;
}.call(void 0);

QuickfilterDesignComponent = function () {
  var QuickfilterDesignComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(QuickfilterDesignComponent, _React$Component2);

    var _super2 = _createSuper(QuickfilterDesignComponent);

    function QuickfilterDesignComponent(props) {
      var _this4;

      (0, _classCallCheck2["default"])(this, QuickfilterDesignComponent);
      var ref;
      _this4 = _super2.call(this, props);
      _this4.handleTableChange = _this4.handleTableChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleExprChange = _this4.handleExprChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleLabelChange = _this4.handleLabelChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleMergedChange = _this4.handleMergedChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleMultiChange = _this4.handleMultiChange.bind((0, _assertThisInitialized2["default"])(_this4)); // Store table to allow selecting table first, then expression

      _this4.state = {
        table: ((ref = props.design.expr) != null ? ref.table : void 0) || props.tables[0]
      };
      return _this4;
    }

    (0, _createClass2["default"])(QuickfilterDesignComponent, [{
      key: "handleTableChange",
      value: function handleTableChange(table) {
        var design;
        boundMethodCheck(this, QuickfilterDesignComponent);
        this.setState({
          table: table
        });
        design = {
          expr: null,
          label: null
        };
        return this.props.onChange(design);
      }
    }, {
      key: "handleExprChange",
      value: function handleExprChange(expr) {
        boundMethodCheck(this, QuickfilterDesignComponent);
        return this.props.onChange(update(this.props.design, {
          expr: {
            $set: expr
          }
        }));
      }
    }, {
      key: "handleLabelChange",
      value: function handleLabelChange(ev) {
        boundMethodCheck(this, QuickfilterDesignComponent);
        return this.props.onChange(update(this.props.design, {
          label: {
            $set: ev.target.value
          }
        }));
      }
    }, {
      key: "handleMergedChange",
      value: function handleMergedChange(merged) {
        boundMethodCheck(this, QuickfilterDesignComponent);
        return this.props.onChange(update(this.props.design, {
          merged: {
            $set: merged
          }
        }));
      }
    }, {
      key: "handleMultiChange",
      value: function handleMultiChange(multi) {
        boundMethodCheck(this, QuickfilterDesignComponent);
        return this.props.onChange(update(this.props.design, {
          multi: {
            $set: multi
          }
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var _this5 = this;

        var exprType; // Determine type of expression

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
          options: _.map(this.props.tables, function (table) {
            return {
              value: table,
              label: ExprUtils.localizeString(_this5.props.schema.getTable(table).name)
            };
          }),
          onChange: this.handleTableChange,
          nullLabel: "Select..."
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
          types: ['enum', 'text', 'enumset', 'date', 'datetime', 'id[]', 'text[]']
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
        }, "- displays as one single control that filters both")) : void 0, exprType === 'enum' || exprType === 'text' || exprType === 'enumset' || exprType === 'id[]' || exprType === 'text[]' ? R(ui.Checkbox, {
          value: this.props.design.multi,
          onChange: this.handleMultiChange
        }, "Allow multiple selections") : void 0)));
      }
    }]);
    return QuickfilterDesignComponent;
  }(React.Component);

  ;
  QuickfilterDesignComponent.propTypes = {
    design: PropTypes.object.isRequired,
    // Design of a single quickfilters. See README.md
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    mergeable: PropTypes.bool,
    // True if can be merged
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    tables: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired // List of possible table ids to use

  };
  return QuickfilterDesignComponent;
}.call(void 0);

RemovableComponent = function () {
  // Floats an x to the right on hover
  var RemovableComponent = /*#__PURE__*/function (_React$Component3) {
    (0, _inherits2["default"])(RemovableComponent, _React$Component3);

    var _super3 = _createSuper(RemovableComponent);

    function RemovableComponent() {
      (0, _classCallCheck2["default"])(this, RemovableComponent);
      return _super3.apply(this, arguments);
    }

    (0, _createClass2["default"])(RemovableComponent, [{
      key: "render",
      value: function render() {
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
      }
    }]);
    return RemovableComponent;
  }(React.Component);

  ;
  RemovableComponent.propTypes = {
    onRemove: PropTypes.func.isRequired
  };
  return RemovableComponent;
}.call(void 0);
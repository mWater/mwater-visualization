"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var ExprUtils, PropTypes, R, React, TableSelectComponent, _, ui;

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
ui = require('./UIComponents');
ExprUtils = require("mwater-expressions").ExprUtils;
R = React.createElement;

module.exports = TableSelectComponent = function () {
  var TableSelectComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(TableSelectComponent, _React$Component);

    function TableSelectComponent() {
      (0, _classCallCheck2["default"])(this, TableSelectComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TableSelectComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(TableSelectComponent, [{
      key: "render",
      value: function render() {
        var _this = this;

        if (this.context.tableSelectElementFactory) {
          return this.context.tableSelectElementFactory(this.props);
        }

        return React.createElement(ui.ToggleEditComponent, {
          forceOpen: !this.props.value,
          label: this.props.value ? ExprUtils.localizeString(this.props.schema.getTable(this.props.value).name, this.context.locale) : R('i', null, "Select..."),
          editor: function editor(onClose) {
            return React.createElement(ui.OptionListComponent, {
              hint: "Select source to get data from",
              items: _.map(_.filter(_this.props.schema.getTables(), function (table) {
                return !table.deprecated;
              }), function (table) {
                return {
                  name: ExprUtils.localizeString(table.name, _this.context.locale),
                  desc: ExprUtils.localizeString(table.desc, _this.context.locale),
                  onClick: function onClick() {
                    onClose();
                    return _this.props.onChange(table.id);
                  }
                };
              })
            });
          }
        });
      }
    }]);
    return TableSelectComponent;
  }(React.Component);

  ;
  TableSelectComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    value: PropTypes.string,
    // Current table id
    onChange: PropTypes.func.isRequired,
    // Newly selected table id
    // Some table select components (not the default) can also perform filtering. Include these props to enable this
    filter: PropTypes.object,
    onFilterChange: PropTypes.func
  };
  TableSelectComponent.contextTypes = {
    tableSelectElementFactory: PropTypes.func,
    // Can be overridden by setting tableSelectElementFactory in context that takes ({ schema, value, onChange, filter, onFilterChange })
    locale: PropTypes.string,
    // e.g. "en"
    // Optional list of tables (ids) being used. Some overrides of the table select component may use this to present
    // an initially short list to select from
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)
  };
  return TableSelectComponent;
}.call(void 0);
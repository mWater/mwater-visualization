var ExprUtils, PropTypes, R, React, TableSelectComponent, ui,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

ui = require('./UIComponents');

ExprUtils = require("mwater-expressions").ExprUtils;

R = React.createElement;

module.exports = TableSelectComponent = (function(superClass) {
  extend(TableSelectComponent, superClass);

  function TableSelectComponent() {
    return TableSelectComponent.__super__.constructor.apply(this, arguments);
  }

  TableSelectComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    filter: PropTypes.object,
    onFilterChange: PropTypes.func
  };

  TableSelectComponent.contextTypes = {
    tableSelectElementFactory: PropTypes.func,
    locale: PropTypes.string,
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)
  };

  TableSelectComponent.prototype.render = function() {
    if (this.context.tableSelectElementFactory) {
      return this.context.tableSelectElementFactory(this.props);
    }
    return React.createElement(ui.ToggleEditComponent, {
      forceOpen: !this.props.value,
      label: this.props.value ? ExprUtils.localizeString(this.props.schema.getTable(this.props.value).name, this.context.locale) : R('i', null, "Select..."),
      editor: (function(_this) {
        return function(onClose) {
          return React.createElement(ui.OptionListComponent, {
            hint: "Select source to get data from",
            items: _.map(_.filter(_this.props.schema.getTables(), function(table) {
              return !table.deprecated;
            }), function(table) {
              return {
                name: ExprUtils.localizeString(table.name, _this.context.locale),
                desc: ExprUtils.localizeString(table.desc, _this.context.locale),
                onClick: function() {
                  onClose();
                  return _this.props.onChange(table.id);
                }
              };
            })
          });
        };
      })(this)
    });
  };

  return TableSelectComponent;

})(React.Component);

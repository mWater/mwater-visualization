var ExprUtils, React, TableSelectComponent, ui,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ui = require('./UIComponents');

ExprUtils = require("mwater-expressions").ExprUtils;

module.exports = TableSelectComponent = (function(superClass) {
  extend(TableSelectComponent, superClass);

  function TableSelectComponent() {
    return TableSelectComponent.__super__.constructor.apply(this, arguments);
  }

  TableSelectComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  };

  TableSelectComponent.contextTypes = {
    tableSelectElementFactory: React.PropTypes.func,
    locale: React.PropTypes.string
  };

  TableSelectComponent.prototype.render = function() {
    if (this.context.tableSelectElementFactory) {
      return this.context.tableSelectElementFactory(this.props.schema, this.props.value, this.props.onChange);
    }
    return React.createElement(ui.ToggleEditComponent, {
      forceOpen: !this.props.value,
      label: this.props.value ? ExprUtils.localizeString(this.props.schema.getTable(this.props.value).name, this.context.locale) : H.i(null, "Select..."),
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
                  return onChange(table.id);
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

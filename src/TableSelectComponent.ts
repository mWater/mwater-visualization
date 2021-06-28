// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let TableSelectComponent;
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import * as ui from './UIComponents';
import { ExprUtils } from "mwater-expressions";
const R = React.createElement;

export default TableSelectComponent = (function() {
  TableSelectComponent = class TableSelectComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired,
        value: PropTypes.string,  // Current table id
        onChange: PropTypes.func.isRequired,  // Newly selected table id
  
        // Some table select components (not the default) can also perform filtering. Include these props to enable this
        filter: PropTypes.object,
        onFilterChange: PropTypes.func
      };
  
      this.contextTypes = {
        tableSelectElementFactory: PropTypes.func,  // Can be overridden by setting tableSelectElementFactory in context that takes ({ schema, value, onChange, filter, onFilterChange })
        locale: PropTypes.string,  // e.g. "en"
  
        // Optional list of tables (ids) being used. Some overrides of the table select component may use this to present
        // an initially short list to select from
        activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)
      };  
    }

    render() {
      if (this.context.tableSelectElementFactory) {
        return this.context.tableSelectElementFactory(this.props);    
      }

      return React.createElement(ui.ToggleEditComponent, {
        forceOpen: !this.props.value,
        label: this.props.value ? ExprUtils.localizeString(this.props.schema.getTable(this.props.value).name, this.context.locale) : R('i', null, "Select..."),
        editor: onClose => {
          return React.createElement(ui.OptionListComponent, { 
            hint: "Select source to get data from",
            items: _.map(_.filter(this.props.schema.getTables(), table => !table.deprecated), table => ({ 
              name: ExprUtils.localizeString(table.name, this.context.locale),
              desc: ExprUtils.localizeString(table.desc, this.context.locale),
              onClick: () => {
                onClose();
                return this.props.onChange(table.id);
              }
            }))
          });
        }
      }
      );
    }
  };
  TableSelectComponent.initClass();
  return TableSelectComponent;
})();

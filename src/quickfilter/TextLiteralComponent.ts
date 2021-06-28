// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let TextLiteralComponent;
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;
import { default as AsyncReactSelect } from 'react-select/async';
import { ExprCompiler } from 'mwater-expressions';
import { ExprUtils } from 'mwater-expressions';
import { injectTableAlias } from 'mwater-expressions';

// Displays a combo box that allows selecting single or multiple text values from an expression
// The expression can be type `text` or `text[]`
export default TextLiteralComponent = (function() {
  TextLiteralComponent = class TextLiteralComponent extends React.Component {
    static initClass() {
      this.propTypes = { 
        value: PropTypes.any,
        onChange: PropTypes.func,
  
        schema: PropTypes.object.isRequired,
        quickfiltersDataSource: PropTypes.object.isRequired,  // See QuickfiltersDataSource
        expr: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        multi: PropTypes.bool,       // true to display multiple values
  
        // Filters to add to the component to restrict values
        filters: PropTypes.arrayOf(PropTypes.shape({
          table: PropTypes.string.isRequired,    // id table to filter
          jsonql: PropTypes.object.isRequired   // jsonql filter with {alias} for tableAlias
        }))
      };
    }

    handleSingleChange = val => {
      const value = val ? (val.value || null) : null; // Blank is null
      return this.props.onChange(value);
    };

    handleMultipleChange = val => {
      const value = val ? _.pluck(val, "value") : [];

      if (value.length > 0) {
        return this.props.onChange(value);
      } else {
        return this.props.onChange(null);
      }
    };

    getOptions = (input, cb) => {
      // Determine type of expression
      let filters;
      const exprUtils = new ExprUtils(this.props.schema);
      const exprType = exprUtils.getExprType(this.props.expr);

      // Create query to get matches
      const exprCompiler = new ExprCompiler(this.props.schema);

      // Add filter for input (simple if just text)
      if (exprType === "text") {
        filters = (this.props.filters || []);
        if (input) {
          filters.push({
            table: this.props.expr.table,
            jsonql: {
              type: "op",
              op: "~*",
              exprs: [
                exprCompiler.compileExpr({expr: this.props.expr, tableAlias: "{alias}"}),
                escapeRegex(input)  // Don't use _.escapeRegExp as adds weird backslashes that postgres doesn't like
              ]
            }
          });
        }
      } else if (exprType === "text[]") {
        // Special filter for text[]
        filters = (this.props.filters || []);
        if (input) {
          filters.push({
            table: "_values_",
            jsonql: {
              type: "op",
              op: "~*",
              exprs: [
                { type: "field", tableAlias: "{alias}", column: "value" },
                "^" + escapeRegex(input)  // Don't use _.escapeRegExp as adds weird backslashes that postgres doesn't like
              ]
            }
          });
        }
      } else {
        return;
      }

      // Execute query
      this.props.quickfiltersDataSource.getValues(this.props.index, this.props.expr, filters, null, 250, (err, values) => {
        if (err) {
          return; 
        }

        // Filter null and blank
        values = _.filter(values, value => value);

        return cb(_.map(values, value => ({
          value,
          label: value
        })));
      });
      
    };

    renderSingle() {
      const currentValue = this.props.value ? { value: this.props.value, label: this.props.value } : null;

      return R(AsyncReactSelect, { 
        key: JSON.stringify(this.props.filters),  // Include to force a change when filters change
        placeholder: "All",
        value: currentValue,
        loadOptions: this.getOptions,
        onChange: this.props.onChange ? this.handleSingleChange : undefined,
        isClearable: true,
        defaultOptions: true,
        isDisabled: (this.props.onChange == null),
        noOptionsMessage: () => "Type to search",
        styles: { 
          // Keep menu above fixed data table headers
          menu: style => _.extend({}, style, {zIndex: 2000})
        }
      });
    }


    renderMultiple() {
      const currentValue = this.props.value ? _.map(this.props.value, v => ({ value: v, label: v })) : null;

      return R(AsyncReactSelect, { 
        placeholder: "All",
        value: currentValue,
        key: JSON.stringify(this.props.filters),  // Include to force a change when filters change
        isMulti: true,
        loadOptions: this.getOptions,
        defaultOptions: true,
        onChange: this.props.onChange ? this.handleMultipleChange : undefined,
        isClearable: true,
        isDisabled: (this.props.onChange == null),
        noOptionsMessage: () => "Type to search",
        styles: { 
          // Keep menu above fixed data table headers
          menu: style => _.extend({}, style, {zIndex: 2000})
        }
      });
    }

    render() {
      return R('div', {style: { width: "100%" }},
        this.props.multi ?
          this.renderMultiple()
        :
          this.renderSingle()
      );
    }
  };
  TextLiteralComponent.initClass();
  return TextLiteralComponent;
})();

function escapeRegex(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
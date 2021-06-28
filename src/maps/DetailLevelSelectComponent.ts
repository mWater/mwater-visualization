// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let DetailLevelSelectComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;

import { default as ReactSelect } from 'react-select';

// Select detail level within an admin region
export default DetailLevelSelectComponent = (function() {
  DetailLevelSelectComponent = class DetailLevelSelectComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired,
        scope: PropTypes.string.isRequired,     // admin region
        scopeLevel: PropTypes.number.isRequired,    // admin region
        detailLevel: PropTypes.number, // Detail level within
        onChange: PropTypes.func.isRequired
      };
       // Called with (detailLevel)
    }

    constructor(props) {
      super(props);
      this.state = { options: null };
    }

    componentWillMount() {
      return this.loadLevels(this.props);
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.scope !== this.props.scope) {
        return this.loadLevels(nextProps);
      }
    }

    loadLevels(props) {
      // Get country id of scope
      let query = {
        type: "query",
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "main", column: "level0" }, alias: "level0" }
        ],
        from: { type: "table", table: "admin_regions", alias: "main" },
        where: {
          type: "op", op: "=", exprs: [{ type: "field", tableAlias: "main", column: "_id" }, props.scope]
        }
      };

      // Execute query
      return props.dataSource.performQuery(query, (err, rows) => {
        if (err) {
          alert("Error loading detail levels");
          return; 
        }

        const countryId = rows[0].level0;

        // Get levels
        query = {
          type: "query",
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "level" }, alias: "level" },
            { type: "select", expr: { type: "field", tableAlias: "main", column: "name" }, alias: "name" }
          ],
          from: { type: "table", table: "admin_region_levels", alias: "main" },
          where: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "main", column: "country_id" }, countryId] },
          orderBy: [{ ordinal: 1, direction: "asc" }]
        };

        // Execute query
        return props.dataSource.performQuery(query, (err, rows) => {
          if (err) {
            alert("Error loading detail levels");
            return; 
          }

          // Only greater than current scope level
          rows = _.filter(rows, r => r.level > props.scopeLevel);

          // If detail level set (defaults to zero), and has an option, auto-select
          if ((this.props.detailLevel <= this.props.scopeLevel) && (rows.length > 0)) {
            this.props.onChange(rows[0].level);
          }

          const options = _.map(rows, r => ({
            value: r.level,
            label: r.name
          }));
          return this.setState({options});
        });
      });
    }

    render() {
      if (this.state.options) {
        return R(ReactSelect, {
          value: _.findWhere(this.state.options, {value: this.props.detailLevel}) || null,
          options: this.state.options,
          onChange: opt => this.props.onChange(opt.value)
        });
      } else {
        return R('div', {className: "text-muted"},
          R('i', {className: "fa fa-spinner fa-spin"}),
          " Loading...");
      }
    }
  };
  DetailLevelSelectComponent.initClass();
  return DetailLevelSelectComponent;
})();

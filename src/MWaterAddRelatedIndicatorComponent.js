let MWaterAddRelatedIndicatorComponent;
import $ from 'jquery';
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;

import moment from 'moment';
import querystring from 'querystring';
import { ExprUtils } from 'mwater-expressions';
import ui from './UIComponents';

// List of indicators related to an entity
export default MWaterAddRelatedIndicatorComponent = (function() {
  MWaterAddRelatedIndicatorComponent = class MWaterAddRelatedIndicatorComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        table: PropTypes.string.isRequired,
        apiUrl: PropTypes.string.isRequired,
        client: PropTypes.string,
        user: PropTypes.string,                // User id
        onSelect: PropTypes.func.isRequired,   // Called with table id e.g. indicator_values:someid
        schema: PropTypes.object.isRequired,   
        filter: PropTypes.string              // String filter
      };
  
      this.contextTypes =
        {locale: PropTypes.string};
        // e.g. "en"
    }

    constructor(props) {
      this.handleSelect = this.handleSelect.bind(this);
      super(props);

      this.state = { 
        addingTables: [],  // Set to table ids that have been added
        indicators: null
      };
    }

    componentDidMount() {
      // Get all response-type indicators 
      const query = {};
      query.selector = JSON.stringify({ type: "response" });
      query.fields = JSON.stringify({ "design.name": 1, "design.desc": 1, "design.properties": 1, "design.recommended": 1, "deprecated": 1 });
      if (this.props.client) {
        query.client = this.props.client;
      }

      // Get list of all indicators
      return $.getJSON(this.props.apiUrl + "indicators?" + querystring.stringify(query), indicators => { 
        // Filter by table reference
        indicators = _.filter(indicators, indicator => this.doesIndicatorReferenceTable(indicator, this.props.table) && !indicator.deprecated);

        // Sort by recommended then name
        indicators = _.sortByOrder(indicators, [
          indicator => indicator.design.recommended ? 0 : 1,
          indicator => ExprUtils.localizeString(indicator.design.name, this.context.locale)
          ], ['asc', 'asc']);

        return this.setState({indicators});
    }).fail(xhr => {
        return this.setState({error: xhr.responseText});
      });
    }

    // See if a property references the indicator
    doesIndicatorReferenceTable(indicator, table) {
      for (let proplist of _.values(indicator.design.properties)) {
        for (let property of flattenProperties(proplist)) {
          if (property.idTable === table) {
            return true;
          }
        }
      }

      return false;
    }

    handleSelect(table) {
      // Mark as being added
      this.setState({addingTables: _.union(this.state.addingTables, [table])});

      return this.props.onSelect(table);
    }

    render() {
      // Filter out ones that are known and not recently added
      let indicators = _.filter(this.state.indicators, indicator => { 
        return !this.props.schema.getTable(`indicator_values:${indicator._id}`) || this.state.addingTables.includes(`indicator_values:${indicator._id}`);
    });

      // Filter by search
      if (this.props.filter) {
        indicators = _.filter(indicators, indicator => filterMatches(this.props.filter, ExprUtils.localizeString(indicator.design.name, this.context.locale)));
      }

      return R('div', null,
        R('div', {style: { paddingLeft: 5 }, className: "text-muted"}, 
          "Other Available Indicators. Click to enable. ",
            R('i', {className: "fa fa-check-circle"}),
            " = recommended",

          !this.state.indicators ?
            R('div', {className: "text-muted"},
              R('i', {className: "fa fa-spin fa-spinner"}),
              " Loading...") : undefined,

          R('div', {style: { paddingLeft: 10 }},
            _.map(indicators, indicator => {
              const name = ExprUtils.localizeString(indicator.design.name, this.context.locale);
              const desc = ExprUtils.localizeString(indicator.design.desc, this.context.locale);

              // If added, put special message
              if (this.props.schema.getTable(`indicator_values:${indicator._id}`)) {
                return R('div', {key: indicator._id, style: { cursor: "pointer", padding: 4 }, className: "text-success"},
                  `${name} added. See above.`);
              }

              return R('div', {key: indicator._id, style: { cursor: "pointer", color: "#478", padding: 4 }, onClick: this.handleSelect.bind(null, `indicator_values:${indicator._id}`)},
                // If in process of adding
                this.state.addingTables.includes(indicator._id) ?
                  R('i', {className: "fa fa-spin fa-spinner"}) : undefined,

                indicator.design.recommended ?
                  R('i', {className: "fa fa-check-circle fa-fw", style: { color: "#337ab7" }}) : undefined,
                name,
                desc ?
                  R('span', {className: "text-muted", style: { fontSize: 12, paddingLeft: 3 }}, 
                    " - " + desc) : undefined
              );
            })
          )
        )
      );
    }
  };
  MWaterAddRelatedIndicatorComponent.initClass();
  return MWaterAddRelatedIndicatorComponent;
})();

// Flattens a nested list of properties
var flattenProperties = function(properties) {
  // Flatten
  let props = [];
  for (let prop of properties) {
    if (prop.contents) {
      props = props.concat(flattenProperties(prop.contents));
    } else {
      props.push(prop);
    }
  }

  return props;
};

// Filters text based on lower-case
var filterMatches = function(filter, text) {
  if (!filter) {
    return true;
  }

  if (!text) {
    return false;
  }

  if (text.match(new RegExp(_.escapeRegExp(filter), "i"))) {
    return true;
  }
  return false;
};
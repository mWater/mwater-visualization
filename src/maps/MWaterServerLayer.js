// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MWaterServerLayer;
import $ from 'jquery';
import PropTypes from 'prop-types';
import Layer from './Layer';
import { ExprCompiler } from 'mwater-expressions';
import { injectTableAlias } from 'mwater-expressions';
import React from 'react';
const R = React.createElement;

// TODO DEPRECATED. REPLACE WITH REAL MARKER AND BUFFER LAYERS

// Layer defined on the mWater server
// Design is:
// type: type of layer on server
// table: table to filter on (e.g. entities.water_point)
// minZoom: optional minimum zoom
// maxZoom: optional maximum zoom
export default MWaterServerLayer = class MWaterServerLayer extends Layer {
  // Called when the interactivity grid is clicked. 
  // arguments:
  //   ev: { data: interactivty data e.g. `{ id: 123 }` }
  //   options: 
  //     design: design of layer
  //     schema: schema to use
  //     dataSource: data source to use
  //     filters: compiled filters to apply to the popup
  // 
  // Returns:
  //   null/undefined to do nothing
  //   [table id, primary key] to open a default system popup if one is present
  //   React element to put into a popup
  onGridClick(ev, options) {
    if (ev.data && ev.data.id) {
      return {
        row: { tableId: options.design.table, primaryKey: ev.data.id }
      };
    }
      
    return null;
  }

  // Get min and max zoom levels
  getMinZoom(design) { return design.minZoom; }
  getMaxZoom(design) { return design.maxZoom; }

  // Get the legend to be optionally displayed on the map. Returns
  // a React element
  getLegend(design, schema) {
    // Create loading legend component
    // TODO hardcoded
    const apiUrl = "https://api.mwater.co/v3/";
    return React.createElement(LoadingLegend, 
      {url: `${apiUrl}maps/legend?type=${design.type}`});
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design, schema) {
    if (design.table) { return [design.table]; } else { return []; }
  }

  // True if layer can be edited
  isEditable() {
    return false;
  }

  // Returns a cleaned design
  cleanDesign(design, schema) {
    return design;
  }

  // Validates design. Null if ok, message otherwise
  validateDesign(design, schema) {
    return null;
  }
};

// Simple class to load legend from server
class LoadingLegend extends React.Component {
  static initClass() {
    this.propTypes =  
      {url: PropTypes.string};
  }

  constructor(props) {
    super(props);
    this.state = { html: "Loading..." };
  }

  componentDidMount() { 
    return $.get(this.props.url).done(data => {
      return this.setState({html: data});
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.url !== this.props.url) {
      return $.get(nextProps.url).done(data => {
        return this.setState({html: data});
      });
    }
  }

  render() {
    return R('div', { 
      style: { font: "14px/16px Arial, Helvetica, sans-serif", color: "#555" },
      dangerouslySetInnerHTML: { __html: this.state.html }
    });
  }
}
LoadingLegend.initClass();

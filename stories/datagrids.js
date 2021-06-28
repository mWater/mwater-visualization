// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const H = React.DOM;
const R = React.createElement;

import datagridDesign from './datagridDesign';
import { storiesOf } from '@kadira/storybook';
import DatagridComponent from '../src/datagrids/DatagridComponent';
import DirectDatagridDataSource from '../src/datagrids/DirectDatagridDataSource';
import MWaterLoaderComponent from '../src/MWaterLoaderComponent';
import UpdateableComponent from './UpdateableComponent';

storiesOf('Datagrid', module)
  .add('datagrid with serial number', () => { 
    return R(SerialNumberDatagrid, {design: datagridDesign});
});


class SerialNumberDatagrid extends React.Component {
  static initClass() {
    this.propTypes =
      {design: PropTypes.object.isRequired};
  }

  render() {
    return R(UpdateableComponent, 
      {design: this.props.design},
      (state, update) => {
        const apiUrl = "https://api.mwater.co/v3/";
        return R(MWaterLoaderComponent, {
          apiUrl,
          client: null,
          user: null
          // onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
          // extraTables: @state.extraTables
        }, (error, config) => {
          if (error) {
            alert("Error: " + error.message);
            return null;
          }

          const datagridDataSource = new DirectDatagridDataSource({
            // apiUrl: apiUrl
            // client: null
            // design: state.design
            schema: config.schema,
            dataSource: config.dataSource
          });

          return H.div({style: { height: 800 }},
            React.createElement(DatagridComponent, {
              schema: config.schema,
              dataSource: config.dataSource,
              datagridDataSource,
              design: state.design,
              onDesignChange: update("design"),
              titleElem: "Sample",
              height: 400
              // quickfilterLocks: [{ expr: { type: "field", table: "entities.water_point", column: "type" }, value: "Protected dug well" }]
            })
          );
        });
    });
  }
}
SerialNumberDatagrid.initClass();
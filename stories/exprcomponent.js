import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const H = React.DOM;
const R = React.createElement;

import datagridDesign from './datagridDesign';
import { storiesOf } from '@kadira/storybook';
import { ExprComponent } from "mwater-expressions-ui";
import MWaterLoaderComponent from '../src/MWaterLoaderComponent';
import UpdateableComponent from './UpdateableComponent';

storiesOf('ExprComponent', module)
  .add('blank', () => { 
    return R(UpdateableComponent, 
      {value: null},
      (state, update) => {
        // apiUrl = "https://api.mwater.co/v3/"
        const apiUrl = "http://localhost:1234/v3/";
        return R(MWaterLoaderComponent, {
          apiUrl,
          client: null,
          user: null,
          onExtraTablesChange: update("extraTables"),
          extraTables: state.extraTables
        }, (error, config) => {
          if (error) {
            alert("Error: " + error.message);
            return null;
          }

          return React.createElement(ExprComponent, {
            schema: config.schema,
            dataSource: config.dataSource,
            table: "entities.water_point",
            value: state.value,
            onChange: update("value")
          });
        });
    });
});
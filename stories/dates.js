// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const H = React.DOM;
const R = React.createElement;

import DateExprComponent from '../src/quickfilter/DateExprComponent';
import DateRangeComponent from '../src/DateRangeComponent';
import { storiesOf } from '@kadira/storybook';
import UpdateableComponent from './UpdateableComponent';

storiesOf('DateExprComponent', module)
  .add('date (blank)', () => { 
    return R(UpdateableComponent, 
      {value: null},
      (state, update) => {
        return R(DateExprComponent, {
          value: state.value,
          onChange: update("value")
        }
        );
    });
}).add('date (today)', () => { 
    return R(UpdateableComponent, 
      {value: { type: "op", op: "today", exprs: [] }},
      (state, update) => {
        return R(DateExprComponent, {
          value: state.value,
          onChange: update("value")
        }
        );
    });
  }).add('datetime (blank)', () => { 
    return R(UpdateableComponent, 
      {value: null},
      (state, update) => {
        return R(DateExprComponent, {
          datetime: true,
          value: state.value,
          onChange: update("value")
        }
        );
    });
});

storiesOf('DateRangeComponent', module)
  .add('date (blank)', () => { 
    return R(UpdateableComponent, 
      {value: null},
      (state, update) => {
        return R(DateRangeComponent, {
          value: state.value,
          onChange: update("value")
        }
        );
    });
}).add('date (today)', () => { 
    return R(UpdateableComponent, 
      {value: [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")]},
      (state, update) => {
        return R(DateRangeComponent, {
          value: state.value,
          onChange: update("value")
        }
        );
    });
  }).add('datetime (blank)', () => { 
    return R(UpdateableComponent, 
      {value: null},
      (state, update) => {
        return R(DateRangeComponent, {
          datetime: true,
          value: state.value,
          onChange: update("value")
        }
        );
    });
});

import _ from 'lodash';
import React from 'react';
const H = React.DOM;
const R = React.createElement;

import { storiesOf } from '@kadira/storybook';
import { action } from '@kadira/storybook';
import LeafletMapComponent from '../src/maps/LeafletMapComponent';

storiesOf('Maps', module);
// .add 'local test', => 
//   R LeafletMapComponent, 
//     baseLayerId: "bing_road"
//     width: "100%"
//     height: 600
//     layers: [
//       {
//         tileUrl: "http://localhost:1234/v3/maps/tiles/{z}/{x}/{y}.png?type=cluster"
//         visible: true
//       }
//     ]
    
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from 'lodash';
import React from 'react';
const H = React.DOM;
const R = React.createElement;

import { storiesOf } from '@kadira/storybook';
import { action } from '@kadira/storybook';
import LeafletMapComponent from '../src/maps/LeafletMapComponent';

storiesOf('Leaflet', module)
  .add('normal', () => { 
    return R(LeafletMapComponent, { 
      baseLayerId: "bing_road",
      width: "100%",
      height: 600,
      layers: []
    });
})
    
  .add('popup', () => { 
    return R(LeafletMapComponent, { 
      baseLayerId: "bing_road",
      width: "100%",
      height: 600,
      layers: [],
      popup: {
        lat: 30,
        lng: -20,
        contents: H.div(null, "Hello!!!")
      }
    });
})

  .add('popup2', () => { 
    return R(LeafletMapComponent, { 
      baseLayerId: "bing_road",
      width: "100%",
      height: 600,
      layers: [],
      popup: {
        lat: 35,
        lng: -20,
        contents: H.div(null, "Hello2!!!")
      }
    });
});
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
    
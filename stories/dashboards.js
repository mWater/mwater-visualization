// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const H = React.DOM;
const R = React.createElement;

import { storiesOf } from '@kadira/storybook';
import DashboardComponent from '../src/dashboards/DashboardComponent';
import DirectDashboardDataSource from '../src/dashboards/DirectDashboardDataSource';
import MWaterLoaderComponent from '../src/MWaterLoaderComponent';
import UpdateableComponent from './UpdateableComponent';

storiesOf('dashboard', module)
  .add('empty dashboard', () => { 
    return R(DashboardTest);
}).add('table dashboard', () => { 
    return R(DashboardTest, {design: tableDashboardDesign});
  }).add('popup', () => { 
    return R(DashboardPopupTest);
});


var tableDashboardDesign = {
  "items": {
    "id": "root",
    "type": "root",
    "blocks": [
      {
        "type": "widget",
        "aspectRatio": 1.4,
        "widgetType": "TableChart",
        "design": {
          "version": 1,
          "columns": [
            {
              "id": "f1532afb-c0ea-48de-8e4e-931b147eeb6f",
              "textAxis": {
                "expr": {
                  "type": "field",
                  "table": "entities.place_of_worship",
                  "column": "name"
                }
              }
            }
          ],
          "orderings": [],
          "table": "entities.place_of_worship"
        },
        "id": "193bbc40-9177-4547-8b83-c2b5441f72c3"
      }
    ]
  },
  "layout": "blocks"
};


class DashboardTest extends React.Component {
  static initClass() {
    this.propTypes =
      {design: PropTypes.object};
  }

  render() {
    return R(UpdateableComponent, 
      {design: this.props.design || { items: { id: "root", type: "root", blocks: [] }, layout: "blocks" }},
      (state, update) => {
        const apiUrl = "https://api.mwater.co/v3/";
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

          const dashboardDataSource = new DirectDashboardDataSource({
            apiUrl,
            client: null,
            design: state.design,
            schema: config.schema,
            dataSource: config.dataSource
          });

          return H.div({style: { height: 800 }},
            React.createElement(DashboardComponent, {
              schema: config.schema,
              dataSource: config.dataSource,
              dashboardDataSource,
              design: state.design,
              onDesignChange: update("design"),
              titleElem: "Sample"
              // quickfilterLocks: [{ expr: { type: "field", table: "entities.water_point", column: "type" }, value: "Protected dug well" }]
            })
          );
        });
    });
  }
}
DashboardTest.initClass();


class DashboardPopupTest extends React.Component {
  render() {
    return R(UpdateableComponent, 
      {popup: { name: "Untitled", design: { items: { id: "root", type: "root", blocks: [] }, layout: "blocks" } }},
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

          const dashboardDataSource = new DirectDashboardDataSource({
            apiUrl,
            client: null,
            design: state.popup.design,
            schema: config.schema,
            dataSource: config.dataSource
          });

          return H.div(null,
            R(DashboardPopupComponent, { 
              ref: comp => { return this.popupComponent = comp; },
              schema: config.schema,
              dataSource: config.dataSource,
              dashboardDataSource,
              popup: state.popup,
              onPopupChange: update("popup")
            }
            ),

            H.button({ 
              type: "button",
              onClick: () => this.popupComponent.show(),
              className: "btn btn-default"
            },
                "Show")
          );
        });
    });
  }
}


const ModalWindowComponent = require('react-library/lib/ModalWindowComponent');
const ui = require('react-library/lib/bootstrap');
const update = require('react-library/lib/update');

class DashboardPopupComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      popup: PropTypes.object.isRequired,
      onPopupChange: PropTypes.func,               // If not set, readonly
      schema: PropTypes.object.isRequired,
      dataSource: PropTypes.object.isRequired,
      dashboardDataSource: PropTypes.object.isRequired, // dashboard data source
  
      onRowClick: PropTypes.func,     // Called with (tableId, rowId) when item is clicked
      namedStrings: PropTypes.object, // Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
  
      // Filters to add to the dashboard
      filters: PropTypes.arrayOf(PropTypes.shape({
        table: PropTypes.string.isRequired,    // id table to filter
        jsonql: PropTypes.object.isRequired   // jsonql filter with {alias} for tableAlias
      }))
    };
  }

  constructor(props) {
    this.update = this.update.bind(this);
    super(props);

    this.state = {
      open: false
    };
  }

  // Updates with the specified changes
  update() { return update(this.props.popup, this.props.onPopupChange, arguments); }

  show() {
    return this.setState({open: true});
  }

  render() {
    return R(ModalWindowComponent, { 
      onRequestClose: () => this.setState({open: false}),
      isOpen: this.state.open
    },
        R(DashboardComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          dashboardDataSource: this.props.dashboardDataSource,
          design: this.props.popup.design,
          onDesignChange: this.update("design")
          // titleElem: H.span style: { fontSize: 20, cursor: "pointer" },
          //   H.span className: "text-muted", onClick: (=> @setState(open: false)),
          //     R ui.Icon, id: "fa-arrow-left"
        }));
  }
}
DashboardPopupComponent.initClass();



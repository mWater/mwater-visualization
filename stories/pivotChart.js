// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from 'lodash';
import React from 'react';
const H = React.DOM;
const R = React.createElement;

import { storiesOf } from '@kadira/storybook';
import { action } from '@kadira/storybook';
import WidgetFactory from '../src/widgets/WidgetFactory';
import DirectWidgetDataSource from '../src/widgets/DirectWidgetDataSource';
import MWaterLoaderComponent from '../src/MWaterLoaderComponent';
import UpdateableComponent from './UpdateableComponent';

storiesOf('Pivot Chart', module)
  .add('blank', () => { 
    return R(PivotTest, { design: {
    }
  });
})

  .add('water point (new)', () => { 
    return R(PivotTest, { design: {
      table: "entities.water_point",
      rows: [{ id: "row1" }],
      columns: [{ id: "col1" }],
      intersections: {} 
    }
  });
})

  .add('water types', () => { 
    return R(PivotTest, { design: {
      table: "entities.water_point",
      rows: [
        { 
          id: "row1",
          valueAxis: { expr: { type: "field", table: "entities.water_point", column: "type" } }
        }
      ],
      columns: [{ id: "col1", label: "Test" }],
      intersections: {
        "row1:col1": {
          valueAxis: { expr: { type: "op", op: "count", table: "entities.water_point", exprs: [] } }
        }
      }
    }
  });
})

  .add('water types with label', () => { 
    return R(PivotTest, { design: {
      table: "entities.water_point",
      rows: [
        { 
          id: "row1",
          valueAxis: { expr: { type: "field", table: "entities.water_point", column: "type" } },
          label: "Type",
          italic: true
        }
      ],
      columns: [{ id: "col1", label: "Count" }],
      intersections: {
        "row1:col1": {
          valueAxis: { expr: { type: "op", op: "count", table: "entities.water_point", exprs: [] } }
        }
      }
    }
  });
})

  .add('water types by functionality', () => { 
    return R(PivotTest, { design: {
      table: "entities.water_point",
      rows: [
        { 
          id: "row1",
          valueAxis: { expr: { type: "field", table: "entities.water_point", column: "type" } },
          label: "Type"
        }
      ],
      columns: [
        { 
          id: "col1",
          valueAxis: {"expr":{"type":"scalar","table":"entities.water_point","joins":["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],"expr":{"type":"op","op":"last","table":"indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9","exprs":[{"type":"field","table":"indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9","column":"Functionality"}]}}},
          label: "Functionality"
        }
      ],
      intersections: {
        "row1:col1": {
          valueAxis: { expr: { type: "op", op: "count", table: "entities.water_point", exprs: [] } }
        }
      }
    }
  });
})

  .add('water types by functionality all vertical', () => { 
    return R(PivotTest, { design: {
      table: "entities.water_point",
      rows: [
        { 
          id: "row1",
          valueAxis: { expr: { type: "field", table: "entities.water_point", column: "type" } },
          label: "Type",
          children: [
            { 
              id: "row2",
              valueAxis: {"expr":{"type":"scalar","table":"entities.water_point","joins":["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],"expr":{"type":"op","op":"last","table":"indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9","exprs":[{"type":"field","table":"indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9","column":"Functionality"}]}}},
              label: "Functionality"
            }
          ]
        }
      ],
      columns: [{ id: "col1", label: "Count" }],
      intersections: {
        "row1,row2:col1": {
          valueAxis: { expr: { type: "op", op: "count", table: "entities.water_point", exprs: [] } }
        }
      }
    }
  });
})

  .add('conditional color', () => {
    return R(PivotTest, { design: {
      "table": "entities.water_point",
      "rows": [
        {
          "id": "row1",
          "valueAxis": {
            "expr": {
              "type": "field",
              "table": "entities.water_point",
              "column": "type"
            }
          }
        }
      ],
      "columns": [
        {
          "id": "col1",
          "label": "Test"
        }
      ],
      "intersections": {
        "row1:col1": {
          "valueAxis": {
            "expr": {
              "type": "op",
              "op": "count",
              "table": "entities.water_point",
              "exprs": []
            }
          },
          "backgroundColorConditions": [
            {
              "condition": {
                "type": "op",
                "table": "entities.water_point",
                "op": ">",
                "exprs": [
                  {
                    "type": "op",
                    "op": "count",
                    "table": "entities.water_point",
                    "exprs": []
                  },
                  {
                    "type": "literal",
                    "valueType": "number",
                    "value": 10000
                  }
                ]
              },
              "color": "#880e4f"
            }
          ],
          "backgroundColorOpacity": 1
        }
      },
      "version": 1,
      "header": {
        "style": "footer",
        "items": []
      },
      "footer": {
        "style": "footer",
        "items": []
      },
      "filter": null
    }
  });
});

class PivotTest extends React.Component {
  render() {
    return R(UpdateableComponent, 
      {design: this.props.design},
      (state, update) => {
        return R(MWaterLoaderComponent, {
          apiUrl: "https://api.mwater.co/v3/",
          client: null,
          user: null
          // onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
          // extraTables: @state.extraTables
        }, (error, config) => {
          if (error) {
            alert("Error: " + error.message);
            return null;
          }

          const widget = WidgetFactory.createWidget("PivotChart");
      
          const widgetDataSource = new DirectWidgetDataSource({
            widget,
            schema: config.schema,
            dataSource: config.dataSource
          });

          return widget.createViewElement({
            schema: config.schema,
            dataSource: config.dataSource,
            widgetDataSource,
            design: state.design,
            scope: null,
            filters: null,
            onScopeChange: null,
            onDesignChange: update("design"),
            width: 800
          });
        });
    });
  }
}

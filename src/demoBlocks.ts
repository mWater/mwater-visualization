// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import React from "react"
import ReactDOM from "react-dom"
const R = React.createElement
import $ from "jquery"
import MWaterLoaderComponent from "./MWaterLoaderComponent"
import BlocksDesignerComponent from "./layouts/blocks/BlocksDesignerComponent"
import DirectWidgetDataSource from "./widgets/DirectWidgetDataSource"
import WidgetFactory from "./widgets/WidgetFactory"

class DemoComponent extends React.Component {
  constructor(props: any) {
    super(props)

    this.state = {
      design,
      extraTables: []
    }
  }

  render() {
    return R(
      MWaterLoaderComponent,
      {
        apiUrl: this.props.apiUrl,
        client: this.props.client,
        user: this.props.user,
        onExtraTablesChange: (extraTables: any) => this.setState({ extraTables }),
        extraTables: this.state.extraTables
      },
      (error: any, config: any) => {
        if (error) {
          alert("Error: " + error.message)
          return null
        }

        const renderWidget = (options: any) => {
          // Passed
          //  type: type of the widget
          //  design: design of the widget
          //  onDesignChange: TODO
          //  width: width to render. null for auto
          //  height: height to render. null for auto
          const widget = WidgetFactory.createWidget(options.type)

          const widgetDataSource = new DirectWidgetDataSource({
            apiUrl: this.props.apiUrl,
            widget,
            schema: config.schema,
            dataSource: config.dataSource,
            client: this.props.client
          })

          return React.cloneElement(
            widget.createViewElement({
              schema: config.schema,
              dataSource: config.dataSource,
              widgetDataSource,
              design: options.design,
              onDesignChange: options.onDesignChange,
              scope: null,
              filters: [],
              onScopeChange: () => alert("TODO")
            }),
            {
              width: options.width,
              height: widget.isAutoHeight() ? null : options.height
            }
          )
        }

        return R(BlocksDesignerComponent, {
          renderWidget,
          design: this.state.design,
          onDesignChange: (design: any) => this.setState({ design })
        });
      }
    );
  }
}

$(function () {
  const sample = R(
    "div",
    { className: "container-fluid", style: { height: "100%", paddingLeft: 0, paddingRight: 0 } },
    R("style", null, "html, body, #main { height: 100% }"),
    React.createElement(DemoComponent, { apiUrl: "https://api.mwater.co/v3/" })
  )

  return ReactDOM.render(sample, document.getElementById("main"))
})

const widgetDesign = {
  version: 1,
  layers: [
    {
      axes: {
        x: {
          expr: {
            type: "field",
            table: "entities.water_point",
            column: "type"
          },
          xform: null
        },
        y: {
          expr: {
            type: "id",
            table: "entities.water_point"
          },
          aggr: "count",
          xform: null
        }
      },
      filter: null,
      table: "entities.water_point"
    }
  ],
  type: "bar"
}

var design = {
  id: "root",
  type: "root",
  blocks: [
    // { id: "1234", type: "widget", aspectRatio: 1.4, widgetType: "LayeredChart", design: widgetDesign }
    // { id: "1234", type: "widget", widgetType: "Text", design: { items: ["hello world!!!"] } }
  ]
}

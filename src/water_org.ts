// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import $ from "jquery"
import PropTypes from "prop-types"
import _ from "lodash"
import visualization, * as visualizationExports from "./index"
import jsyaml from "js-yaml"
import TabbedComponent from "react-library/lib/TabbedComponent"
import React from "react"
const R = React.createElement

// Pass in:
// schemaUrl (yaml schema url)
// queryUrl (will replace {query} with query)
// loadDesignUrl (gets the current design)
// saveDesignUrl (sets the current design)
// design (initial design)
// elemId (id of to render into)
export function loadDashboard(options: any) {
  // First get the schema
  return $.get(options.schemaUrl, function (schemaYaml) {
    // Load the schema
    const schema = new visualization.Schema()
    const schemaJson = jsyaml.safeLoad(schemaYaml)
    schema.loadFromJSON(schemaJson)

    // Create the data source
    const dataSource = new visualizationExports.CachingDataSource({
      perform(query: any, cb: any) {
        const url = options.queryUrl.replace(/\{query\}/, encodeURIComponent(JSON.stringify(query)))
        return $.getJSON(url, (rows) => cb(null, rows)).fail(function (xhr) {
          console.error(xhr.responseText)
          return cb(new Error(xhr.responseText))
        })
      }
    })

    // Create the widget factory
    const widgetFactory = new visualizationExports.WidgetFactory({ schema, dataSource })

    // Get the design
    return $.get(options.loadDesignUrl, function (designString) {
      let design: any
      if (designString) {
        design = JSON.parse(designString)
      } else {
        // Use default
        ;({ design } = options)
      }

      // Convert to tabs if not already
      if (!design.tabs) {
        design = {
          tabs: [{ name: "Main", design }]
        }
      }

      // Called to update the design and re-render
      function updateDesign(newDesign: any) {
        design = newDesign

        // Save to database
        $.post(options.saveDesignUrl, { userdata: JSON.stringify(design) })

        return render()
      }

      // Render the dashboard
      function render() {
        const elem = R(TabbedDashboard, {
          design,
          widgetFactory,
          onDesignChange: updateDesign
        })

        return ReactDOM.render(elem, document.getElementById(options.elemId))
      }

      // Initial render
      return render()
    })
  })
}

interface TabbedDashboardProps {
  design: any
  onDesignChange: any
  widgetFactory: any
}

class TabbedDashboard extends React.Component<TabbedDashboardProps> {
  handleDesignChange = (index: any, design: any) => {
    const tabs = this.props.design.tabs.slice()
    tabs[index] = _.extend({}, tabs[index], { design })
    return this.props.onDesignChange(_.extend({}, this.props.design, { tabs }))
  }

  handleAddTab = () => {
    const tabs = this.props.design.tabs.slice()
    // Add new dashboard
    tabs.push({ name: "Untitled", design: { items: {} } })
    return this.props.onDesignChange(_.extend({}, this.props.design, { tabs }))
  }

  handleRemoveTab = (index: any) => {
    if (!confirm("Permanently remove this tab? This cannot be undone!")) {
      return
    }

    const tabs = this.props.design.tabs.slice()
    tabs.splice(index, 1)
    return this.props.onDesignChange(_.extend({}, this.props.design, { tabs }))
  }

  handleRenameTab = (index: any) => {
    let { name } = this.props.design.tabs[index]
    name = prompt("Name of tab", name)
    if (name) {
      const tabs = this.props.design.tabs.slice()
      tabs[index] = _.extend({}, tabs[index], { name })
      return this.props.onDesignChange(_.extend({}, this.props.design, { tabs }))
    }
  }

  createTab = (tab: any, index: any) => {
    return {
      id: `${index}`,
      label: tab.name,
      elem: R(visualizationExports.DashboardComponent, {
        design: tab.design,
        widgetFactory: this.props.widgetFactory,
        onDesignChange: this.handleDesignChange.bind(null, index),
        extraTitleButtonsElem: [
          R(
            "a",
            { key: "renametab", className: "btn btn-link btn-sm", onClick: this.handleRenameTab.bind(null, index) },
            R("span", { className: "fas fa-pencil-alt" }),
            " Rename Tab"
          ),
          " ",
          R(
            "a",
            { key: "removetab", className: "btn btn-link btn-sm", onClick: this.handleRemoveTab.bind(null, index) },
            R("span", { className: "fas fa-times" }),
            " Remove Tab"
          )
        ]
      })
    }
  }

  createTabs() {
    return _.map(this.props.design.tabs, this.createTab)
  }

  render() {
    return R(TabbedComponent, {
      tabs: this.createTabs(),
      initialTabId: "0",
      onAddTab: this.handleAddTab
    })
  }
}

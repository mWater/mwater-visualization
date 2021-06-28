// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MWaterLoaderComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { Schema } from "mwater-expressions"
import querystring from "querystring"
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent"
import LoadingComponent from "react-library/lib/LoadingComponent"
import mWaterLoader from "./mWaterLoader"
import MWaterContextComponent from "./MWaterContextComponent"

// Loads an mWater schema from the server and creates child with schema and dataSource
// Also creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
// and several other context items
export default MWaterLoaderComponent = (function () {
  MWaterLoaderComponent = class MWaterLoaderComponent extends AsyncLoadComponent {
    static initClass() {
      this.propTypes = {
        apiUrl: PropTypes.string.isRequired,
        client: PropTypes.string,
        share: PropTypes.string,
        user: PropTypes.string, // user id of logged in user
        asUser: PropTypes.string, // Load schema as a specific user (for shared dashboards, etc)

        extraTables: PropTypes.arrayOf(PropTypes.string), // Extra tables to load in schema. Forms are not loaded by default as they are too many
        onExtraTablesChange: PropTypes.func, // Called when extra tables are changed and schema will be reloaded

        // Override default add layer component. See AddLayerComponent for details
        addLayerElementFactory: PropTypes.func,

        children: PropTypes.func.isRequired, // Called with (error, { schema:, dataSource: })
        errorFormatter: PropTypes.func
      }
      // Custom error formatter that returns React node or string, gets passed the error response from server
    }

    constructor(props) {
      super(props)
      this.state = {
        error: null,
        schema: null,
        dataSource: null
      }

      this.mounted = false
    }

    // Override to determine if a load is needed. Not called on mounting
    isLoadNeeded(newProps, oldProps) {
      return !_.isEqual(
        _.pick(newProps, "apiUrl", "client", "user", "share", "asUser", "extraTables"),
        _.pick(oldProps, "apiUrl", "client", "user", "share", "asUser", "extraTables")
      )
    }

    // Call callback with state changes
    load(props, prevProps, callback) {
      // Load schema and data source
      return mWaterLoader(
        {
          apiUrl: props.apiUrl,
          client: props.client,
          share: props.share,
          asUser: props.asUser,
          extraTables: props.extraTables
        },
        (error, config) => {
          if (error) {
            const defaultError = `Cannot load one of the forms that this depends on. Perhaps the administrator has not shared the form with you? Details: ${error.message}`
            if (this.props.errorFormatter) {
              return callback({ error: this.props.errorFormatter(JSON.parse(error.message), defaultError) })
            }
            return callback({ error: defaultError })
          }
          return callback({ schema: config.schema, dataSource: config.dataSource })
        }
      )
    }

    render() {
      if (!this.state.schema && !this.state.error) {
        return React.createElement(LoadingComponent)
      }

      // Inject context
      return R(
        MWaterContextComponent,
        {
          apiUrl: this.props.apiUrl,
          client: this.props.client,
          user: this.props.user,
          schema: this.state.schema,
          extraTables: this.props.extraTables,
          onExtraTablesChange: this.props.onExtraTablesChange,
          addLayerElementFactory: this.props.addLayerElementFactory
        },
        this.props.children(this.state.error, {
          schema: this.state.schema,
          dataSource: this.state.dataSource
        })
      )
    }
  }
  MWaterLoaderComponent.initClass()
  return MWaterLoaderComponent
})()

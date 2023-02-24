import _ from "lodash"
import React, { ReactElement } from "react"
const R = React.createElement

import { DataSource, Schema } from "mwater-expressions"
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent"
import LoadingComponent from "react-library/lib/LoadingComponent"
import mWaterLoader from "./mWaterLoader"
import MWaterContextComponent from "./MWaterContextComponent"

/**
 * Loads an mWater schema from the server and creates child with schema and dataSource
 * Also creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
 * and several other context items
 */
export default class MWaterLoaderComponent extends AsyncLoadComponent<
  {
    apiUrl: string
    client?: string
    share?: string
    /**  user id of logged in user */
    user?: string
    /**  Load schema as a specific user (for shared dashboards, etc) */
    asUser?: string
    /**  Extra tables to load in schema. Forms are not loaded by default as they are too many */
    extraTables?: string[]
    /**  Called when extra tables are changed and schema will be reloaded */
    onExtraTablesChange?: (extraTables: string[]) => void
    /** Locales of the schema to load. Default is all. */
    locales?: string[]
    /**  Override default add layer component. See AddLayerComponent for details */
    addLayerElementFactory?: any
    children: (error: any, config?: { schema: Schema; dataSource: DataSource }) => ReactElement<any>
    /** Custom error formatter that returns React node or string, gets passed the error response from server */
    errorFormatter: (data: any, defaultError: string) => string
  },
  {
    error: any
    schema: Schema | null
    dataSource: DataSource | null
    loading: boolean
  }
> {
  mounted: boolean

  constructor(props: any) {
    super(props)
    this.state = {
      error: null,
      schema: null,
      dataSource: null,
      loading: false
    }

    this.mounted = false
  }

  // Override to determine if a load is needed. Not called on mounting
  isLoadNeeded(newProps: any, oldProps: any) {
    return !_.isEqual(
      _.pick(newProps, "apiUrl", "client", "user", "share", "asUser", "extraTables"),
      _.pick(oldProps, "apiUrl", "client", "user", "share", "asUser", "extraTables")
    )
  }

  // Call callback with state changes
  load(props: any, prevProps: any, callback: any) {
    // Load schema and data source
    return mWaterLoader(
      {
        apiUrl: props.apiUrl,
        client: props.client,
        share: props.share,
        asUser: props.asUser,
        extraTables: props.extraTables,
        locales: props.locales
      },
      (error: any, config: any) => {
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

    if (this.state.error) {
      return this.props.children(this.state.error)
    }

    // Inject context
    return R(
      MWaterContextComponent,
      {
        apiUrl: this.props.apiUrl,
        client: this.props.client,
        user: this.props.user,
        schema: this.state.schema!,
        extraTables: this.props.extraTables,
        onExtraTablesChange: this.props.onExtraTablesChange,
        addLayerElementFactory: this.props.addLayerElementFactory
      },
      this.props.children(this.state.error, {
        schema: this.state.schema!,
        dataSource: this.state.dataSource!
      })
    )
  }
}

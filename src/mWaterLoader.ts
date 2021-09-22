import $ from "jquery"
import _ from "lodash"
import { DataSource, Schema } from "mwater-expressions"
import MWaterDataSource from "mwater-expressions/lib/MWaterDataSource"
import querystring from "querystring"


/** Loads a schema and data source that is specific to mWater server */
export default function mWaterLoader(
  options: {
    /** e.g. "https://api.mwater.co/v3/". required */
    apiUrl: string
    /** client id if logged in. optional */
    client?: string
    /** share if using a share to get schema. optional */
    share?: string
    /** Load schema as a specific user (for shared dashboards, etc). optional */
    asUser?: string
    /** Extra tables to load in schema. Forms are not loaded by default as they are too many */
    extraTables: string[]
    /** False to disable local caching of queries. Default true */
    localCaching?: boolean
  },
  callback: (error: any, config?: { schema: Schema; dataSource: DataSource }) => void
): void {
  // Load schema
  const query: any = {}
  if (options.client) {
    query.client = options.client
  }
  if (options.share) {
    query.share = options.share
  }
  if (options.asUser) {
    query.asUser = options.asUser
  }
  if (options.extraTables && options.extraTables.length > 0) {
    query.extraTables = options.extraTables.join(",")
  }

  const url = options.apiUrl + "schema?" + querystring.stringify(query)

  $.getJSON(url, (schemaJson) => {
    const schema = new Schema(schemaJson)
    const dataSource = new MWaterDataSource(options.apiUrl, options.client, {
      serverCaching: false,
      localCaching: options.localCaching != null ? options.localCaching : true
    })

    return callback(null, {
      schema,
      dataSource
    })
  }).fail((xhr) => {
    return callback(new Error(xhr.responseText))
  })
}

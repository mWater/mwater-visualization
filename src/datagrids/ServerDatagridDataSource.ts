import $ from "jquery"
import querystring from "querystring"
import DatagridDataSource from "./DatagridDataSource"
import compressJson from "../compressJson"

// Uses mWater server to get datagrid data to allow sharing with unprivileged users
export default class ServerDatagridDataSource extends DatagridDataSource {
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   datagridId: datagrid id to use on server
  //   rev: revision to use to allow caching
  constructor(options: any) {
    super()
    this.options = options
  }

  // Get the data that the widget needs. The widget should implement getData method (see above) to get the data from the server
  //  design: design of the widget. Ignored in the case of server-side rendering
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  getRows(design: any, offset: any, limit: any, filters: any, callback: any) {
    const query = {
      client: this.options.client,
      share: this.options.share,
      filters: compressJson(filters),
      rev: this.options.rev,
      offset,
      limit
    }

    const url = this.options.apiUrl + `datagrids/${this.options.datagridId}/data?` + querystring.stringify(query)

    return $.getJSON(url, (data) => {
      return callback(null, data)
    }).fail((xhr) => {
      console.log(xhr.responseText)
      return callback(new Error(xhr.responseText))
    })
  }

  getQuickfiltersDataSource() {
    return new ServerQuickfilterDataSource(this.options)
  }
}

class ServerQuickfilterDataSource {
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   datagridId: datagrid id to use on server
  //   rev: revision to use to allow caching
  constructor(options: any) {
    this.options = options
  }

  // Gets the values of the quickfilter at index
  getValues(index: any, expr: any, filters: any, offset: any, limit: any, callback: any) {
    const query = {
      client: this.options.client,
      share: this.options.share,
      filters: compressJson(filters),
      offset,
      limit,
      rev: this.options.rev
    }

    const url =
      this.options.apiUrl +
      `datagrids/${this.options.datagridId}/quickfilters/${index}/values?` +
      querystring.stringify(query)

    return $.getJSON(url, (data) => {
      return callback(null, data)
    }).fail((xhr) => {
      console.log(xhr.responseText)
      return callback(new Error(xhr.responseText))
    })
  }
}

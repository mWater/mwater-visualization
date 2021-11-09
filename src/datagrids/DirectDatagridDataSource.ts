import DatagridDataSource from "./DatagridDataSource"
import DatagridQueryBuilder from "./DatagridQueryBuilder"
import * as QuickfilterUtils from "../quickfilter/QuickfilterUtils"
import { DataSource, Schema } from "mwater-expressions"

// Uses direct DataSource queries
export default class DirectDatagridDataSource {
  options: { schema: Schema; dataSource: DataSource }

  // Create dashboard data source that uses direct jsonql calls
  // options:
  //   schema: schema to use
  //   dataSource: data source to use
  constructor(options: { schema: Schema; dataSource: DataSource }) {
    this.options = options
  }

  // Gets the rows specified
  getRows(design: any, offset: any, limit: any, filters: any, callback: any) {
    const queryBuilder = new DatagridQueryBuilder(this.options.schema)

    // Create query to get the page of rows at the specific offset
    const query = queryBuilder.createQuery(design, {
      offset,
      limit,
      extraFilters: filters
    })

    return this.options.dataSource.performQuery(query, callback)
  }

  // Gets the quickfilters data source
  getQuickfiltersDataSource() {
    return {
      getValues: (index: any, expr: any, filters: any, offset: any, limit: any, callback: any) => {
        // Perform query
        return QuickfilterUtils.findExprValues(
          expr,
          this.options.schema,
          this.options.dataSource,
          filters,
          offset,
          limit,
          callback
        )
      }
    }
  }
}

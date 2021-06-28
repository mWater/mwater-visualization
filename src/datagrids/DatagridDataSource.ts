// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.

// Data source for a datagrid that allows client-server model that supports sharing of datagrids
let DashboardDataSource

export default DashboardDataSource = class DashboardDataSource {
  // Gets the rows specified
  getRows(design, offset, limit, filters, callback) {
    throw new Error("Not implemented")
  }

  // Gets the quickfilters data source
  getQuickfiltersDataSource() {
    throw new Error("Not implemented")
  }
}

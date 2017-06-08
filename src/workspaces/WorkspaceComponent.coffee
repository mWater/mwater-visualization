PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

# Workspace component that displays a workspace as a series of tabs
module.exports = class WorkspaceComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired          # See README.md
    onDesignChange: PropTypes.func               # If not set, readonly
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    dashboardDataSource: PropTypes.object.isRequired # dashboard data source

    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked
    namedStrings: PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

  render: ->
    return H.div null, "TODO"
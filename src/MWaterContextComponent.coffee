PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

MWaterTableSelectComponent = require './MWaterTableSelectComponent'
MWaterAddRelatedFormComponent = require './MWaterAddRelatedFormComponent'
MWaterAddRelatedIndicatorComponent = require './MWaterAddRelatedIndicatorComponent'
MWaterGlobalFiltersComponent = require './MWaterGlobalFiltersComponent'

# Creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
# and several other context items
module.exports = class MWaterContextComponent extends React.Component
  @propTypes:
    apiUrl: PropTypes.string.isRequired
    client: PropTypes.string
    user: PropTypes.string                              # user id of logged in user
    extraTables: PropTypes.arrayOf(PropTypes.string)  # Extra tables to load in schema. Forms are not loaded by default as they are too many
    onExtraTablesChange: PropTypes.func                     # Called when extra tables are changed and schema will be reloaded

    # Override default add layer component. See AddLayerComponent for details
    addLayerElementFactory: PropTypes.func              

  @childContextTypes: 
    tableSelectElementFactory: PropTypes.func  # Call with props of TableSelectComponent
    addLayerElementFactory: PropTypes.func     # Call with props of AddLayerComponent
    globalFiltersElementFactory: PropTypes.func # Call with props { schema, dataSource, filterableTables, globalFilters, onChange, nullIfIrrelevant }. 
    # Displays a component to edit global filters. nullIfIrrelevant causes null element if not applicable to filterableTables

    # Decorates sections (the children element, specifically) in the expression picker
    decorateScalarExprTreeSectionChildren: PropTypes.func

    # Function to override initial open state of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
    # Should return true to set initially open
    isScalarExprTreeSectionInitiallyOpen: PropTypes.func

    # Function to override filtering of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
    # Should return null for default, true to include, false to exclude
    isScalarExprTreeSectionMatch: PropTypes.func
  
  getChildContext: ->
    context = {}

    context.tableSelectElementFactory = (props) =>
      return React.createElement(MWaterTableSelectComponent,
        apiUrl: @props.apiUrl
        client: @props.client
        schema: props.schema
        user: @props.user
        table: props.value
        onChange: props.onChange
        extraTables: @props.extraTables
        onExtraTablesChange: @props.onExtraTablesChange
        filter: props.filter
        onFilterChange: props.onFilterChange
     )

    if @props.addLayerElementFactory
      context.addLayerElementFactory = @props.addLayerElementFactory

    context.globalFiltersElementFactory = (props) =>
      if props.nullIfIrrelevant and not _.any(props.filterableTables, (t) -> t.match(/^entities./))
        return null
        
      return React.createElement(MWaterGlobalFiltersComponent, props)

    context.decorateScalarExprTreeSectionChildren = (options) =>
      # If related forms section of entities table
      if options.tableId.match(/^entities\./) and options.section.id == "!related_forms"
        return R 'div', key: "_add_related_form_parent",
          options.children
          R MWaterAddRelatedFormComponent, 
            key: "_add_related_form"
            table: options.tableId
            apiUrl: @props.apiUrl
            client: @props.client
            user: @props.user
            schema: @state.schema
            onSelect: @handleAddTable

      # If indicators section of entities table
      if options.tableId.match(/^entities\./) and options.section.id == "!indicators"
        return R 'div', key: "_add_related_indicator_parent",
          options.children
          R MWaterAddRelatedIndicatorComponent,
            key: "_add_related_indicator" 
            table: options.tableId
            apiUrl: @props.apiUrl
            client: @props.client
            user: @props.user
            schema: @state.schema
            onSelect: @handleAddTable
            filter: options.filter

      else
        return options.children

    # Always match indicator section
    context.isScalarExprTreeSectionMatch = (options) =>
      if options.tableId.match(/^entities\./) and options.section.id == "!indicators"
        return true
      return null

    # Always open indicator section
    context.isScalarExprTreeSectionInitiallyOpen = (options) =>
      if options.tableId.match(/^entities\./) and options.section.id == "!indicators"
        return true
      return null

    return context

  handleAddTable: (table) =>
    extraTables = _.union(@props.extraTables, [table])
    @props.onExtraTablesChange(extraTables)

  render: ->
    return @props.children

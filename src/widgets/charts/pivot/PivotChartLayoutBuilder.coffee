_ = require 'lodash'
# ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../../../axes/AxisBuilder'
# injectTableAlias = require('mwater-expressions').injectTableAlias

PivotChartUtils = require './PivotChartUtils'

# Builds pivot table layout from the design and data
# See PivotChart Design.md for more detauls
module.exports = class PivotChartLayoutBuilder 
  # Pass in schema
  constructor: (options) ->
    @schema = options.schema
    @exprUtils = new ExprUtils(@schema)
    @axisBuilder = new AxisBuilder(schema: @schema)

  buildLayout: (design, data, locale) ->
    # Create empty layout
    layout = {
      rows: []
    }

    # Get all columns
    columns = []
    for segment in design.columns
      columns = columns.concat(@getRowsOrColumns(false, segment, data, locale))

    # Get all rows
    rows = []
    for segment in design.rows
      rows = rows.concat(@getRowsOrColumns(true, segment, data, locale))

    # Determine depth of row headers and column headers (how deeply nested segments are)
    rowsDepth = _.max(_.map(rows, (row) -> row.length))
    columnsDepth = _.max(_.map(columns, (column) -> column.length))

    # Emit column headers, leaving blank space at left for row headers
    for depth in [0...columnsDepth]
      # If any segment has label and axis, add a special row of just labels
      if _.any(columns, (column) -> column[depth] and column[depth].segment.label and column[depth].segment.valueAxis)
        cells = []
        for i in [1..rowsDepth]
          cells.push({ type: "blank", text: null })
        for column in columns
          cells.push({ type: "columnLabel", section: column[depth]?.segment.id, text: column[depth]?.segment.label, align: "center" })
        layout.rows.push({ cells: cells })
    
      # Emit column labels
      cells = []
      for i in [1..rowsDepth]
        cells.push({ type: "blank", text: null })
      for column in columns
        cells.push({ 
          type: if column[depth]?.segment?.valueAxis then "columnSegment" else "columnLabel"
          section: column[depth]?.segment.id
          text: column[depth]?.label
          align: "center"
          # Unconfigured if segment has no label or value
          unconfigured: column[depth]?.segment and not column[depth]?.segment.label? and not column[depth]?.segment.valueAxis
        })

      layout.rows.push({ cells: cells })

    # Emit main section
    # Keep track of current row segment, so we can re-emit headers for row segments that have both axis and label
    rowSegments = []
    for row in rows
      # Emit special row header for any segments that have changed and have both axis and label
      needsSpecialRowHeader = []
      for depth in [0...rowsDepth]
        if row[depth] and rowSegments[depth] != row[depth].segment and row[depth].segment.label and row[depth].segment.valueAxis
          needsSpecialRowHeader.push(true)
        else
          needsSpecialRowHeader.push(false)

      if _.any(needsSpecialRowHeader)
        cells = []
        for depth in [0...rowsDepth]
          if needsSpecialRowHeader[depth]
            cells.push({ type: "rowLabel", section: row[depth]?.segment.id, text: row[depth].segment.label })
          else
            cells.push({ 
              type: "rowLabel"
              section: row[depth]?.segment.id
              text: null 
              # Unconfigured if segment has no label or value
              unconfigured: row[depth]?.segment and not row[depth]?.segment.label? and not row[depth]?.segment.valueAxis
            })

        # Add blank columns
        for column in columns
          cells.push({ type: "blank", text: null })

        layout.rows.push({ cells: cells })

      # Reset row segments
      rowSegments = _.pluck(row, "segment")
          
      # Emit normal row headers
      cells = []
      for depth in [0...rowsDepth]
        cells.push({ 
          type: if row[depth]?.segment?.valueAxis then "rowSegment" else "rowLabel"
          section: row[depth]?.segment.id
          text: row[depth]?.label 
          # Unconfigured if segment has no label or value
          unconfigured: row[depth]?.segment and not row[depth]?.segment.label? and not row[depth]?.segment.valueAxis
        })

      # Emit contents
      for column in columns
        cells.push(@buildIntersectionCell(design, data, locale, row, column))

      layout.rows.push({ cells: cells })

    # Span column headers and column segments that have same segment and value
    for layoutRow in layout.rows
      refCell = null
      for cell, i in layoutRow.cells
        if i == 0
          refCell = cell
          continue

        # If matches, span columns
        if cell.type in ['columnLabel', 'columnSegment'] and cell.text == refCell.text and cell.type == refCell.type and cell.section == refCell.section
          cell.type = "skip"
          refCell.columnSpan = (refCell.columnSpan or 1) + 1
        else
          refCell = cell

    # Span row headers and row segments that have same segment and value
    for columnIndex in [0...layout.rows[0].cells.length]
      refCell = null
      for rowIndex in [0...layout.rows.length]
        cell = layout.rows[rowIndex].cells[columnIndex]

        if i == 0
          refCell = cell
          continue

        # If matches, span rows
        if cell.type in ['rowLabel', 'rowSegment'] and cell.text == refCell.text and cell.type == refCell.type and cell.section == refCell.section
          cell.type = "skip"
          refCell.rowSpan = (refCell.rowSpan or 1) + 1
        else
          refCell = cell

    return layout

  # Build a cell which is the intersection of a row and column, where row and column are nested arrays
  # from getRowsOrColumns
  buildIntersectionCell: (design, data, locale, row, column) ->
    # Get intersection id
    intersectionId = _.map(row, (r) -> r.segment.id).join(",") + ":" + _.map(column, (c) -> c.segment.id).join(",")

    # Lookup intersection 
    intersection = design.intersections[intersectionId]
    if not intersection
      return { type: "blank", text: null }
    
    # Lookup data
    intersectionData = data[intersectionId]

    # Lookup value (very slow!)
    # Do this by finding an entry which matches all of the row and column values
    entry = _.find(intersectionData, (e) ->
      for part, i in row
        if e["r#{i}"] != part.value
          return false
      for part, i in column
        if e["c#{i}"] != part.value
          return false
      return true
      )

    value = entry?.value

    # Format using axis builder if present. Blank otherwise
    if value?
      text = @axisBuilder.formatValue(intersection.valueAxis, value, locale)
    else
      text = null

    return { type: "intersection", section: intersectionId, text: text, align: "right" }

  # Get rows or columns in format of array of
  # [{ segment:, label:, value:  }, ...] 
  # For segments with no children, there will be an array of single value array entries (array of array)
  # data is lookup of query results by intersection id
  # parentSegments are ancestry of current segment, starting with root
  getRowsOrColumns: (isRow, segment, data, locale, parentSegments = [], parentValues = []) ->
    # If no axis, categories are just null
    if not segment.valueAxis
      categories = [{ value: null, label: segment.label }]
    else
      # Find all values (needed for category finding of axis)
      allValues = []

      # To find all values, first need all intersections that are relevant
      for intersectionId, intersectionData of data
        # Ignore non-intersection data (header + footer)
        if not intersectionId.match(":")
          continue

        # Get segment ids
        if isRow
          segIds = intersectionId.split(":")[0].split(",")
        else
          segIds = intersectionId.split(":")[1].split(",")

        # Ensure that matches any parent segments passed in plus self
        if not _.isEqual(_.take(segIds, parentSegments.length + 1), _.pluck(parentSegments, "id").concat(segment.id))
          continue

        # Only take data that matches any parent values
        relevantData = _.filter(intersectionData, (dataRow) =>
          for parentValue, i in parentValues
            if isRow
              if dataRow["r#{i}"] != parentValue
                return false
            else
              if dataRow["c#{i}"] != parentValue
                return false

          return true
        )

        if isRow
          allValues = allValues.concat(_.pluck(relevantData, "r#{parentSegments.length}"))
        else
          allValues = allValues.concat(_.pluck(relevantData, "c#{parentSegments.length}"))

      # Get categories
      categories = @axisBuilder.getCategories(segment.valueAxis, allValues, locale)

      # Filter excluded values
      categories = _.filter(categories, (category) -> category.value not in (segment.valueAxis.excludedValues or []))

    # If no children segments, return 
    if not segment.children or segment.children.length == 0
      return _.map(categories, (category) -> [{ segment: segment, value: category.value, label: category.label }])

    # For each category, get children and combine into results
    results = []
    for category in categories
      for childSegment in segment.children
        # Get child results
        childResults = @getRowsOrColumns(isRow, childSegment, data, locale, parentSegments.concat([segment]), parentValues.concat([category.value]))

        for childResult in childResults
          results.push([{ segment: segment, value: category.value, label: category.label }].concat(childResult))

    return results
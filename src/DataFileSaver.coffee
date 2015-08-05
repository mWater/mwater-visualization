LayeredChartCompiler = require './LayeredChartCompiler'
ExpressionBuilder = require './ExpressionBuilder'
saveAs = require 'filesaver.js'
_ = require 'lodash'

# Get the css rules corresponding to .c3 directly out of the document object
getC3Css = () =>
  css = []
  for sheet in document.styleSheets
    rules = sheet.cssRules or sheet.rules
    for rule in rules
      if rule.cssText and rule.cssText.startsWith(".c3")
        css.push(rule.cssText)
  return css.join('\n')

# Get the svg XML text straight from the DOM node, adding the css styling to it as a <style> element
getC3String = (c3Node) =>
  # Log SVG with stylesheet info
  # First get the svg DOM node and make a copy as an XML doc
  svgStr = c3Node.outerHTML
  xml = $.parseXML(svgStr)
  svgNode = xml.documentElement
  # Denote it as svg
  svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  svgNode.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
  # Add a style element with the .c3 css rules for this page
  styleNode = xml.createElement("style")
  styleNode.setAttribute("type", "text/css")
  css = getC3Css()
  cdata = xml.createCDATASection(css)
  styleNode.appendChild(cdata)
  svgNode.insertBefore(styleNode, svgNode.firstChild)
  # Serialize
  svgFinalStr = new XMLSerializer().serializeToString(xml)
  return svgFinalStr

# Creates the svg string and saves that to file
saveSvgToFile = (containerDiv, title) ->
  svgFinalStr = getC3String(containerDiv.firstChild)
  document.body.removeChild(containerDiv)
  blob = new Blob([svgFinalStr], {type: "image/svg+xml"})
  saveAs(blob, (title or "unnamed-chart") + ".svg")

# Saves svg files from layered charts
# design: design of the chart
# data: results from queries
# schema: the chart's schema
module.exports.saveDataAsSvg = (design, data, schema) ->
  compiler = new LayeredChartCompiler(schema: schema)
  props =
    design: design
    data: data
    width: 400
    height: 400
  chartOptions = compiler.createChartOptions(props)
  containerDiv = document.createElement("div")
  document.body.appendChild(containerDiv) # Otherwise d3 getBBox doesn't work, odd title placement
  chartOptions.bindto = containerDiv
  title = design.titleText
  chartOptions.onrendered = => _.defer(-> saveSvgToFile(containerDiv, title))
  c3.generate(chartOptions)

csvifyValue = (r, c, value) ->
  if not value?
    return ""

  # Handle case of an array that leaked through without crashing
  if _.isArray(value)
    return value.join(",")

  # Handle true/false as strings
  if value == true
    return "true"
  if value == false
    return "false"

  return value

# Table is a 2d array [row][column]
stringifyCsv = (table, replacer) ->
  replacer = replacer or (r, c, v) ->
    v

  csv = ""
  rr = table.length
  r = 0
  # for each row
  while r < rr
    # Adds a new line if not the first line
    csv += "\r\n"  if r
    c = 0
    cc = table[r].length
    # for each columns
    while c < cc
      # Adds a new , if not the first column
      csv += ","  if c
      cell = replacer(r, c, table[r][c])
      cell = "\"" + cell.replace(/"/g, "\"\"") + "\""  if /[,\r\n"]/.test(cell)
      csv += (if (cell or 0 is cell) then cell else "")
      ++c
    ++r
  return csv

exportCsv = (rows) ->
  csvString = stringifyCsv(rows, csvifyValue)
  
renderHeaderCell = (column, exprBuilder) ->
  text = column.headerText or exprBuilder.summarizeAggrExpr(column.expr, column.aggr)
  return text

renderHeader = (data, columns, exprBuilder) ->
  _.map(columns, (column) -> renderHeaderCell(column, exprBuilder))

renderCell = (row, column, columnIndex, exprBuilder) ->
  console.log column
  value = row["c#{columnIndex}"]
  str = exprBuilder.stringifyExprLiteral(column.expr, value)
  return str

renderRow = (row, columns, exprBuilder) ->
  _.map(columns, (column, i) -> renderCell(row, column, i, exprBuilder))
    
createTable = (data, columns, exprBuilder) ->
  table = []
  table.push(renderHeader(data, columns, exprBuilder))
  for row in data.main
    table.push(renderRow(row, columns, exprBuilder))
  table
    
module.exports.saveDataAsCsv = (design, data, schema) ->
  console.log design
  console.log data
  console.log schema
  exprBuilder = new ExpressionBuilder(schema)
  table = createTable(data, design.columns, exprBuilder)
  console.log table
  csv = exportCsv table
  console.log csv
  return

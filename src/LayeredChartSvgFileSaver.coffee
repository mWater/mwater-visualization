LayeredChartCompiler = require './LayeredChartCompiler'
saveAs = require 'filesaver.js'

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
saveSvgToFile = (c3Node, title) ->
  svgFinalStr = getC3String(c3Node)
  blob = new Blob([svgFinalStr], {type: "image/svg+xml"})
  saveAs(blob, title + ".svg")

# Saves svg files from layered charts
module.exports = class LayeredChartSvgFileSaver

  # design: design of the chart
  # dataSource: data source to use for chart
  # filters: array of filters to apply (array of expressions)
  # chart: the chart element
  constructor: (design, dataSource, filters, chart) ->
    @design = design
    @dataSource = dataSource
    @filters = filters
    @chart = chart

  # Handle the data: create the chart, have c3 generate it, and call the function to save it to file
  onQueryDone: (err, data) ->
    if err
      alert(err)# TODO
    else
      props = {
        design: @chart.cleanDesign(@design)
        data: data
        width: 800
        height: 800
      }
      compiler = new LayeredChartCompiler(schema: @chart.schema)
      chartOptions = compiler.createChartOptions(props)
      containerDiv = document.createElement("div")
      chartOptions.bindto = containerDiv
      title = @design.titleText
      chartOptions.onrendered = => _.defer(-> saveSvgToFile(containerDiv.firstChild, title))
      c3.generate(chartOptions)

  # Get the data and save it to file when finished
  save: ->
    queries = @chart.createQueries(@design, @filters)
    self = this
    @dataSource.performQueries(queries, (err, data) -> self.onQueryDone(err, data))

LayeredChartCompiler = require './LayeredChartCompiler'

getC3Css = () =>
  css = []
  for sheet in document.styleSheets
    rules = sheet.cssRules or sheet.rules
    for rule in rules
      if rule.cssText and rule.cssText.startsWith(".c3")
        css.push(rule.cssText)
  return css.join('\n')

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

saveSvgToFile = (c3Node) ->
  svgFinalStr = getC3String(c3Node)
  console.log svgFinalStr

module.exports = class LayeredChartSvgFileSaver
  constructor: (design, dataSource, filters, chart) ->
    @design = design
    @dataSource = dataSource
    @filters = filters
    @chart = chart

  onQueryDone: (err, data) ->
    console.log this
    if err
      # TODO
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
      chartOptions.onrendered = => _.defer(-> saveSvgToFile(containerDiv.firstChild))
      c3.generate(chartOptions)

  save: ->
    queries = @chart.createQueries(@design, @filters)
    self = this
    @dataSource.performQueries(queries, (err, data) -> self.onQueryDone(err, data))

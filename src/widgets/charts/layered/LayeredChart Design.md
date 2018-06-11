# Design is:
  
  type: bar/line/spline/scatter/area/pie/donut
  layers: array of layers
  titleText: (deprecated by headerItems) title text 
  xAxisLabelText: text of x axis label, display default value if "", display nothing if null
  yAxisLabelText: text of y axis label, display default value if "", display nothing if null
  transpose: true to flip axes
  stacked: true to stack all 
  proportional: true to stack proportionally (100 %). Only applicable if stacked
  labels: true to show labels on values
  header: text widget design to display in header (replaces title)
  footer: text widget design to display in header
  yThresholds: array of { value:, label: } thresholds to draw on y-axis. Only for non-polar

layer:
  type: bar/line/spline/scatter/area/pie/donut (overrides main one)
  table: table of layer
  name: label for layer (optional)
  axes: axes (see below)
  stacked: true to stack. Defaults true if multiple layers and has color index.
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800)
  cumulative: true to use running total of values

axes:
  x: x axis
  y: y axis
  color: color axis (to split into series based on a color)

axis: 
  expr: expression of axis
  aggr: aggregation for axis



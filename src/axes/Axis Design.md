# Axes

An axis is an expression with optional aggregation, transform and color mapping
In ggplot2 parlance, an "aesthetic"

It contains:
 expr: expression
 aggr: DEPRECATED: optional aggregation (e.g. sum)
 xform: optional transformation to be applied. object with `type` field. See below
 colorMap: optional array of { value: value of expression, post-transform, color: html color }
 drawOrder: optional array of category values which define the order in which categories should be rendered
 nullLabel: optional string for null category

aggregation and transforms are mutually exclusive.

## Xforms

types: 

`bin`: convert into bins. always has `numBins` integer and `min` and `max`. type enum
`date`: convert to complete date e.g. `2015-02-08`. type date
`year`: year only e.g. `2015-01-01`. type date
`yearmonth`: year and month only e.g. `2015-02-01`. type date
`month`: month only e.g. `02`. type enum
`ranges`: convert to ranges. type enum. `ranges` is array of { id (unique id), label (optional label), minValue (null for none), maxValue (null for none), minOpen (true for >, false for >=), maxOpen (true for <, false for <=) }


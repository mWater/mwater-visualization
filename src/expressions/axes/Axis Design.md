# Axes

An axis is an expression with optional aggregation, transform and color mapping
In ggplot2 parlance, an "aesthetic"

It contains:
 expr: expression
 aggr: optional aggregation (e.g. sum)
 xform: transformation to be applied. object with `type` field. See below
 colorMap: TBD


## Xforms

types: 

`none`: identity
`bin`: convert into bins. always has `numBins` integer. type enum
`date`: convert to complete date e.g. `2015-02-08`. type date
`year`: year only e.g. `2015-01-01`. type date
`yearmonth`: year and month only e.g. `2015-02-01`. type date
`month`: month only e.g. `02`. type enum
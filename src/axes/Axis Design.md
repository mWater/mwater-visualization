# Axes

An axis is an expression with optional aggregation, transform and color mapping
In ggplot2 parlance, an "aesthetic"

It contains:
 expr: expression
 aggr: DEPRECATED: optional aggregation (e.g. sum)
 xform: optional transformation to be applied. object with `type` field. See below
 colorMap: optional array of color mappings. See below
 drawOrder: optional array of category values which define the order in which categories should be rendered
 nullLabel: optional string for null category
 excludedValues: Array of post-xform values to exclude when displaying. 
 format: optional d3-format format for numeric values. Default if null is ","

## Xforms

types: 

`bin`: convert into bins. always has `numBins` integer and `min` and `max`. Can have `excludeUpper` and/or `excludeLower` to remove open bin on top or bottem. type enum
`date`: convert to complete date e.g. `2015-02-08`. type date
`year`: year only e.g. `2015-01-01`. type date
`yearmonth`: year and month only e.g. `2015-02-01`. type date
`month`: month only e.g. `02`. type enum
`week`: ISO week of year e.g. `01` for the first week that contains January 4th
`ranges`: convert to ranges. type enum. `ranges` is array of { id (unique id), label (optional label), minValue (null for none), maxValue (null for none), minOpen (true for >, false for >=), maxOpen (true for <, false for <=) }

## Color map

Array of { value: post-transform value of expression, color: html color }

The color map is kept in sync with the values of the axis after transformation.

The order is not important.
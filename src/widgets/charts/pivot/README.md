# Pivot Chart

The pivot chart (pivot table) allows building of a complex pivot table with nested rows and columns.

## Terminology

### Segment

Segments are the building block of pivot tables. Each is either on the row or column axis. They represent one expression (enum/text) that
is analyzed.

Segments can be nested to allow sub-division and are ordered.

### Intersection

These compose the data area of the table. There is an intersection for each possible combination that makes sense of segments that form
a rectangle. An intersection is id-ed by "rowid:columnid" or "rowid,rowid:columnid,columnid" etc. depending on its component ids.

### Section

Either a segment or intersection or blank area. Always a rectangle. Id is like intersection id if intersection, id of segment if segment

## Design

design:
header: text widget design to display in header
footer: text widget design to display in header

table: table of pivot chart
rows: array of segments that make up rows
columns: array of segments that make up columns
intersections: lookup of intersection id (e.g. "rowid:columnid" or "rowid,rowid:columnid,columnid" etc.) to intersection
filter: optional logical expression to filter by
striping: "columns"/"rows" to put in light striping

segment:
id: id of segment
label: optional label of segment
valueAxis: enum/text axis that determines values. Optional.
children: array of child segments if any. Optional

orderExpr: optional aggregate ordering expression
orderDir: "asc" (default)/ "desc"

fillerColor: color of filler for intersections that are filler type

filter: optional logical expression to filter by (filters all intersections related to it)

bold: true if bold (values and label)
italic: true if italic
valueLabelBold: true if label alone is bold (only when has valueAxis and label)

borderBefore: weight of border before segment (0 = none, 1 = light, 2 = medium (default), 3 = heavy)
borderWithin: weight of border within segment (0 = none, 1 = light (default), 2 = medium, 3 = heavy)
borderAfter: weight of border after segment (0 = none, 1 = light, 2 = medium (default), 3 = heavy)

intersection:
valueAxis: axis that determines value to display in cells. Must be aggregate

filter: optional logical expression to filter by

backgroundColorAxis: color axis for background of cells
backgroundColorOpacity: fractional background opacity
backgroundColor: color of background if no color axis

backgroundColorConditions: array of conditional colors that override axis and background color
Each contains: { condition: aggregate boolean expression, color: color value }

bold: true if bold
italic: true if italic

## Rendering

Rendering a pivot chart is first done by getting the data for each intersection (see PivotChartQueryBuilder).

The data results from the queries is a lookup of intersection id to array of rows ([{ value: , r0: , c0: ,... }, ...])

The data and design together are passed to the PivotChartLayoutBuilder which converts it into a layout which is
the list of rows and cells.

Layout format is as follows:

rows: array of rows
striping: "columns"/"rows" to put in light striping
tooManyRows: true if row limit exceeded
tooManyColumns: true if column limit exceeded

row:
cells: array of cells

cell:
type: row/column/blank/intersection. See below
subtype: value/filler/label/valueLabel. See below
text: text content of cell
align: left/center/right

section: section id (see above)
sectionTop: true if cell is on top edge of section
sectionBottom: true if cell is on bottom edge of section
sectionLeft: true if cell is on left edge of section
sectionRight: true if cell is on right edge of section

segment: segment if a row or column cell

borderLeft: weight of border (0 = none, 1 = light, 2 = medium, 3 = heavy)
borderRight: weight of border (0 = none, 1 = light, 2 = medium, 3 = heavy)
borderTop: weight of border (0 = none, 1 = light, 2 = medium, 3 = heavy)
borderBottom: weight of border (0 = none, 1 = light, 2 = medium, 3 = heavy)

bold: true if bold
italic: true if italic
indent: number of units to indent cell

backgroundColor: background color of cell

rowSpan: if spans more than one row. Next n-1 cells below will be type "skip"
columnSpan: if spans more than one column. Next n-1 cells will be type "skip"
skip: true if should skip cell because of row/column span

unconfigured: true if cell is a placeholder that needs to be configured
summarize: true if cell is unconfigured and can be turned into a summary

### Cell types

row: part of rows, has section as row segment id
column: part of columns, has section as column segment id
intersection: part of intersections, has section as intersection path
blank: filler cells at top left

### Cell subtypes

value: data-driven value
label: label row/column
valueLabel: header for values (rows and columns that have value and label)
filler: intersection cells that have no data but fill space for row label

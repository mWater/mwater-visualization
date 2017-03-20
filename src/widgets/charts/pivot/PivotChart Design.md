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

segment:
  id: id of segment
  label: optional label of segment
  valueAxis: enum/text axis that determines values. Optional.
  children: array of child segments if any. Optional

intersection:
  valueAxis: axis that determines value to display in cells. Must be aggregate
  backgroundColorAxis: color axis for background of cells
  backgroundColorOpacity: fractional background opacity

## Rendering 

Rendering a pivot chart is first done by getting the data for each intersection (see PivotChartQueryBuilder).

The data results from the queries is a lookup of intersection id to array of rows ([{ value: , r0: , c0: ,... }, ...])

The data and design together are passed to the PivotChartLayoutBuilder which converts it into a layout which is
the list of rows and cells.

Layout format is as follows:

  rows: array of rows

row:
  cells: array of cells

cell: 
  type: rowSegment/rowLabel/columnSegment/columnLabel/intersection/blank/skip
  text: text content of cell
  align: left/center/right
  section: section id (see above)
  sectionTop: true if cell is on top edge of section
  sectionBottom: true if cell is on bottom edge of section
  sectionLeft: true if cell is on left edge of section
  sectionRight: true if cell is on right edge of section
  bold: true if bold
  italic: true if italic
  backgroundColor: background color of cell
  level: 0, 1, 2 if segment
  rowSpan: if spans more than one row. Next n-1 cells below will be type "skip"
  columnSpan: if spans more than one column. Next n-1 cells will be type "skip"
  unconfigured: true if cell is a placeholder that needs to be configured






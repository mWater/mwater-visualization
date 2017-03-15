# Pivot Chart

The pivot chart (pivot table) allows building of a complex pivot table with nested rows and columns.

## Terminology

### Segment

Segments are the building block of pivot tables. Each is either on the row or column axis. They represent one expression (enum/text) that 
is analyzed. 

Segments can be nested to allow sub-division and are ordered.

### Intersection

These compose the data area of the table. There is an intersection for each possible combination that makes sense of segments that form
a rectangle.

### Section

Either a segment or intersection or blank area. Always a rectangle.

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
  valueAxis: enum/text axis that determines values
  children: array of child segments if any

intersection:
  textAxis: axis that determines text to display in cells. Must be aggregate

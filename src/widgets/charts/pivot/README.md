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

## Rendering

Rendering a pivot chart is first done by getting the data for each intersection (see PivotChartQueryBuilder).

The data results from the queries is a lookup of intersection id to array of rows ([{ value: , r0: , c0: ,... }, ...])

The data and design together are passed to the PivotChartLayoutBuilder which converts it into a layout which is
the list of rows and cells.


## Design of data grid

`table`: table id of main table
`columns`: array of columns
`filter`: mwater-expression
`locale`: locale to display localizable strings in. optional
`subtables`: array of subtables (1-n joins)
`orderBys`: array of { expr: expression to order on, direction: "asc"/"desc" }
`quickfilters`: array of quick filters (user-selectable filters). See quickfilters/README.md

### Column

`id`: unique id of the column
`label`: optional label for the column
`subtable`: subtable from which column is from. Null/undefined for main table
`width`: width of column in pixels
`type`: type of the column. see below

#### Column types:
`expr`: expression column
  `label`: label used for header
  `expr`: mwater-expression

### Subtable

`id`: unique id of the subtable (not the id of the table, just a unique id)
`name`: name of subtable (optional)
`joins`: array of join columns to get to subtable from the table
`filter`: mwater-expression
`orderBys`: array of { expr: expression to order on, direction: "asc"/"desc" }
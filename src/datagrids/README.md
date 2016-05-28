

## Design of data grid

`table`: table id of main table
`columns`: array of columns
`filter`: mwater-expression
`locale`: locale to display localizable strings in. optional

### Column

id: unique id of the column
width: width of column in pixels
<!-- sort: "asc"/"desc" or null/undefined -->
type: type of the column. see below

#### Column types:
`expr`: expression column
  label: label used for header
  expr: mwater-expression


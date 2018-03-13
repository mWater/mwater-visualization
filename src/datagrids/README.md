

## Design of data grid

`table`: table id of main table
`columns`: array of columns
`filter`: mwater-expression
`locale`: locale to display localizable strings in. optional
`subtables`: array of subtables (1-n joins)
`orderBys`: array of { expr: expression to order on, direction: "asc"/"desc" }
`quickfilters`: array of quick filters (user-selectable filters). See quickfilter/README.md
`showRowNumbers`: true to show row numbers
`globalFilters`: array of global filters. See below.

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

### Global Filters

Global filters apply to multiple tables at once if a certain column is present. User-interface to set them is application-specific
and the default (non-mWater) dashboard applies them but does not allow editing. 

Note: This is less applicable in the case of datagrids since there is a single table, but is included for consistency and ease 
of setting complex but common filters.

Array of:

columnId: id of column to filter
columnType: type of column to filter (to ensure that consistent)
op: op of expression for filtering
exprs: array of expressions to use for filtering. field expression for column will be injected as expression 0 in the resulting filter expression
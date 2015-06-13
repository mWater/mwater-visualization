# Expressions

## Questions

`startTable` or `baseTable`? Not used here, but in general... Or just `table`?

## Scalar expressions

Gets a single value given a row of a table.

`type`: "scalar"
`table`: Table id of start table
`joins`: Array of join columns to follow to get to table of expr. All must be `join` type
`expr`: Expression from final table to get value
`aggr`: Aggregation function to use if any join is multiple, null/undefined if not needed
`where`: optional logical expression to filter aggregation

## Field expressions 

Column of the database

`type`: "field"
`table`: Table id of table
`column`: Column id of column

## Logical expression

`type`: "logical"
`table`: Table id of start table ??
`op`: `and` or `or`
`exprs`: expressions to combine. Either `logical` for nested conditions or `comparison`

## Comparison expressions

`type`: "logical"
`table`: Table id of start table ??
`lhs`: left hand side expression. `scalar` usually.
`op`: "=", ">", ">=", "<", "<=", "~*", ">", "<", "= true", "= false", "is null", "is not null"
`rhs`: right hand side expressions. `literal` usually.

## Literal expressions

`type`: "literal"
`valueType`: "text", "integer", "decimal", "boolean", "enum", "date"
`value`: value of literal. date is ISO 8601
# Expressions

## Expression types

### Scalar expressions

Gets a single value given a row of a table.

`type`: "scalar"
`table`: Table id of start table
`joins`: Array of join columns to follow to get to table of expr. All must be `join` type
`expr`: Expression from final table to get value
`aggr`: Aggregation function to use if any join is multiple, null/undefined if not needed
`where`: optional logical expression to filter aggregation

#### Aggr values

aggr: "last", "sum", "count", "max", "min", "stdev", "stdevp"

### Field expressions 

Column of the database

`type`: "field"
`table`: Table id of table
`column`: Column id of column

### Logical expression

`type`: "logical"
`table`: Table id of table
`op`: `and` or `or`
`exprs`: expressions to combine. Either `logical` for nested conditions or `comparison`

### Comparison expressions

`type`: "comparison"
`table`: Table id of table 
`lhs`: left hand side expression. `scalar` usually.
`op`: "=", ">", ">=", "<", "<=", "~*", ">", "<", "= true", "= false", "is null", "is not null", '= any'
`rhs`: right hand side expressions. `literal` usually.

### Literal expressions

`type`: "literal"
`valueType`: "text", "integer", "decimal", "boolean", "enum", "date", "enum[]"
`value`: value of literal. date is ISO 8601

## Notes on `count(*)`

A scalar expression can have an `expr` of `null` and no joins in which case it acts as a null expression.

This is to allow the scalar popup editor to allow selection of the "Number of" something, effectively returning null for `*`

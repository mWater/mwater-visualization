# Expressions

## Scalar expressions

Gets a single value given a row of a table.

`type`: "scalar"
`table`: Table id of start table
`path`: Array of columns (at least one) to follow to get to final column to use. All but last must be `join` type
`aggr`: Aggregation function to use, null/undefined if not needed
`where`: optional logical expression to filter aggregation

## Logical expression

`type`: "logical"
`op`: `and` or `or`
`exprs`: expressions to combine. Either `logical` for nested conditions or `comparison`

## Comparison expressions

`type`: "logical"
`lhs`: left hand side expression. `scalar` usually.
`op`: "=", ">", ">=", "<", "<=", "~*", ">", "<", "= true", "= false", "is null", "is not null"
`rhs`: right hand side expressions. `literal` usually.

## Literal expressions

`type`: "literal"
`valueType`: "text", "integer", "decimal", "boolean", "enum", "date"
`value`: value of literal. date is ISO 8601
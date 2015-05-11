

## Field

Simple field

type: "field"
tableId: id of table
columnId: id of column

## Scalar

Scalar sub-expression

type: "scalar"
expr: expression at end of joins
aggrId: sum, count, max, min, stdev, stdevp
joinIds: [] array of join ids
where: where expression

## Comparison

Binary or unary inequality.

type: "comparison"
lhs: left hand side expression
rhs: right hand side if binary
op: =, >, >=, <, <=, ~*, = true, = false, is null, is not null

## Logical

Series of logical expressions (e.g. x and y and z)

type: "logical"
op: "and"/"or"
exprs: [] list of expressions

## Literals

type: "text", "integer", "decimal", "enum", "boolean"
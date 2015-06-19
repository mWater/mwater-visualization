# Schema

Schema describes the tables in the database and the columns (which include joins). 

Joins are included as a column type as they have a natural order within the other columns.

## Tables

`id`: unique id of table
`name`: localized name of table
`desc`: localized description of table (optional)
`ordering`: column with natural ordering (optional)

## Column types

`id`: Primary key. Opaque and used for counting number of rows. 
`text`: text string
`decimal`: Floating point
`integer`: Integer
`date`: Date in ISO 6801 format
`boolean`: true/false
`enum`: fixed values. See values definition
`join`: Reference to another table, either one to many or many to one ?? join or ref?

## Column properties

`id`: table-unique id of column
`name`: localized name of column
`desc`: localized description of column
`type`: See above
`values`: Values for enum. Array of { id, name } ?? id or value?
`join`: Details of the join. See below


## Joins

`fromTable`: table to start join from
`fromColumn`: table column to start join from
`toTable`: table to end join at
`toColumn`: table to start join at
`op`: Op to join with. Usually `=`
`multiple`: true if one to many or many to many

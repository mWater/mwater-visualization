# Schema

Schema describes the tables in the database and the columns (which include joins). 

Joins are included as a column type as they have a natural order within the other columns.


## Tables

`id`: unique id of table

`name`: localized name of table

`desc`: localized description of table (optional)

`ordering`: column with natural ordering (optional)

`columns`: array of columns of the table

`sql`: sql expression that gets the table. Usually just name of the table. *Note*: this is only for when sharing a schema file with [LookupSchemaMap](https://github.com/mWater/jsonql/blob/master/src/LookupSchemaMap.coffee)

## Column properties

`id`: table-unique id of column

`name`: localized name of column

`desc`: localized description of column

`type`: See below

`values`: Values for enum. Array of { id, name } 

`join`: Details of the join. See below

`sql`: sql expression that gets the column value. Uses `{alias}` which will be substituted with the table alias. Usually just `{alias}.some_column_name`. *Note*: this is only for when sharing a schema file with [LookupSchemaMap](https://github.com/mWater/jsonql/blob/master/src/LookupSchemaMap.coffee)


## Column types

`id`: id column. Ignored. *Note*: this is only for when sharing a schema file with [LookupSchemaMap](https://github.com/mWater/jsonql/blob/master/src/LookupSchemaMap.coffee)

`text`: text string

`decimal`: Floating point

`integer`: Integer

`date`: Date in ISO 8601 format

`boolean`: true/false

`enum`: fixed values. See values definition

`join`: Reference to another table, either one to many or many to one ?? join or ref?


## Values

Enum values are represented by an array of objects e.g. `{ id: some id, name: some name }`. `id` can be any literal type. `name` is a string label of the enum value


## Joins

`fromTable`: table to start join from

`fromColumn`: table column to start join from

`toTable`: table to end join at

`toColumn`: table to start join at

`op`: Op to join with. Usually `=`

`multiple`: true if one to many or many to many

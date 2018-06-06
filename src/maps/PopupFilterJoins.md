# Popup filter joins

Object keyed by table name that has expressions as values.

Each value is an expression for its key's table that is a type `id` or `idTable` of the layer's table.

This is used to filter the popup so that the rows are scoped to the item clicked on.

For example, if the map displays water systems, the popup will (by default) only be filtered by water systems, selecting only the row that was clicked on.

However, it could also filter to only water points that are related to the water system by adding the following key-value:

entities.water_point: { table: "entities.water_point", type: "field", column: "water_system" }
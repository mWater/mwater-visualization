

# Utilities for popup filter joins. See PopupFilterJoins.md for further explanation.
module.exports = class PopupFilterJoinsUtils
  @createPopupFilters: (popupFilterJoins, schema, layerTable, rowId) ->
    filter = {
      table: layerTable
      jsonql: { type: "op", op: "=", exprs: [
        { type: "field", tableAlias: "{alias}", column: schema.getTable(layerTable).primaryKey }
        { type: "literal", value: rowId }
      ]}
    }

    return [filter]

  @createDefaultPopupFilterJoins: (table) ->
    popupFilterJoins = {}

    # Return id of row for a simple match
    popupFilterJoins[table] = { table: table, type: "id" }

    return popupFilterJoins
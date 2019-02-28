_ = require 'lodash'
AxisBuilder = require '../axes/AxisBuilder'
ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias

# Defines a layer for a map which has all the logic for rendering the specific data to be viewed
module.exports = class Layer
  # Gets the layer definition as JsonQL + CSS in format:
  #   {
  #     layers: array of { id: layer id, jsonql: jsonql that includes "the_webmercator_geom" as a column }
  #     css: carto css
  #     interactivity: (optional) { layer: id of layer, fields: array of field names }
  #   }
  # arguments:
  #   design: design of layer
  #   schema: schema to use
  #   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
  getJsonQLCss: (design, schema, filters) ->
    throw new Error("Not implemented")

  # Called when the interactivity grid is clicked. 
  # arguments:
  #   ev: { data: interactivty data e.g. `{ id: 123 }` }
  #   options: 
  #     design: design of layer
  #     schema: schema to use
  #     dataSource: data source to use
  #     layerDataSource: layer data source
  #     scopeData: current scope data if layer is scoping
  #     filters: compiled filters to apply to the popup
  # 
  # Returns:
  #   null/undefined 
  #   or
  #   {
  #     scope: scope to apply ({ name, filter, data })
  #     row: { tableId:, primaryKey: }  # row that was selected
  #     popup: React element to put into a popup
  #   }
  onGridClick: (ev, options) ->
    return null

  # Gets the bounds of the layer as GeoJSON
  getBounds: (design, schema, dataSource, filters, callback) ->
    callback(null)

  # Get min and max zoom levels
  getMinZoom: (design) -> return null
  getMaxZoom: (design) -> return null

  # Get the legend to be optionally displayed on the map. Returns
  # a React element
  getLegend: (design, schema, name, dataSource, filters = []) ->
    return null

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    return []

  # True if layer can be edited
  isEditable: () ->
    return false

  # True if layer is incomplete (e.g. brand new) and should be editable immediately
  isIncomplete: (design, schema) ->
    return @validateDesign(@cleanDesign(design, schema), schema)?

  # Creates a design element with specified options.
  # Design should be cleaned on the way in and on way out.
  # options:
  #   design: design of layer
  #   schema: schema to use
  #   dataSource: data source to use
  #   onDesignChange: function called when design changes
  createDesignerElement: (options) ->
    throw new Error("Not implemented")

  # Returns a cleaned design
  cleanDesign: (design, schema) ->
    return design

  # Validates design. Null if ok, message otherwise
  validateDesign: (design, schema) ->
    return null

  # arguments:
  #   design: design of layer
  #   schema: schema to use
  #   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
  getKMLExportJsonQL: (design, schema, filters) ->
    throw new Error("Not implemented")

  # Convenience function to get the bounds of a geometry expression with filters
  getBoundsFromExpr: (schema, dataSource, table, geometryExpr, filterExpr, filters, callback) ->
    exprCompiler = new ExprCompiler(schema)
    compiledGeometryExpr = exprCompiler.compileExpr(expr: geometryExpr, tableAlias: "main")

    # Create where clause from filters
    where = {
      type: "op"
      op: "and"
      exprs: _.pluck(_.where(filters, table: table), "jsonql")
    }

    if filterExpr
      where.exprs.push(exprCompiler.compileExpr(expr: filterExpr, tableAlias: "main"))

    # Compact and inject alias
    where.exprs = _.compact(where.exprs)
    where = injectTableAlias(where, "main")

    # Get bounds
    boundsQuery = {
      type: "query"
      selects: [{ type: "select", expr: { type: "op", op: "::json", exprs: [{ type: "op", op: "ST_AsGeoJSON", exprs: [
        { type: "op", op: "ST_SetSRID", exprs: [{ type: "op", op: "ST_Extent", exprs: [{ type: "op", op: "ST_Transform", exprs: [compiledGeometryExpr, 4326] }] }, 4326 ]}
        ] } ] }, alias: "bounds" }]
      from: { type: "table", table: table, alias: "main" }
      where: where
    }

    dataSource.performQuery boundsQuery, (err, results) =>
      if err
        callback(err)
      else
        if results[0].bounds
          if results[0].bounds.type == "Point"
            bounds = {
              w: results[0].bounds.coordinates[0] - 0.1 # Single point; zoom to 10km bounds
              s: results[0].bounds.coordinates[1] - 0.1
              e: results[0].bounds.coordinates[0] + 0.1
              n: results[0].bounds.coordinates[1] + 0.1
            }            
          else
            bounds = {
              w: results[0].bounds.coordinates[0][0][0] - 0.001 # Add 10 meters to prevent too small box
              s: results[0].bounds.coordinates[0][0][1] - 0.001
              e: results[0].bounds.coordinates[0][2][0] + 0.001
              n: results[0].bounds.coordinates[0][2][1] + 0.001
            }
        else
          # Null if no bounds can be calculated
          bounds = null

        callback(null, bounds)

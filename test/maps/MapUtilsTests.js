_ = require 'lodash'
assert = require('chai').assert

MapUtils = require '../../src/maps/MapUtils'

canonical = require 'canonical-json'
compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "MapUtils", ->
  beforeEach ->
    @basicMap = {
      "baseLayer": "cartodb_positron",
      "layerViews": [],
      "filters": {},
      "bounds": {
        "w": 10.590820312499998,
        "n": 15.241789855961722,
        "e": 41.4404296875,
        "s": -27.33273513685913
      }
    }
  
  describe "canConvertToClusterMap", ->
    it "is false if no marker layers", ->
      @basicMap.layerViews.push({
        id: "4ed3415c-30c1-45fe-8984-dbffb9dd42d1"
        name: "Buffer"
        type: "Buffer"
        opacity: 1,
        design: { 
          table: "entities.water_point" 
          opacity: 0.5
          radius: 1000
          "axes": {
            "geometry": {
              "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "location"
              },
              "xform": null
            }
          },
          color: "#9b9b9b"
          filter: null
        }
        visible: true 
      })

      assert.isFalse MapUtils.canConvertToClusterMap(@basicMap)

    it "is true if marker layers", ->
      @basicMap.layerViews.push({
        id: "4ed3415c-30c1-45fe-8984-dbffb9dd42d1"
        name: "Markers"
        type: "Markers"
        opacity: 1,
        design: { 
          table: "entities.water_point" 
          "axes": {
            "geometry": {
              "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "location"
              },
              "xform": null
            }
          },
          color: "#9b9b9b"
          filter: null
        }
        visible: true 
      })

      assert.isTrue MapUtils.canConvertToClusterMap(@basicMap)

  describe "convertToClusterMap", ->
    it "converts marker layer", ->
      @basicMap.layerViews.push({
        "id": "id1",
        "name": "Water points",
        "desc": "",
        "type": "Markers",
        "visible": true,
        "opacity": 1,
        "design": {
          "axes": {
            "geometry": {
              "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "location"
              }
            },
            "color": {
              "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "drilling_method_other"
              },
              "colorMap": [
                {
                  "value": null,
                  "color": "#d49097"
                },
                {
                  "value": "a pied",
                  "color": "#ba4f5a"
                },
                {
                  "value": "testing other",
                  "color": "#81323a"
                },
                {
                  "value": "A pied",
                  "color": "#3e181c"
                }
              ],
              "drawOrder": [
                null,
                "a pied",
                "testing other",
                "A pied"
              ]
            }
          },
          "color": "#0088FF",
          "filter": null,
          "table": "entities.water_point",
          "symbol": "font-awesome/star"
        }
      })
      
      newDesign = MapUtils.convertToClusterMap(@basicMap)

      compare newDesign.layerViews, [{
        "id": "id1",
        "name": "Water points",
        "desc": "",
        "type": "Cluster",
        "visible": true,
        "opacity": 1,
        "design": {
          "axes": {
            "geometry": {
              "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "location"
              }
            }
          },
          "fillColor": "#0088FF",
          "filter": null,
          "table": "entities.water_point",
        }
      }]

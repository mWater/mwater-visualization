_ = require 'lodash'
assert = require('chai').assert
DashboardUpgrader = require '../src/dashboards/DashboardUpgrader'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected)

describe "DashboardUpgrader", ->
  before ->
    @upgrader = new DashboardUpgrader()

  it "handles simple case", ->
    oldDesign = {
      "items": {
        "item1": {
          "layout": {
            "x": 0,
            "y": 0,
            "w": 8,
            "h": 8
          },
          "widget": {
            "type": "Markdown",
            "design": {
              "markdown": "abc"
            }
          }
        }
      }
    }

    newDesign = @upgrader.upgrade(oldDesign)

    expected = {
      items: {
        "id": "root",
        "type": "root",
        "blocks": [
          {
            "type": "widget",
            "widgetType": "Markdown",
            "design": {
              "markdown": "abc"
            },
            "id": "item1"
          }
        ]
       },
      "layout": "blocks",
      "style": "default"
    }
    compare(newDesign, expected)

  it "sets aspect ratio", ->
    oldDesign = {
      "items": {
        "item1": {
          "layout": {
            "x": 0,
            "y": 0,
            "w": 12,
            "h": 8
          },
          "widget": {
            "type": "Image",
            "design": {
              "imageUrl": "test",
            }
          }
        }
      }
    }

    newDesign = @upgrader.upgrade(oldDesign)

    expected = {
      items: {
        "id": "root",
        "type": "root",
        "blocks": [
          {
            "type": "widget",
            "aspectRatio": 1.5,
            "widgetType": "Image",
            "design": {
              "imageUrl": "test",
            },
            "id": "item1"
          },
        ]
       },
      "layout": "blocks",
      "style": "default"
    }
    compare(newDesign, expected)

  it "puts multiple in horizontal block", ->
    oldDesign = {
      "items": {
        "item1": {
          "layout": { x: 0, y: 0, w: 12, h: 8 },
          "widget": { "type": "Image", "design": { "imageUrl": "test1" } }
        }
        "item2": {
          "layout": { x: 12, y: 0, w: 12, h: 8 },
          "widget": { "type": "Image", "design": { "imageUrl": "test2" } }
        }
        "item3": {
          "layout": { x: 0, y: 1, w: 12, h: 8 },
          "widget": { "type": "Image", "design": { "imageUrl": "test3" } }
        }
      }
    }

    newDesign = @upgrader.upgrade(oldDesign)

    # Remove uuid from horizontal block to compare
    delete newDesign.items.blocks[0].id
    expected = {
      items: {
        "id": "root",
        "type": "root",
        "blocks": [
          {
            type: "horizontal"
            blocks: [
              {
                "type": "widget",
                "aspectRatio": 1.5,
                "widgetType": "Image",
                "design": {
                  "imageUrl": "test1",
                },
                "id": "item1"
              }
              {
                "type": "widget",
                "aspectRatio": 1.5,
                "widgetType": "Image",
                "design": {
                  "imageUrl": "test2",
                },
                "id": "item2"
              }
            ]
          }
          {
            "type": "widget",
            "aspectRatio": 1.5,
            "widgetType": "Image",
            "design": {
              "imageUrl": "test3",
            },
            "id": "item3"
          }
        ]
       },
      "layout": "blocks",
      "style": "default"
    }
    compare(newDesign, expected)



// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from 'lodash';
import { assert } from 'chai';
import DashboardUpgrader from '../src/dashboards/DashboardUpgrader';
import canonical from 'canonical-json';

function compare(actual, expected) {
  return assert.equal(
    canonical(actual),
    canonical(expected),
    "\n" + canonical(actual) + "\n" + canonical(expected)
  );
}

describe("DashboardUpgrader", function() {
  before(function() {
    return this.upgrader = new DashboardUpgrader();
  });

  it("handles simple case", function() {
    const oldDesign = {
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
    };

    const newDesign = this.upgrader.upgrade(oldDesign);

    const expected = {
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
    };
    return compare(newDesign, expected);
  });

  it("sets aspect ratio", function() {
    const oldDesign = {
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
    };

    const newDesign = this.upgrader.upgrade(oldDesign);

    const expected = {
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
    };
    return compare(newDesign, expected);
  });

  return it("puts multiple in horizontal block", function() {
    const oldDesign = {
      "items": {
        "item1": {
          "layout": { x: 0, y: 0, w: 12, h: 8 },
          "widget": { "type": "Image", "design": { "imageUrl": "test1" } }
        },
        "item2": {
          "layout": { x: 12, y: 0, w: 12, h: 8 },
          "widget": { "type": "Image", "design": { "imageUrl": "test2" } }
        },
        "item3": {
          "layout": { x: 0, y: 1, w: 12, h: 8 },
          "widget": { "type": "Image", "design": { "imageUrl": "test3" } }
        }
      }
    };

    const newDesign = this.upgrader.upgrade(oldDesign);

    // Remove uuid from horizontal block to compare
    delete newDesign.items.blocks[0].id;
    const expected = {
      items: {
        "id": "root",
        "type": "root",
        "blocks": [
          {
            type: "horizontal",
            blocks: [
              {
                "type": "widget",
                "aspectRatio": 1.5,
                "widgetType": "Image",
                "design": {
                  "imageUrl": "test1",
                },
                "id": "item1"
              },
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
          },
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
    };
    return compare(newDesign, expected);
  });
});



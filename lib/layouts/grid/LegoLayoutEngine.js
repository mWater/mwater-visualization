"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var LegoLayoutEngine, _;

_ = require('lodash'); // Layout engine that places blocks like lego and displaces others out of the way

module.exports = LegoLayoutEngine =
/*#__PURE__*/
function () {
  function LegoLayoutEngine(width, blocksAcross) {
    (0, _classCallCheck2.default)(this, LegoLayoutEngine);
    this.width = width;
    this.blocksAcross = blocksAcross;
    this.scale = this.width / this.blocksAcross;
  } // Calculate the total height needed to fit all layouts plus one row


  (0, _createClass2.default)(LegoLayoutEngine, [{
    key: "calculateHeight",
    value: function calculateHeight(layouts) {
      var _this = this;

      var bottom;
      bottom = _.max(_.map(layouts, function (l) {
        return _this.getLayoutBounds(l).y + _this.getLayoutBounds(l).height;
      }));
      return bottom + this.scale;
    } // Get the bounds of a layout (x, y, width, height)

  }, {
    key: "getLayoutBounds",
    value: function getLayoutBounds(layout) {
      return {
        x: this.scale * layout.x,
        y: this.scale * layout.y,
        width: this.scale * layout.w,
        height: this.scale * layout.h
      };
    } // Converts a rectangle to a layout

  }, {
    key: "rectToLayout",
    value: function rectToLayout(rect) {
      var h, w, x, y; // Get snapped approximate location

      x = Math.round(rect.x / this.scale);
      y = Math.round(rect.y / this.scale);
      w = Math.round(rect.width / this.scale);
      h = Math.round(rect.height / this.scale); // Clip

      if (x < 0) {
        x = 0;
      }

      if (y < 0) {
        y = 0;
      }

      if (x >= this.blocksAcross) {
        x = this.blocksAcross - 1;
      }

      if (w < 1) {
        w = 1;
      }

      if (x + w > this.blocksAcross) {
        w = this.blocksAcross - x;
      }

      if (h < 1) {
        h = 1;
      }

      return {
        x: x,
        y: y,
        w: w,
        h: h
      };
    } // Arranges a layout, making all blocks fit. Optionally prioritizes
    // a particular item.
    // layouts is lookup of id -> layout
    // priority is optional id to layout first
    // Returns layout lookup of id -> layout

  }, {
    key: "performLayout",
    value: function performLayout(layouts, priority) {
      var _this2 = this;

      var i, id, layout, len, placedLayouts, results, toProcess; // Create list of placed layouts to avoid as placing new ones 

      placedLayouts = [];
      results = {}; // Add priority first to displace others

      if (priority) {
        placedLayouts.push(layouts[priority]);
        results[priority] = layouts[priority];
      } // Order all by reading order (l->r, top->bottom)


      toProcess = _.sortBy(_.keys(layouts), function (id) {
        var l;
        l = layouts[id];
        return l.x + l.y * _this2.blocksAcross;
      }); // Process each layout, avoiding all previous

      for (i = 0, len = toProcess.length; i < len; i++) {
        id = toProcess[i]; // Skip priority one

        if (id === priority) {
          continue;
        } // Check if overlaps


        layout = layouts[id];

        while (_.any(placedLayouts, function (pl) {
          return _this2.overlaps(pl, layout);
        })) {
          // Move around until fits
          layout = this.shiftLayout(layout);
        }

        placedLayouts.push(layout);
        results[id] = layout;
      }

      return results;
    } // Adds a layout with the w and h (width and height in blocks)

  }, {
    key: "appendLayout",
    value: function appendLayout(layouts, w, h) {
      var _this3 = this;

      var layout; // Check if overlaps

      layout = {
        x: 0,
        y: 0,
        w: w,
        h: h
      };

      while (_.any(_.values(layouts), function (pl) {
        return _this3.overlaps(pl, layout);
      })) {
        // Move around until fits
        layout = this.shiftLayout(layout);
      }

      return layout;
    } // Check if layouts overlap

  }, {
    key: "overlaps",
    value: function overlaps(a, b) {
      if (a.x + a.w <= b.x) {
        return false;
      }

      if (a.y + a.h <= b.y) {
        return false;
      }

      if (a.x >= b.x + b.w) {
        return false;
      }

      if (a.y >= b.y + b.h) {
        return false;
      }

      return true;
    } // Shifts layout right or down if no more room

  }, {
    key: "shiftLayout",
    value: function shiftLayout(layout) {
      if (layout.x + layout.w < this.blocksAcross) {
        return {
          x: layout.x + 1,
          y: layout.y,
          w: layout.w,
          h: layout.h
        };
      }

      return {
        x: 0,
        y: layout.y + 1,
        w: layout.w,
        h: layout.h
      };
    }
  }]);
  return LegoLayoutEngine;
}();
var LegoLayoutEngine;

module.exports = LegoLayoutEngine = (function() {
  function LegoLayoutEngine(width, blocksAcross) {
    this.width = width;
    this.blocksAcross = blocksAcross;
    this.scale = this.width / this.blocksAcross;
  }

  LegoLayoutEngine.prototype.getLayoutBounds = function(layout) {
    return {
      x: this.scale * layout.x,
      y: this.scale * layout.y,
      width: this.scale * layout.w,
      height: this.scale * layout.h
    };
  };

  LegoLayoutEngine.prototype.rectToLayout = function(rect) {
    var h, w, x, y;
    x = Math.round(rect.x / this.scale);
    y = Math.round(rect.y / this.scale);
    w = Math.round(rect.width / this.scale);
    h = Math.round(rect.height / this.scale);
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
  };

  LegoLayoutEngine.prototype.performLayout = function(layouts, priority) {
    var i, id, layout, len, placedLayouts, results, toProcess;
    placedLayouts = [];
    results = {};
    if (priority) {
      placedLayouts.push(layouts[priority]);
      results[priority] = layouts[priority];
    }
    toProcess = _.sortBy(_.keys(layouts), (function(_this) {
      return function(id) {
        var l;
        l = layouts[id];
        return l.x + l.y * _this.blocksAcross;
      };
    })(this));
    for (i = 0, len = toProcess.length; i < len; i++) {
      id = toProcess[i];
      if (id === priority) {
        continue;
      }
      layout = layouts[id];
      while (_.any(placedLayouts, (function(_this) {
          return function(pl) {
            return _this.overlaps(pl, layout);
          };
        })(this))) {
        layout = this.shiftLayout(layout);
      }
      placedLayouts.push(layout);
      results[id] = layout;
    }
    return results;
  };

  LegoLayoutEngine.prototype.overlaps = function(a, b) {
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
  };

  LegoLayoutEngine.prototype.shiftLayout = function(layout) {
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
  };

  return LegoLayoutEngine;

})();

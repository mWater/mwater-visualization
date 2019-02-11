"use strict";

// Misc utils for layered charts
// Get possible types for axis of a layer
exports.getAxisTypes = function (design, layer, axis) {
  var layerType; // If categorical

  layerType = layer.type || design.type;

  switch (axis) {
    case "x":
      if (layerType === 'bar') {
        return ['enum', 'enumset', 'text', 'date', 'boolean'];
      } // More broad


      return ['enum', 'text', 'number', 'boolean', 'date'];

    case "color":
      return ['enum', 'text', 'date', 'boolean'];

    case "y":
      return ['number'];
  }
};
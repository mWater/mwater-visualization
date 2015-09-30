exports.getAxisTypes = function(design, layer, axis) {
  var layerType;
  layerType = layer.type || design.type;
  switch (axis) {
    case "x":
      if (layerType === 'bar') {
        return ['enum', 'text', 'integer', 'date', 'boolean'];
      }
      return ['enum', 'text', 'integer', 'decimal', 'boolean', 'date'];
    case "color":
      return ['enum', 'text', 'date'];
    case "y":
      return ['integer', "decimal"];
  }
};

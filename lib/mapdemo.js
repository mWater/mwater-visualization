var AutoSizeComponent, H, LayerFactory, MapDemoComponent, MapDesignerComponent, MapViewComponent, React, Schema, createSchema,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

AutoSizeComponent = require('./AutoSizeComponent');

MapViewComponent = require('./maps/MapViewComponent');

MapDesignerComponent = require('./maps/MapDesignerComponent');

LayerFactory = require('./maps/LayerFactory');

Schema = require('./Schema');

createSchema = function() {
  var schema;
  schema = new Schema();
  schema.addTable({
    id: "a",
    name: "A"
  });
  schema.addColumn("a", {
    id: "y",
    name: "Y",
    type: "text"
  });
  schema.addColumn("a", {
    id: "integer",
    name: "Integer",
    type: "integer"
  });
  schema.addColumn("a", {
    id: "decimal",
    name: "Decimal",
    type: "decimal"
  });
  schema.addColumn("a", {
    id: "enum",
    name: "Enum",
    type: "enum",
    values: [
      {
        id: "apple",
        name: "Apple"
      }, {
        id: "banana",
        name: "Banana"
      }
    ]
  });
  schema.addColumn("a", {
    id: "b",
    name: "A to B",
    type: "join",
    join: {
      fromTable: "a",
      fromColumn: "x",
      toTable: "b",
      toColumn: "q",
      op: "=",
      multiple: true
    }
  });
  schema.addTable({
    id: "b",
    name: "B"
  });
  schema.addColumn("b", {
    id: "r",
    name: "R",
    type: "integer"
  });
  schema.addColumn("b", {
    id: "s",
    name: "S",
    type: "text"
  });
  schema.addTable({
    id: "entities.water_point",
    name: "Water Points"
  });
  schema.addColumn("entities.water_point", {
    id: "type",
    name: "Type",
    type: "enum",
    values: [
      {
        id: "Protected dug well",
        name: "Protected dug well"
      }
    ]
  });
  schema.addColumn("entities.water_point", {
    id: "name",
    name: "Name",
    type: "text"
  });
  schema.addColumn("entities.water_point", {
    id: "desc",
    name: "Description",
    type: "text"
  });
  schema.addNamedExpr("entities.water_point", {
    id: "type",
    name: "Water Point Type",
    expr: {
      type: "field",
      table: "entities.water_point",
      column: "type"
    }
  });
  return schema;
};

$(function() {
  var addLegacyLayerView, design, layerViews, sample, schema;
  schema = createSchema();
  layerViews = [];
  addLegacyLayerView = function(id, name, visible) {
    return layerViews.push({
      id: id,
      name: name,
      visible: visible === true,
      opacity: 1,
      layer: {
        type: "Legacy",
        design: {
          type: id
        }
      }
    });
  };
  addLegacyLayerView("water_points_by_type", "Water Point Type", true);
  addLegacyLayerView("functional_status", "Functionality");
  addLegacyLayerView("ecoli_status", "E.Coli Level");
  addLegacyLayerView("water_access", "Functional Water Access");
  addLegacyLayerView("safe_water_access", "Safe Water Access");
  design = {
    baseLayer: "bing_road",
    layerViews: layerViews,
    filters: {},
    bounds: {
      w: 0,
      n: 0,
      e: 40,
      s: -25
    }
  };
  sample = React.createElement(MapDemoComponent, {
    initialDesign: design,
    schema: schema
  });
  return React.render(sample, document.body);
});

MapDemoComponent = (function(superClass) {
  extend(MapDemoComponent, superClass);

  function MapDemoComponent() {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MapDemoComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      design: this.props.initialDesign
    };
  }

  MapDemoComponent.prototype.handleDesignChange = function(design) {
    return this.setState({
      design: design
    });
  };

  MapDemoComponent.prototype.render = function() {
    var layerFactory;
    layerFactory = new LayerFactory({
      schema: this.props.schema
    });
    return H.div({
      style: {
        height: "100%",
        width: "100%"
      }
    }, H.style(null, ' html, body { height: 100% }'), H.div({
      style: {
        position: "absolute",
        width: "70%",
        height: "100%"
      }
    }, React.createElement(AutoSizeComponent, {
      injectWidth: true,
      injectHeight: true
    }, React.createElement(MapViewComponent, {
      schema: this.props.schema,
      design: this.state.design,
      onDesignChange: this.handleDesignChange,
      layerFactory: layerFactory
    }))), H.div({
      style: {
        position: "absolute",
        left: "70%",
        width: "30%"
      }
    }, React.createElement(MapDesignerComponent, {
      schema: this.props.schema,
      design: this.state.design,
      onDesignChange: this.handleDesignChange,
      layerFactory: layerFactory
    })));
  };

  return MapDemoComponent;

})(React.Component);

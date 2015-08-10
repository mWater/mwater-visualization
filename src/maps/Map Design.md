# Map Design

Maps are stored as a base layer, a series of layers and filters.

```
{
	baseLayer: "bing_road"/"bing_aerial"
	layerViews: [ see layer view below ]
	filters: filter expression indexed by table. e.g. { sometable: logical expression, etc. }
	bounds: bounds as { w:, n:, e:, s: }
}
```

## LayerView

Is a view of a layer including whether visible, opacity. 

```
{
	id: unique id
	name: string name
	desc: string description
	layer: layer contents. see below.
	visible: true/false
	opacity: 0.0-1.0
}
```

## Layer

Information about a layer

```
{
	type: type of the layer. Pass this to layer factory with design
	design: design of the layer. Layer-type specific
}
```


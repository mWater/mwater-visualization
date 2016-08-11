# Map Design

Maps are stored as a base layer, a series of layers and filters.

```
{
	baseLayer: "bing_road"/"bing_aerial"
	layerViews: [ see layer view below ]
	filters: filter expression indexed by table. e.g. { sometable: logical expression, etc. }
	bounds: bounds as { w:, n:, e:, s: }
	attribution: string User defined attribution string, added with other required attributions to the map
}
```

## LayerView

Is a view of a layer including whether visible, opacity. 

```
{
	id: unique id
	name: string name
	desc: string description
	type: type of the layer. Pass this to layer factory with design
	design: design of the layer. Layer-type specific
	visible: true/false
	opacity: 0.0-1.0
	group: optional group. layers in the same group act as radio buttons
}
```

# Map Design

Maps are stored as a base layer, a series of layers and filters.

```
{
	baseLayer: "bing_road"/"bing_aerial"/"cartodb_positron"/"cartodb_dark_matter"/"blank"
	baseLayerOpacity: 0-1 opacity. null/undefined = 1
	layerViews: [ see layer view below ]
	filters: filter expression indexed by table. e.g. { sometable: logical expression, etc. }
	bounds: bounds as { w:, n:, e:, s: }
	attribution: User defined attribution string, added with other required attributions to the map
	autoBounds: true to automatically zoom to bounds of data
	maxZoom: maximum allowed zoom level
	globalFilters: array of global filters. See below.
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
	hideLegend: true to hide legend
}
```

### Global Filters

Global filters apply to multiple tables at once if a certain column is present. User-interface to set them is application-specific
and the default (non-mWater) dashboard applies them but does not allow editing.

Array of:

columnId: id of column to filter
columnType: type of column to filter (to ensure that consistent)
op: op of expression for filtering
exprs: array of expressions to use for filtering. field expression for column will be injected as expression 0 in the resulting filter expression
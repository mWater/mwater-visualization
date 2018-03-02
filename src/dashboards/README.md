## Layout

`DashboardComponent` is the top level dashboard class. It holds the view and designer elements, widget factory and undo stack

It creates a view `DashboardViewComponent` that handles scoping of widgets

## Standard widths (deprecated)

The entire dashboard has a standard width of 1440px. All widgets receive both a width and a standardWidth so they can scale themselves to be size-invariant. Widgets should always look the same at any resolution. This is especially important for text widgets.

### Dashboard design

Each understands enough of the dashboard design to create widgets.

*Widget* refers to the widget itself, where *item* refers also to the layout and id that it has in the dashboard.

Dashboard design is:

`items`: dashboard items. Format depends on layout of dashboard. See layouts/*/README.md

`quickfilters`: array of quick filters (user-selectable filters). See quickfilter/README.md

`layout`: layout engine to use (`blocks` is new default) 
`style`: optional stylesheet to use
`filters`: filter expression indexed by table. e.g. { sometable: logical expression, etc. }
`locale`: optional locale (e.g. "fr") to use for display
`implicitFiltersEnabled`: true to enable implicit filtering (see ImplicitFilterBuilder). Defaults to true for older dashboards.
`globalFilters`: array of global filters. See below.

### Widget scoping

Each widget may have a scope (private data indicating which part is highlighted) and apply filters as a result to other widgets

### Global Filters

Global filters apply to multiple tables at once if a certain column is present. User-interface to set them is application-specific
and the default (non-mWater) dashboard applies them but does not allow editing.

Array of:

columnId: id of column to filter
columnType: type of column to filter (to ensure that consistent)
op: op of expression for filtering
exprs: array of expressions to use for filtering. field expression for column will be injected as expression 0 in the resulting filter expression
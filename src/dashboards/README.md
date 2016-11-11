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

`quickfilters`: array of quick filters (user-selectable filters). Each contains:
 
 `table`: table of filter
 `expr`: filter expression (left hand side only. Usually enum or text)
 `label`: optional label

`layout`: layout engine to use (`blocks` is new default) 
`style`: optional stylesheet to use
`filters`: filter expression indexed by table. e.g. { sometable: logical expression, etc. }
`locale`: optional locale (e.g. "fr") to use for display

### Widget scoping

Each widget may have a scope (private data indicating which part is highlighted) and apply filters as a result to other widgets


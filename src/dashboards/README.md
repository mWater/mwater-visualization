## Layout

`DashboardComponent` is the top level dashboard class. It holds the view and designer elements, widget factory and undo stack

It creates a view `DashboardViewComponent` that handles scoping of widgets

## Standard widths (deprecated)

The entire dashboard has a standard width of 1440px. All widgets receive both a width and a standardWidth so they can scale themselves to be size-invariant. Widgets should always look the same at any resolution. This is especially important for text widgets.

### Dashboard design

See DashboardDesign.ts

### Widget scoping

Each widget may have a scope (private data indicating which part is highlighted) and apply filters as a result to other widgets


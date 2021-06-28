## Layout

`DashboardComponent` is the top level dashboard class. It holds the view and designer elements, widget factory and undo stack

It creates a view `DashboardViewComponent` that handles scoping of widgets

### Dashboard design

See DashboardDesign.ts

### Widget scoping

Each widget may have a scope (private data indicating which part is highlighted) and apply filters as a result to other widgets

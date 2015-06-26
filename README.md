# mwater-visualization

## Expressions

[Expressions](docs/Expressions.md)

## Principles

* In design, things must be valid or null. Design can be incomplete but not invalid
* After any change design is cleaned

## Layout

`Dashboard` is the top level dashboard class. It holds the view and designer elements, widget factory and undo stack

It creates a view `DashboardViewComponent` and sometimes a designer `DashboardViewDesigner`.


### Dashboard design

Each understands enough of the dashboard design to create widgets, which are stored with the following properties:

`id`: unique id of item uuid v4
`layout`: layout-engine specific data for layout of item
`widget`: details of the widget (see below)

*Widget* refers to the widget itself, where *item* refers also to the layout and id that it has in the dashboard.

### Widget data

`widget` contains:

`type`: type string of the widget. Understandable by widget factory
`version`: version of the widget. semver string
`design`: design of the widget as a JSON object

The actual `Widget` is created by the `WidgetFactory`

### Widget scoping

Each widget may have a scope (private data indicating which part is highlighted) and apply filters as a result to other widgets

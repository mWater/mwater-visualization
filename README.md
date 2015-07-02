# mwater-visualization

## Expressions

[Expressions](docs/Expressions.md)

## Principles

* In design, things must be valid or null. Design can be incomplete but not invalid
* After any change design is cleaned before being stored
* Stored design is always cleaned before being edited or displayed

## Layout

`Dashboard` is the top level dashboard class. It holds the view and designer elements, widget factory and undo stack

It creates a view `DashboardViewComponent` and sometimes a designer `DashboardViewDesigner`.


### Dashboard design

Each understands enough of the dashboard design to create widgets.

*Widget* refers to the widget itself, where *item* refers also to the layout and id that it has in the dashboard.

Dashboard design is:

`items`: dashboard items, indexed by id. Each item contains:

`layout`: layout-engine specific data for layout of item
`widget`: details of the widget (see below)


### Widget data

`widget` contains:

`type`: type string of the widget. Understandable by widget factory
`version`: version of the widget. semver string
`design`: design of the widget as a JSON object

The actual `Widget` is created by the `WidgetFactory`

### Widget scoping

Each widget may have a scope (private data indicating which part is highlighted) and apply filters as a result to other widgets

## Component Layout

`Dashboard` is a convenience class which holds a `DashboardViewComponent` and a `DashboardDesignerComponent` (if designing). It holds the state of the design.

`DashboardViewComponent` holds the scoping (clicking on a chart's element filters all others. The element clicked on is the scope and the filters are applied to all other widgets)
It is also responsible for removing widgets and it holds the drag and drop `WidgetContainerComponent`.

The dashboard works with abstract `Widget`s. Widgets have methods to create a viewer and a designer element

For charts, a `ChartWidget` is created which makes a `ChartWidgetComponent` that holds the current query results as state. It also renders the trimmings such as resize handle, remove button and border.

`ChartWidgetComponent` calls its `Chart` class to create the queries and create the display element


## TODO

Decide on responsibility for cleaning designs. A non-clean design cannot be validated, but also should not be stored. Both in and out?
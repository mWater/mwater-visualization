Items is:

`dashboard items, indexed by id. Each item contains:

 `layout`: layout-engine specific data for layout of item
 `widget`: details of the widget (see below)

### Widget data

`widget` contains:

 `type`: type string of the widget. Understandable by widget factory
 `version`: version of the widget. semver string
 `design`: design of the widget as a JSON object
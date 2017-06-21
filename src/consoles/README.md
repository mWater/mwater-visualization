# Consoles

Consoles are a tabbed interface that combines dashboards, maps and datagrids in one place. Each tab can be of a different type.

They are designed to allow for custom tab types.

## design

The design of a console is the following object:

`tabs`: array of { id, name, type, design } where `type` is `dashboard`, `map`, `datagrid`, etc.. `design` is the type-specific design. `name` is the name of the tab. `id` is a v4 guid (uuid())

`popups`: array of { id, name, type, design } where `type` is `dashboard`, `map`, `datagrid`, etc.. `design` is the type-specific design. `name` is the name of the tab. `id` is a v4 guid (uuid())

popups are shared between tabs.

## Types

`map`, `dashboard`, `datagrid`: standard types

`blank`: blank tab that can convert to other types

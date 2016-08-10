# Quickfilters

design is an array of quick filters (user-selectable filters). Each contains:
 
 `table`: table of filter
 `expr`: filter expression (left hand side only. Usually enum or text)
 `label`: optional label

values:

For text and enum, a plain string

For date and datetime, { op: some op, exprs: array of exprs. The date will be added as first expr when compiled }

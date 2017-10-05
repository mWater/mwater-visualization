# Quickfilters

design is an array of quick filters (user-selectable filters). Each contains:
 
 `table`: (deprecated) table of filter
 `expr`: filter expression (left hand side only. Usually enum or text)
 `label`: optional label
 `merged`: true to merge on display with the previous quickfilter. Only applicable if previous one has same type and enum values and id table (if applicable). 

values:

 For text and enum, a plain string

 For date and datetime, { op: some op, exprs: array of exprs. The date will be added as first expr when compiled and `table` will be set }

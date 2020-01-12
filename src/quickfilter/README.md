# Quickfilters

See Quickfilter.d.ts

values are:
  For text and enum and enumset, a plain string, unless multi is true, then array
  For date and datetime, { op: some op, exprs: array of exprs. The date will be added as first expr when compiled and `table` will be set }
  For id[], primary key or array of primary keys if multi

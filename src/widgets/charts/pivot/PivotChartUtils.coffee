_ = require 'lodash'


# Misc utils for working with pivot charts

# Get all paths through a set of segments (e.g. if a contains b, c, then [[a,b], [a,c]])
exports.getSegmentPaths = (segments) ->
  paths = []

  # Use recursive 
  for segment in segments
    if not segment.children or segment.children.length == 0
      paths.push([segment])
    else
      paths = paths.concat(_.map(exports.getSegmentPaths(segment.children), (childPath) -> [segment].concat(childPath)))

  return paths

# Get all paths through a set of segments (e.g. if a contains b, c, then [[a,b], [a,c]])
exports.getAllSegments = (segments) ->
  allSegments = []

  # Use recursive 
  for segment in segments
    allSegments.push(segment)
    if segment.children and segment.children.length > 0
      allSegments = allSegments.concat(exports.getAllSegments(segment.children))

  return allSegments

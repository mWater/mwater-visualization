_ = require 'lodash'
uuid = require 'uuid'

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

exports.findSegment = (segments, id) ->
  return _.findWhere(exports.getAllSegments(segments), { id: id })

# Recursively map segments, flattening and compacting
mapSegments = (segments, mapFunc) ->
  segments = _.map(segments, mapFunc)

  # Map children
  segments = _.map(segments, (segment) ->
    if not segment or not segment.children or segment.children.length == 0
      return segment

    return _.extend({}, segment, { children: mapSegments(segment.children, mapFunc )})
    )

  # Flatten and compact
  return _.compact(_.flatten(segments))

# Replace segment. 
exports.replaceSegment = (segments, replacement) ->
  mapSegments(segments, (segment) ->
    if segment.id == replacement.id
      return replacement
    return segment
    )

# Remove segment
exports.removeSegment = (segments, id) ->
  mapSegments(segments, (segment) ->
    if segment.id == id
      return null
    return segment
    )

# Inserts before
exports.insertBeforeSegment = (segments, id) ->
  mapSegments(segments, (segment) ->
    if segment.id == id
      return [{ id: uuid() }, segment]
    return segment
    )

# Inserts after
exports.insertAfterSegment = (segments, id) ->
  mapSegments(segments, (segment) ->
    if segment.id == id
      return [segment, { id: uuid() }]
    return segment
    )

# Adds child
exports.addChildSegment = (segments, id) ->
  mapSegments(segments, (segment) ->
    if segment.id == id
      return _.extend({}, segment, children: (segment.children or []).concat([{ id: uuid() }]))
    return segment
    )

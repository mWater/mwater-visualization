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

# Gets the id of the intersection of the two paths
exports.getIntersectionId = (rowPath, columnPath) ->
  return "#{_.pluck(rowPath, "id").join(",")}:#{_.pluck(columnPath, "id").join(",")}"  

exports.findSegment = (segments, id) ->
  return _.findWhere(exports.getAllSegments(segments), { id: id })

# Determine if can summarize segment (if segment before has a value axis and has no children)
exports.canSummarizeSegment = (segments, id) ->
  prevSegment = findPreviousSegment(segments, id)
  if prevSegment and prevSegment.valueAxis and not prevSegment.children?[0]
    return true

  return false

# Finds the segment before one with id
findPreviousSegment = (segments, id) ->
  # Find in list (shallow)
  index = _.findIndex(segments, { id: id })

  # False if first
  if index == 0
    return false

  # If found, check previous
  if index > 0
    return segments[index - 1]

  # Find recursively
  for segment in segments
    if segment.children
      prevSegment = findPreviousSegment(segment.children, id)
      if prevSegment
        return prevSegment

  return false

# Summarize a segment, returning a new copy of the design with
# all intersections created.
exports.summarizeSegment = (design, id, label) ->
  design = _.cloneDeep(design)

  # Label segment
  rowSegment = exports.findSegment(design.rows, id)
  columnSegment = exports.findSegment(design.columns, id)
  
  if rowSegment
    rowSegment.label = label
  if columnSegment
    columnSegment.label = label

  if rowSegment
    # Find previous segment
    prevSegment = findPreviousSegment(design.rows, id)

    # Copy all intersections
    for rowPath in exports.getSegmentPaths(design.rows)
      for columnPath in exports.getSegmentPaths(design.columns)
        # Skip if prev segment not part of it
        if prevSegment not in rowPath
          continue

        # Create copy of intersection 
        prevIntersection = design.intersections[exports.getIntersectionId(rowPath, columnPath)]

        summaryIntersection = _.cloneDeep(prevIntersection)

        # Find new row path (since has no children, will be only one)
        summaryRowPath = _.find(exports.getSegmentPaths(design.rows), (path) -> rowSegment in path)
        design.intersections[exports.getIntersectionId(summaryRowPath, columnPath)] = summaryIntersection
  
  if columnSegment
    prevSegment = findPreviousSegment(design.columns, id)

    # Copy all intersections
    for columnPath in exports.getSegmentPaths(design.columns)
      for rowPath in exports.getSegmentPaths(design.rows)
        # Skip if prev segment not part of it
        if prevSegment not in columnPath
          continue

        # Create copy of intersection 
        prevIntersection = design.intersections[exports.getIntersectionId(rowPath, columnPath)]

        summaryIntersection = _.cloneDeep(prevIntersection)

        # Find new column path (since has no children, will be only one)
        summaryColumnPath = _.find(exports.getSegmentPaths(design.columns), (path) -> columnSegment in path)
        design.intersections[exports.getIntersectionId(rowPath, summaryColumnPath)] = summaryIntersection

  return design

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

# Replace segment
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

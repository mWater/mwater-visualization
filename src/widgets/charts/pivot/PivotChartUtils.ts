import _ from "lodash"
import uuid from "uuid"
import { PivotChartDesign, PivotChartSegment } from "./PivotChartDesign"

// Misc utils for working with pivot charts

// Get all paths through a set of segments (e.g. if a contains b, c, then [[a,b], [a,c]])
export function getSegmentPaths(segments: PivotChartSegment[]): PivotChartSegment[][] {
  let paths: PivotChartSegment[][] = []

  // Use recursive
  for (var segment of segments) {
    if (!segment.children || segment.children.length === 0) {
      paths.push([segment])
    } else {
      paths = paths.concat(_.map(getSegmentPaths(segment.children), (childPath) => [segment].concat(childPath)))
    }
  }

  return paths
}

// Get all paths through a set of segments (e.g. if a contains b, c, then [[a,b], [a,c]])
export function getAllSegments(segments: PivotChartSegment[]): PivotChartSegment[] {
  let allSegments: PivotChartSegment[] = []

  // Use recursive
  for (let segment of segments) {
    allSegments.push(segment)
    if (segment.children && segment.children.length > 0) {
      allSegments = allSegments.concat(getAllSegments(segment.children))
    }
  }

  return allSegments
}

// Gets the id of the intersection of the two paths
export function getIntersectionId(rowPath: any, columnPath: any) {
  return `${_.pluck(rowPath, "id").join(",")}:${_.pluck(columnPath, "id").join(",")}`
}

export function findSegment(segments: PivotChartSegment[], id: any): PivotChartSegment | null | undefined {
  return _.findWhere(getAllSegments(segments), { id })
}

// Determine if can summarize segment (if segment before has a value axis and has no children)
export function canSummarizeSegment(segments: any, id: any) {
  const prevSegment = findPreviousSegment(segments, id)
  if (prevSegment && prevSegment.valueAxis && !prevSegment.children?.[0]) {
    return true
  }

  return false
}

// Finds the segment before one with id
function findPreviousSegment(segments: PivotChartSegment[], id: any): PivotChartSegment | null {
  // Find in list (shallow)
  const index = _.findIndex(segments, { id })

  // Null if first
  if (index === 0) {
    return null
  }

  // If found, check previous
  if (index > 0) {
    return segments[index - 1]
  }

  // Find recursively
  for (let segment of segments) {
    if (segment.children) {
      const prevSegment = findPreviousSegment(segment.children, id)
      if (prevSegment) {
        return prevSegment
      }
    }
  }

  return null
}

// Summarize a segment, returning a new copy of the design with
// all intersections created.
export function summarizeSegment(design: PivotChartDesign, id: any, label: any) {
  let columnPath, prevIntersection, prevSegment, rowPath, summaryIntersection
  design = _.cloneDeep(design)

  // Label segment
  const rowSegment = findSegment(design.rows, id)
  const columnSegment = findSegment(design.columns, id)

  if (rowSegment) {
    rowSegment.label = label
  }
  if (columnSegment) {
    columnSegment.label = label
  }

  if (rowSegment) {
    // Find previous segment
    prevSegment = findPreviousSegment(design.rows, id)

    // Copy all intersections
    for (rowPath of getSegmentPaths(design.rows)) {
      for (columnPath of getSegmentPaths(design.columns)) {
        // Skip if prev segment not part of it
        if (!prevSegment || !rowPath.includes(prevSegment)) {
          continue
        }

        // Create copy of intersection
        prevIntersection = design.intersections[getIntersectionId(rowPath, columnPath)]

        summaryIntersection = _.cloneDeep(prevIntersection)

        // Find new row path (since has no children, will be only one)
        const summaryRowPath = _.find(getSegmentPaths(design.rows), (path) => path.includes(rowSegment))
        design.intersections[getIntersectionId(summaryRowPath, columnPath)] = summaryIntersection
      }
    }
  }

  if (columnSegment) {
    prevSegment = findPreviousSegment(design.columns, id)

    // Copy all intersections
    for (columnPath of getSegmentPaths(design.columns)) {
      for (rowPath of getSegmentPaths(design.rows)) {
        // Skip if prev segment not part of it
        if (!prevSegment || !columnPath.includes(prevSegment)) {
          continue
        }

        // Create copy of intersection
        prevIntersection = design.intersections[getIntersectionId(rowPath, columnPath)]

        summaryIntersection = _.cloneDeep(prevIntersection)

        // Find new column path (since has no children, will be only one)
        const summaryColumnPath = _.find(getSegmentPaths(design.columns), (path) =>
          path.includes(columnSegment)
        )
        design.intersections[getIntersectionId(rowPath, summaryColumnPath)] = summaryIntersection
      }
    }
  }

  return design
}

// Recursively map segments, flattening and compacting
function mapSegments(segments: PivotChartSegment[], mapFunc: (segment: PivotChartSegment) => PivotChartSegment | null): PivotChartSegment[] {
  let segments2 = _.map(segments, mapFunc)

  // Map children
  segments2 = _.map(segments2, function (segment) {
    if (!segment || !segment.children || segment.children.length === 0) {
      return segment
    }

    return { ...segment, children: mapSegments(segment.children, mapFunc) }
  })

  // Flatten and compact
  return _.compact(_.flatten(segments2)) as PivotChartSegment[]
}

// Replace segment
export function replaceSegment(segments: any, replacement: any) {
  return mapSegments(segments, function (segment: any) {
    if (segment.id === replacement.id) {
      return replacement
    }
    return segment
  })
}

// Remove segment
export function removeSegment(segments: any, id: any) {
  return mapSegments(segments, function (segment: any) {
    if (segment.id === id) {
      return null
    }
    return segment
  })
}

// Inserts before
export function insertBeforeSegment(segments: any, id: any) {
  return mapSegments(segments, function (segment: any) {
    if (segment.id === id) {
      return [{ id: uuid() }, segment]
    }
    return segment
  })
}

// Inserts after
export function insertAfterSegment(segments: any, id: any): PivotChartSegment[] {
  return mapSegments(segments, function (segment: any) {
    if (segment.id === id) {
      return [segment, { id: uuid() }]
    }
    return segment
  })
}

// Adds child
export function addChildSegment(segments: any, id: any): PivotChartSegment[] {
  return mapSegments(segments, function (segment: any) {
    if (segment.id === id) {
      return _.extend({}, segment, { children: (segment.children || []).concat([{ id: uuid() }]) })
    }
    return segment
  })
}

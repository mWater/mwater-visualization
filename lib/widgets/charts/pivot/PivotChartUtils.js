"use strict";

var _,
    _findPreviousSegment,
    _mapSegments,
    uuid,
    indexOf = [].indexOf;

_ = require('lodash');
uuid = require('uuid'); // Misc utils for working with pivot charts
// Get all paths through a set of segments (e.g. if a contains b, c, then [[a,b], [a,c]])

exports.getSegmentPaths = function (segments) {
  var i, len, paths, segment;
  paths = []; // Use recursive 

  for (i = 0, len = segments.length; i < len; i++) {
    segment = segments[i];

    if (!segment.children || segment.children.length === 0) {
      paths.push([segment]);
    } else {
      paths = paths.concat(_.map(exports.getSegmentPaths(segment.children), function (childPath) {
        return [segment].concat(childPath);
      }));
    }
  }

  return paths;
}; // Get all paths through a set of segments (e.g. if a contains b, c, then [[a,b], [a,c]])


exports.getAllSegments = function (segments) {
  var allSegments, i, len, segment;
  allSegments = []; // Use recursive 

  for (i = 0, len = segments.length; i < len; i++) {
    segment = segments[i];
    allSegments.push(segment);

    if (segment.children && segment.children.length > 0) {
      allSegments = allSegments.concat(exports.getAllSegments(segment.children));
    }
  }

  return allSegments;
}; // Gets the id of the intersection of the two paths


exports.getIntersectionId = function (rowPath, columnPath) {
  return "".concat(_.pluck(rowPath, "id").join(","), ":").concat(_.pluck(columnPath, "id").join(","));
};

exports.findSegment = function (segments, id) {
  return _.findWhere(exports.getAllSegments(segments), {
    id: id
  });
}; // Determine if can summarize segment (if segment before has a value axis and has no children)


exports.canSummarizeSegment = function (segments, id) {
  var prevSegment, ref;
  prevSegment = _findPreviousSegment(segments, id);

  if (prevSegment && prevSegment.valueAxis && !((ref = prevSegment.children) != null ? ref[0] : void 0)) {
    return true;
  }

  return false;
}; // Finds the segment before one with id


_findPreviousSegment = function findPreviousSegment(segments, id) {
  var i, index, len, prevSegment, segment; // Find in list (shallow)

  index = _.findIndex(segments, {
    id: id
  }); // False if first

  if (index === 0) {
    return false;
  } // If found, check previous


  if (index > 0) {
    return segments[index - 1];
  } // Find recursively


  for (i = 0, len = segments.length; i < len; i++) {
    segment = segments[i];

    if (segment.children) {
      prevSegment = _findPreviousSegment(segment.children, id);

      if (prevSegment) {
        return prevSegment;
      }
    }
  }

  return false;
}; // Summarize a segment, returning a new copy of the design with
// all intersections created.


exports.summarizeSegment = function (design, id, label) {
  var columnPath, columnSegment, i, j, k, l, len, len1, len2, len3, prevIntersection, prevSegment, ref, ref1, ref2, ref3, rowPath, rowSegment, summaryColumnPath, summaryIntersection, summaryRowPath;
  design = _.cloneDeep(design); // Label segment

  rowSegment = exports.findSegment(design.rows, id);
  columnSegment = exports.findSegment(design.columns, id);

  if (rowSegment) {
    rowSegment.label = label;
  }

  if (columnSegment) {
    columnSegment.label = label;
  }

  if (rowSegment) {
    // Find previous segment
    prevSegment = _findPreviousSegment(design.rows, id);
    ref = exports.getSegmentPaths(design.rows); // Copy all intersections

    for (i = 0, len = ref.length; i < len; i++) {
      rowPath = ref[i];
      ref1 = exports.getSegmentPaths(design.columns);

      for (j = 0, len1 = ref1.length; j < len1; j++) {
        columnPath = ref1[j]; // Skip if prev segment not part of it

        if (indexOf.call(rowPath, prevSegment) < 0) {
          continue;
        } // Create copy of intersection 


        prevIntersection = design.intersections[exports.getIntersectionId(rowPath, columnPath)];
        summaryIntersection = _.cloneDeep(prevIntersection); // Find new row path (since has no children, will be only one)

        summaryRowPath = _.find(exports.getSegmentPaths(design.rows), function (path) {
          return indexOf.call(path, rowSegment) >= 0;
        });
        design.intersections[exports.getIntersectionId(summaryRowPath, columnPath)] = summaryIntersection;
      }
    }
  }

  if (columnSegment) {
    prevSegment = _findPreviousSegment(design.columns, id);
    ref2 = exports.getSegmentPaths(design.columns); // Copy all intersections

    for (k = 0, len2 = ref2.length; k < len2; k++) {
      columnPath = ref2[k];
      ref3 = exports.getSegmentPaths(design.rows);

      for (l = 0, len3 = ref3.length; l < len3; l++) {
        rowPath = ref3[l]; // Skip if prev segment not part of it

        if (indexOf.call(columnPath, prevSegment) < 0) {
          continue;
        } // Create copy of intersection 


        prevIntersection = design.intersections[exports.getIntersectionId(rowPath, columnPath)];
        summaryIntersection = _.cloneDeep(prevIntersection); // Find new column path (since has no children, will be only one)

        summaryColumnPath = _.find(exports.getSegmentPaths(design.columns), function (path) {
          return indexOf.call(path, columnSegment) >= 0;
        });
        design.intersections[exports.getIntersectionId(rowPath, summaryColumnPath)] = summaryIntersection;
      }
    }
  }

  return design;
}; // Recursively map segments, flattening and compacting


_mapSegments = function mapSegments(segments, mapFunc) {
  segments = _.map(segments, mapFunc); // Map children

  segments = _.map(segments, function (segment) {
    if (!segment || !segment.children || segment.children.length === 0) {
      return segment;
    }

    return _.extend({}, segment, {
      children: _mapSegments(segment.children, mapFunc)
    });
  }); // Flatten and compact

  return _.compact(_.flatten(segments));
}; // Replace segment


exports.replaceSegment = function (segments, replacement) {
  return _mapSegments(segments, function (segment) {
    if (segment.id === replacement.id) {
      return replacement;
    }

    return segment;
  });
}; // Remove segment


exports.removeSegment = function (segments, id) {
  return _mapSegments(segments, function (segment) {
    if (segment.id === id) {
      return null;
    }

    return segment;
  });
}; // Inserts before


exports.insertBeforeSegment = function (segments, id) {
  return _mapSegments(segments, function (segment) {
    if (segment.id === id) {
      return [{
        id: uuid()
      }, segment];
    }

    return segment;
  });
}; // Inserts after


exports.insertAfterSegment = function (segments, id) {
  return _mapSegments(segments, function (segment) {
    if (segment.id === id) {
      return [segment, {
        id: uuid()
      }];
    }

    return segment;
  });
}; // Adds child


exports.addChildSegment = function (segments, id) {
  return _mapSegments(segments, function (segment) {
    if (segment.id === id) {
      return _.extend({}, segment, {
        children: (segment.children || []).concat([{
          id: uuid()
        }])
      });
    }

    return segment;
  });
};
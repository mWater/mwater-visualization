var _, findPreviousSegment, mapSegments, uuid,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

uuid = require('uuid');

exports.getSegmentPaths = function(segments) {
  var i, len, paths, segment;
  paths = [];
  for (i = 0, len = segments.length; i < len; i++) {
    segment = segments[i];
    if (!segment.children || segment.children.length === 0) {
      paths.push([segment]);
    } else {
      paths = paths.concat(_.map(exports.getSegmentPaths(segment.children), function(childPath) {
        return [segment].concat(childPath);
      }));
    }
  }
  return paths;
};

exports.getAllSegments = function(segments) {
  var allSegments, i, len, segment;
  allSegments = [];
  for (i = 0, len = segments.length; i < len; i++) {
    segment = segments[i];
    allSegments.push(segment);
    if (segment.children && segment.children.length > 0) {
      allSegments = allSegments.concat(exports.getAllSegments(segment.children));
    }
  }
  return allSegments;
};

exports.getIntersectionId = function(rowPath, columnPath) {
  return (_.pluck(rowPath, "id").join(",")) + ":" + (_.pluck(columnPath, "id").join(","));
};

exports.findSegment = function(segments, id) {
  return _.findWhere(exports.getAllSegments(segments), {
    id: id
  });
};

exports.canSummarizeSegment = function(segments, id) {
  var prevSegment, ref;
  prevSegment = findPreviousSegment(segments, id);
  if (prevSegment && prevSegment.valueAxis && !((ref = prevSegment.children) != null ? ref[0] : void 0)) {
    return true;
  }
  return false;
};

findPreviousSegment = function(segments, id) {
  var i, index, len, prevSegment, segment;
  index = _.findIndex(segments, {
    id: id
  });
  if (index === 0) {
    return false;
  }
  if (index > 0) {
    return segments[index - 1];
  }
  for (i = 0, len = segments.length; i < len; i++) {
    segment = segments[i];
    if (segment.children) {
      prevSegment = findPreviousSegment(segment.children, id);
      if (prevSegment) {
        return prevSegment;
      }
    }
  }
  return false;
};

exports.summarizeSegment = function(design, id, label) {
  var columnPath, columnSegment, i, j, k, l, len, len1, len2, len3, prevIntersection, prevSegment, ref, ref1, ref2, ref3, rowPath, rowSegment, summaryColumnPath, summaryIntersection, summaryRowPath;
  design = _.cloneDeep(design);
  rowSegment = exports.findSegment(design.rows, id);
  columnSegment = exports.findSegment(design.columns, id);
  if (rowSegment) {
    rowSegment.label = label;
  }
  if (columnSegment) {
    columnSegment.label = label;
  }
  if (rowSegment) {
    prevSegment = findPreviousSegment(design.rows, id);
    ref = exports.getSegmentPaths(design.rows);
    for (i = 0, len = ref.length; i < len; i++) {
      rowPath = ref[i];
      ref1 = exports.getSegmentPaths(design.columns);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        columnPath = ref1[j];
        if (indexOf.call(rowPath, prevSegment) < 0) {
          continue;
        }
        prevIntersection = design.intersections[exports.getIntersectionId(rowPath, columnPath)];
        summaryIntersection = _.cloneDeep(prevIntersection);
        summaryRowPath = _.find(exports.getSegmentPaths(design.rows), function(path) {
          return indexOf.call(path, rowSegment) >= 0;
        });
        design.intersections[exports.getIntersectionId(summaryRowPath, columnPath)] = summaryIntersection;
      }
    }
  }
  if (columnSegment) {
    prevSegment = findPreviousSegment(design.columns, id);
    ref2 = exports.getSegmentPaths(design.columns);
    for (k = 0, len2 = ref2.length; k < len2; k++) {
      columnPath = ref2[k];
      ref3 = exports.getSegmentPaths(design.rows);
      for (l = 0, len3 = ref3.length; l < len3; l++) {
        rowPath = ref3[l];
        if (indexOf.call(columnPath, prevSegment) < 0) {
          continue;
        }
        prevIntersection = design.intersections[exports.getIntersectionId(rowPath, columnPath)];
        summaryIntersection = _.cloneDeep(prevIntersection);
        summaryColumnPath = _.find(exports.getSegmentPaths(design.columns), function(path) {
          return indexOf.call(path, columnSegment) >= 0;
        });
        design.intersections[exports.getIntersectionId(rowPath, summaryColumnPath)] = summaryIntersection;
      }
    }
  }
  return design;
};

mapSegments = function(segments, mapFunc) {
  segments = _.map(segments, mapFunc);
  segments = _.map(segments, function(segment) {
    if (!segment || !segment.children || segment.children.length === 0) {
      return segment;
    }
    return _.extend({}, segment, {
      children: mapSegments(segment.children, mapFunc)
    });
  });
  return _.compact(_.flatten(segments));
};

exports.replaceSegment = function(segments, replacement) {
  return mapSegments(segments, function(segment) {
    if (segment.id === replacement.id) {
      return replacement;
    }
    return segment;
  });
};

exports.removeSegment = function(segments, id) {
  return mapSegments(segments, function(segment) {
    if (segment.id === id) {
      return null;
    }
    return segment;
  });
};

exports.insertBeforeSegment = function(segments, id) {
  return mapSegments(segments, function(segment) {
    if (segment.id === id) {
      return [
        {
          id: uuid()
        }, segment
      ];
    }
    return segment;
  });
};

exports.insertAfterSegment = function(segments, id) {
  return mapSegments(segments, function(segment) {
    if (segment.id === id) {
      return [
        segment, {
          id: uuid()
        }
      ];
    }
    return segment;
  });
};

exports.addChildSegment = function(segments, id) {
  return mapSegments(segments, function(segment) {
    if (segment.id === id) {
      return _.extend({}, segment, {
        children: (segment.children || []).concat([
          {
            id: uuid()
          }
        ])
      });
    }
    return segment;
  });
};

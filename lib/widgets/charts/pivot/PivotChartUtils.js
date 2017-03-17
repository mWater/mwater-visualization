var _, mapSegments, uuid;

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

exports.findSegment = function(segments, id) {
  return _.findWhere(exports.getAllSegments(segments), {
    id: id
  });
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

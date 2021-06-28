"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addChildSegment = exports.insertAfterSegment = exports.insertBeforeSegment = exports.removeSegment = exports.replaceSegment = exports.summarizeSegment = exports.canSummarizeSegment = exports.findSegment = exports.getIntersectionId = exports.getAllSegments = exports.getSegmentPaths = void 0;
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const lodash_1 = __importDefault(require("lodash"));
const uuid_1 = __importDefault(require("uuid"));
// Misc utils for working with pivot charts
// Get all paths through a set of segments (e.g. if a contains b, c, then [[a,b], [a,c]])
function getSegmentPaths(segments) {
    let paths = [];
    // Use recursive
    for (var segment of segments) {
        if (!segment.children || segment.children.length === 0) {
            paths.push([segment]);
        }
        else {
            paths = paths.concat(lodash_1.default.map(exports.getSegmentPaths(segment.children), (childPath) => [segment].concat(childPath)));
        }
    }
    return paths;
}
exports.getSegmentPaths = getSegmentPaths;
// Get all paths through a set of segments (e.g. if a contains b, c, then [[a,b], [a,c]])
function getAllSegments(segments) {
    let allSegments = [];
    // Use recursive
    for (let segment of segments) {
        allSegments.push(segment);
        if (segment.children && segment.children.length > 0) {
            allSegments = allSegments.concat(exports.getAllSegments(segment.children));
        }
    }
    return allSegments;
}
exports.getAllSegments = getAllSegments;
// Gets the id of the intersection of the two paths
function getIntersectionId(rowPath, columnPath) {
    return `${lodash_1.default.pluck(rowPath, "id").join(",")}:${lodash_1.default.pluck(columnPath, "id").join(",")}`;
}
exports.getIntersectionId = getIntersectionId;
function findSegment(segments, id) {
    return lodash_1.default.findWhere(exports.getAllSegments(segments), { id });
}
exports.findSegment = findSegment;
// Determine if can summarize segment (if segment before has a value axis and has no children)
function canSummarizeSegment(segments, id) {
    var _a;
    const prevSegment = findPreviousSegment(segments, id);
    if (prevSegment && prevSegment.valueAxis && !((_a = prevSegment.children) === null || _a === void 0 ? void 0 : _a[0])) {
        return true;
    }
    return false;
}
exports.canSummarizeSegment = canSummarizeSegment;
// Finds the segment before one with id
function findPreviousSegment(segments, id) {
    // Find in list (shallow)
    const index = lodash_1.default.findIndex(segments, { id });
    // False if first
    if (index === 0) {
        return false;
    }
    // If found, check previous
    if (index > 0) {
        return segments[index - 1];
    }
    // Find recursively
    for (let segment of segments) {
        if (segment.children) {
            const prevSegment = findPreviousSegment(segment.children, id);
            if (prevSegment) {
                return prevSegment;
            }
        }
    }
    return false;
}
// Summarize a segment, returning a new copy of the design with
// all intersections created.
function summarizeSegment(design, id, label) {
    let columnPath, prevIntersection, prevSegment, rowPath, summaryIntersection;
    design = lodash_1.default.cloneDeep(design);
    // Label segment
    const rowSegment = exports.findSegment(design.rows, id);
    const columnSegment = exports.findSegment(design.columns, id);
    if (rowSegment) {
        rowSegment.label = label;
    }
    if (columnSegment) {
        columnSegment.label = label;
    }
    if (rowSegment) {
        // Find previous segment
        prevSegment = findPreviousSegment(design.rows, id);
        // Copy all intersections
        for (rowPath of exports.getSegmentPaths(design.rows)) {
            for (columnPath of exports.getSegmentPaths(design.columns)) {
                // Skip if prev segment not part of it
                if (!rowPath.includes(prevSegment)) {
                    continue;
                }
                // Create copy of intersection
                prevIntersection = design.intersections[exports.getIntersectionId(rowPath, columnPath)];
                summaryIntersection = lodash_1.default.cloneDeep(prevIntersection);
                // Find new row path (since has no children, will be only one)
                const summaryRowPath = lodash_1.default.find(exports.getSegmentPaths(design.rows), (path) => path.includes(rowSegment));
                design.intersections[exports.getIntersectionId(summaryRowPath, columnPath)] = summaryIntersection;
            }
        }
    }
    if (columnSegment) {
        prevSegment = findPreviousSegment(design.columns, id);
        // Copy all intersections
        for (columnPath of exports.getSegmentPaths(design.columns)) {
            for (rowPath of exports.getSegmentPaths(design.rows)) {
                // Skip if prev segment not part of it
                if (!columnPath.includes(prevSegment)) {
                    continue;
                }
                // Create copy of intersection
                prevIntersection = design.intersections[exports.getIntersectionId(rowPath, columnPath)];
                summaryIntersection = lodash_1.default.cloneDeep(prevIntersection);
                // Find new column path (since has no children, will be only one)
                const summaryColumnPath = lodash_1.default.find(exports.getSegmentPaths(design.columns), (path) => path.includes(columnSegment));
                design.intersections[exports.getIntersectionId(rowPath, summaryColumnPath)] = summaryIntersection;
            }
        }
    }
    return design;
}
exports.summarizeSegment = summarizeSegment;
// Recursively map segments, flattening and compacting
function mapSegments(segments, mapFunc) {
    segments = lodash_1.default.map(segments, mapFunc);
    // Map children
    segments = lodash_1.default.map(segments, function (segment) {
        if (!segment || !segment.children || segment.children.length === 0) {
            return segment;
        }
        return lodash_1.default.extend({}, segment, { children: mapSegments(segment.children, mapFunc) });
    });
    // Flatten and compact
    return lodash_1.default.compact(lodash_1.default.flatten(segments));
}
// Replace segment
function replaceSegment(segments, replacement) {
    return mapSegments(segments, function (segment) {
        if (segment.id === replacement.id) {
            return replacement;
        }
        return segment;
    });
}
exports.replaceSegment = replaceSegment;
// Remove segment
function removeSegment(segments, id) {
    return mapSegments(segments, function (segment) {
        if (segment.id === id) {
            return null;
        }
        return segment;
    });
}
exports.removeSegment = removeSegment;
// Inserts before
function insertBeforeSegment(segments, id) {
    return mapSegments(segments, function (segment) {
        if (segment.id === id) {
            return [{ id: uuid_1.default() }, segment];
        }
        return segment;
    });
}
exports.insertBeforeSegment = insertBeforeSegment;
// Inserts after
function insertAfterSegment(segments, id) {
    return mapSegments(segments, function (segment) {
        if (segment.id === id) {
            return [segment, { id: uuid_1.default() }];
        }
        return segment;
    });
}
exports.insertAfterSegment = insertAfterSegment;
// Adds child
function addChildSegment(segments, id) {
    return mapSegments(segments, function (segment) {
        if (segment.id === id) {
            return lodash_1.default.extend({}, segment, { children: (segment.children || []).concat([{ id: uuid_1.default() }]) });
        }
        return segment;
    });
}
exports.addChildSegment = addChildSegment;

var H, LargeListComponent, React;

React = require('react');

H = React.DOM;

LargeListComponent = require('./LargeListComponent');

$(function() {
  var sample;
  sample = React.createElement(LargeListComponent, {
    loadRows: (function(_this) {
      return function(start, number, cb) {
        return setTimeout(function() {
          return cb(null, _.range(start, start + number));
        }, 200);
      };
    })(this),
    renderRow: function(row, index) {
      return H.div({
        style: {
          height: 25
        },
        key: index + ""
      }, "" + row);
    },
    rowHeight: 25,
    pageSize: 100,
    height: 500,
    rowCount: 10000,
    bufferSize: 100
  });
  return React.render(sample, document.body);
});

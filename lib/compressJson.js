var pako;

pako = require('pako');


/*
Gzips and base64 encodes JSON object if larger than 100 bytes
 */

module.exports = function(json) {
  var str;
  str = JSON.stringify(json);
  if (str.length > 100) {
    return btoa(pako.deflate(str, {
      to: "string"
    }));
  } else {
    return str;
  }
};

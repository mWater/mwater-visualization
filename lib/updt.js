var setter, updt;

setter = require("immutable-setter");

updt = function(callback, object, keyPath, value) {
  var numArgs, result, updater;
  numArgs = arguments.length;
  if (typeof callback !== "function") {
    value = keyPath;
    keyPath = object;
    object = callback;
    callback = null;
    numArgs += 1;
  }
  if (!Array.isArray(keyPath)) {
    keyPath = [keyPath];
  }
  updater = function(val) {
    return setter.setIn(object, keyPath, val);
  };
  if (numArgs === 4) {
    result = updater(value);
    if (callback) {
      callback(result);
      return;
    } else {
      return result;
    }
  }
  return function(val) {
    result = updater(val);
    if (callback) {
      callback(result);
    } else {
      return result;
    }
  };
};

module.exports = updt;

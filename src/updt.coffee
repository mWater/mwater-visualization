# Updater for creating deep, immutable update function

setter = require("immutable-setter")

updt = (callback, object, keyPath, value) ->
  numArgs = arguments.length

  # Adjust parameters if callback not present
  if typeof(callback) != "function"
    value = keyPath
    keyPath = object
    object = callback
    callback = null
    numArgs += 1

  # Make keyPath array
  if not Array.isArray(keyPath)
    keyPath = [keyPath]

  # Create update function
  updater = (val) -> setter.setIn(object, keyPath, val)

  # Run if value present
  if numArgs == 4
    result = updater(value)
    if callback
      callback(result)
      return
    else
      return result

  # Return function that takes value
  return (val) ->
    result = updater(val)
    if callback
      callback(result)
      return
    else
      return result

# TODO Deleteupdt.

module.exports = updt
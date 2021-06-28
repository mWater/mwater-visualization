// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import pako from "pako"

/*
Gzips and base64 encodes JSON object if larger than 100 bytes
*/
export default function (json) {
  const str = JSON.stringify(json)
  if (str && str.length > 100) {
    return btoa(pako.deflate(str, { to: "string" }))
  } else {
    return str
  }
}

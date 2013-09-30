import { a_indexOf, a_filter } from "oasis/shims";

export function copy(a) {
  var b = {};
  for (var prop in a) {
    if (!a.hasOwnProperty(prop)) { continue; }

    b[prop] = a[prop];
  }
  return b;
}

export function setDiff(a, b) {
  return a_filter.call(a, function (item) {
    var inB = a_indexOf.call(b, item);
    return !inB;
  });
}

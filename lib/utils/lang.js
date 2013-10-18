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
  var differences  = [];

  for(var prop in a) {
    if( a[prop] !== b[prop] ) {
      differences.push( prop );
    }
  }

  return differences;
}

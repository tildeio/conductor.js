export function error(exception) {
  if (typeof console === 'object' && console.assert && console.error) {
    // chrome does not (yet) link the URLs in `console.assert`
    console.error(exception.stack);
    console.assert(false, exception.message);
  }
  setTimeout( function () {
    throw exception;
  }, 1);
  throw exception;
}

export function warn() {
  if (console.warn) {
    return console.warn.apply(this, arguments);
  }
}

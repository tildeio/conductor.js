import RSVP from "rsvp";

RSVP.configure('onerror', function (error) {
  if (typeof console !== 'undefined' && console.assert) {
    console.assert(false, error);
  }
  /* jshint debug:true */
  debugger;
});


// // Uncomment to disable async.  Note that this will cause some false positives,
// // but can be helpful in debugging.
// RSVP.configure('async', function (callback, arg) {
//   callback(arg);
// });

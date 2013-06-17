### 0.2.0

- added support for IE10, IE9, Firefox, Safari.
- rsvp upgraded to 2.0.0.
- oasis upgraded.

##### Breaking Changes

- cards are no longer promise entities, but they have a promise property that
  is resolved on sandbox readiness.  `card.then` → `card.promise.then`.
- iframe sandboxes are now started on `appendTo` and not on `load`.  This means
  nested sandboxes are not started until the first `render`.
- `initializeDOM` is now required to call `appendTo` for child cards to be
  started.  The base implementation does this for all child cards, appending
  them to `document.body`.
- `oasisURL` must now refer to the polyglot file `conductor.js-0.1.0.js.html`.
  This file does not need to end in `html` but it does need to be served with an
  html content type.

### 0.1.0 / 15 June 2013

Initial version.

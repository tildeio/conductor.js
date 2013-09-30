### next

- Can add new default capabilities to a `conductor` instance via
  `conductor.addDefaultCapability`.
- Can specify adapter to use for cards.  Currently there are two conductor
  adapters: `iframe` and `inline`.  Default is `iframe`.
  ```js
    // load a card using the inline adapter.
    conductor.load(cardUrl, cardId, { adapter: Conductor.adapters.inline, /*...*/ });
  ```
- Can add unsupported capabilities to adapters.  For example, if one has a
  capability that cannot work with the inline adapter, one can
  `Conductor.adapters.inline.addUnsupportedCapability("capability")`.

### 0.3.0

- `conductor.configure` replaces `Conductor.configure`
- Oasis.js 0.3.0

### 0.2.0

- `Conductor.configure('eventCallback', function (eventHandler) {})` to configure
  a wrapper around message event handlers.
- cards may defer their activation by returning a promise from `activate`.
- custom services will have `error` invoked if the environment did not provide
  the capability.  For example:
```js
  // environment
  var conductor = new Conductor(),
  // both services exist
  conductor.services.fulfilledCapability = Conductor.Oasis.Service;
  conductor.services.unfulfilledCapability = Conductor.Oasis.Service;
  // but only one capability is provided to the card
  conductor.load("unfulfilled_capability_card.js", 1, { capabilities: ['fulfilledCapability']});

  // sandbox
  var card = Conductor.card({
    consumers: {
      fulfilledCapability: Conductor.Oasis.Consumer.extend({
        error: function () {
          // not invoked
        }
      }),
      unfulfilledCapability: Conductor.Oasis.Consumer.extend({
        error: function () {
          // invoked
        }
      })
    }
  });
```
- added partial support for IE8.  `postMessage` is too slow for large messages
  (eg transferring jQuery using xhr service) for IE8 to be considered fully
  supported.
- added support for IE10, IE9, Firefox, Safari.
- rsvp upgraded to 2.0.0.
- oasis upgraded.

##### Breaking Changes

- Request handlers are no longer passed a resolver.  Instead they may return
  values directly or return promises if the values need to be retrieved
  asynchronously.  Returned promises may reject, which will cause promise
  rejection to the corresponding service or consumer.
- Card References are no longer promise entities.  Instead, `card.waitForLoad()`
  returns a promise that is resolved when the card is loaded. `card.then` →
  `card.waitForLoad().then`
- Similarly, cards have a `waitForActivation` function instead of a promise
  property.
- iframe sandboxes are now started on `appendTo` and not on `load`.  This means
  nested sandboxes are not started until the first `render`.
- `initializeDOM` is now required to call `appendTo` for child cards to be
  started.  The base implementation does this for all child cards, appending
  them to `document.body`.
- `oasisURL` must now refer to the polyglot file `conductor.js-0.1.0.js.html`.
  This file does not need to end in `html` but it does need to be served with an
  html content type.

### 0.1.0
*15 July 2013*

Initial version.
